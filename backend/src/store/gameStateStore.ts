// store/gameStateStore.ts
import { GameState, PlayerState, Position } from "../models/gameStateModel";
import { BoardCard, Card } from "../models/cardModel";
import { findCardById } from "../data/card-registry";
import { getDeckById } from "../data/deck-types";

// In-memory store for game states
const gameStates = new Map<string, GameState>();

// Create a combat utility function
function executeCombatLogic(attacker: BoardCard, defender: BoardCard, gameState: GameState) {
   // Calculate damage (using attacker's damage stat)
   const attackerDamage = attacker.damage || 0;
  
  // Apply damage to defender
  const defenderStartHealth = defender.currentHealth;
  const newDefenderHealth = Math.max(0, defenderStartHealth - attackerDamage);
  defender.currentHealth = newDefenderHealth;
  
  // Determine if defender is defeated
  const defenderDefeated = newDefenderHealth <= 0;
  
  // Create combat log entries
  const combatLog = [
    `${attacker.name} attacks ${defender.name} for ${attackerDamage} damage.`,
    `${defender.name}'s health: ${defenderStartHealth} → ${newDefenderHealth}`
  ];
  
  if (defenderDefeated) {
    combatLog.push(`${defender.name} is defeated!`);
  }
  
  // Return combat results
  return {
    attackerDefeated: false, // We're not implementing counterattack here
    defenderDefeated,
    attackerDamage: 0, // No damage to attacker in this simple model
    defenderDamage: attackerDamage,
    combatLog
  };
}

// Export the gameStateStore object with all required methods
export const gameStateStore = {
  // Method 1: Get a game by ID
  getGame: (gameId: string): GameState | undefined => {
    return gameStates.get(gameId);
  },
  
   // Method 2: Update an existing game
   updateGame: (gameId: string, updates: Partial<GameState>): GameState => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    // Create updated game state with new timestamp
    const updatedGameState = { 
      ...gameState, 
      ...updates,
      lastUpdated: new Date() 
    };
    
    // Store the updated state
    gameStates.set(gameId, updatedGameState);
    
    return updatedGameState;
  },
  
  // Method 3: Handle combat between cards
  executeCombat: (
    gameId: string,
    attacker: BoardCard,
    defender: BoardCard
  ) => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { success: false, message: "Game not found" };
    }
    
    // Execute combat using our combat logic helper
    const result = executeCombatLogic(attacker, defender, gameState);
    
    // Update the game state based on combat results
    let updatedBoard = [...gameState.board];
    
    // Handle defender defeat if necessary
    if (result.defenderDefeated) {
      // Remove defeated card from the board
      updatedBoard = updatedBoard.filter(card => 
        !(card.position.row === defender.position.row && 
          card.position.col === defender.position.col));
    } else {
      // Update defender's health
      updatedBoard = updatedBoard.map(card => {
        if (card.position.row === defender.position.row && 
            card.position.col === defender.position.col) {
          return { ...card, currentHealth: defender.currentHealth };
        }
        return card;
      });
    }
    
    // Mark attacker as exhausted after attacking
    updatedBoard = updatedBoard.map(card => {
      if (card.position.row === attacker.position.row && 
          card.position.col === attacker.position.col) {
        return { 
          ...card, 
          isExhausted: true 
        };
      }
      return card;
    });
    
    // Update game state with new board and combat log
    const updatedGameState = {
      ...gameState,
      board: updatedBoard,
      gameLog: [...(gameState.gameLog || []), ...result.combatLog]
    };
    
    // Save the updated state
    gameStates.set(gameId, updatedGameState);
    
    // Return success result with updated game state
    return {
      success: true,
      gameState: updatedGameState,
      combat: result
    };
  },
  
  // Method 4: Create a new game
  createGame: (
    player1Id: string, 
    player2Id: string,
    useSharedDeck: boolean = true
  ): GameState => {
    // Generate a unique game ID
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create initial player states
    const player1State: PlayerState = {
      handCardIds: [],
      deckCardIds: [],
      health: 20
    };
    
    const player2State: PlayerState = {
      handCardIds: [],
      deckCardIds: [],
      health: 20
    };
    
    // Create the initial game state
    const gameState: GameState = {
      id: gameId,
      playerTurn: player1Id, // Player 1 goes first
      players: {
        [player1Id]: player1State,
        [player2Id]: player2State
      },
      board: [],
      turnNumber: 1,
      lastUpdated: new Date(),
      gameLog: [`Game created. Players: ${player1Id} vs ${player2Id}`]
    };

    // Setup decks for both players
    if (useSharedDeck) {
      // Get a shared deck and distribute cards
      const sharedDeck = getDeckById("standard");
      if (sharedDeck && sharedDeck.cards) {
        // Get card IDs from the deck
        const shuffledDeck = [...sharedDeck.cards].sort(() => Math.random() - 0.5);

        // Distribute cards (half to each player)
    const halfIndex = Math.floor(shuffledDeck.length / 2);
    player1State.deckCardIds = shuffledDeck.slice(0, halfIndex);
    player2State.deckCardIds = shuffledDeck.slice(halfIndex);
        
        // Draw initial hands (e.g., 5 cards each)
        for (let i = 0; i < 5; i++) {
          if (player1State.deckCardIds.length > 0) {
            const card = player1State.deckCardIds.shift();
            if (card) player1State.handCardIds.push(card);
          }
          
          if (player2State.deckCardIds.length > 0) {
            const card = player2State.deckCardIds.shift();
            if (card) player2State.handCardIds.push(card);
          }
        }
      }
    } else {
      // Players use separate deck types - you can extend this part
      // based on your game's deck system
      gameState.gameLog.push("Using separate decks is not yet implemented.");
    }
    
    // Store the game state
    gameStates.set(gameId, gameState);
    
    return gameState;
  },
  
  // Method 5: Draw cards from a player's deck
  drawCardsFromDeck: (
    gameId: string,
    playerId: string,
    numCards: number = 1
  ): GameState | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return undefined;
    }
    
    const playerState = gameState.players[playerId];
    if (!playerState) {
      return undefined;
    }
    
    // Determine how many cards we can actually draw
    const cardsToDrawCount = Math.min(numCards, playerState.deckCardIds.length);
    
    if (cardsToDrawCount === 0) {
      // No cards to draw - could implement "fatigue" damage here if desired
      gameState.gameLog.push(`Player ${playerId} attempted to draw but has no cards left!`);
      gameStates.set(gameId, {
        ...gameState,
        lastUpdated: new Date()
      });
      return gameState;
    }
    
    // Get the cards to draw
    const drawnCards = playerState.deckCardIds.slice(0, cardsToDrawCount);
    
    // Update player's hand and deck
    const updatedPlayerState = {
      ...playerState,
      handCardIds: [...playerState.handCardIds, ...drawnCards],
      deckCardIds: playerState.deckCardIds.slice(cardsToDrawCount)
    };
    
    // Update game state
    const updatedGameState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: updatedPlayerState
      },
      gameLog: [...gameState.gameLog, `Player ${playerId} drew ${drawnCards.length} card(s)`],
      lastUpdated: new Date()
    };
    
    // Save the updated state
    gameStates.set(gameId, updatedGameState);
    
    return updatedGameState;
  },
  
  // Method 6: Get detailed card info for a player's hand
  getPlayerHandWithDetails: (
    gameId: string,
    playerId: string
  ): Card[] | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return undefined;
    }
    
    const playerState = gameState.players[playerId];
    if (!playerState) {
      return undefined;
    }
    
    // Get detailed info for each card in hand
    const handWithDetails = playerState.handCardIds
      .map(cardId => findCardById(cardId))
      .filter((card): card is Card => card !== undefined);
    
    return handWithDetails;
  }
};