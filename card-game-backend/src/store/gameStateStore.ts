import { GameState, PlacedCard, Position } from '../models/gameStateModel';
import { UnitCard, GearCard } from "../models/cardModel";
import { EquippedUnit, createEquippedUnit } from "../models/attachmentModel";
import { equipGear } from "../utils/gearUtils";
import { shuffleDeck } from "../controllers/cardController"; // Import shuffleDeck
import { allCards } from "../data/all-cards"; // Import allCards
import { findCardById } from '../utils/findCardById';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage
const gameStates: Map<string, GameState> = new Map();

// Helper function to convert card objects to card IDs
const getCardIds = (cards: any[]) => cards.map(card => card.id);

// Helper to check if a card is a unit card
const isUnitCard = (card: any): card is UnitCard => {
  return card && (
    card.type === 'Hero' || 
    card.type === 'Unit' || 
    card.type === 'Creature' || 
    card.type === 'Automaton'
  );
};

// Helper to check if a card is a gear card
const isGearCard = (card: any): card is GearCard => {
  return card && (
    card.type === 'Defense' || 
    card.type === 'Weapon' || 
    card.type === 'Movement' || 
    card.type === 'Heal'
  );
};

export const gameStateStore = {
  // Create a new game with players
  createGame: (
    player1Id: string, 
    player2Id: string,
    useSharedDeck: boolean = false
  ): GameState => {
    const gameId = uuidv4();
    
    // Create and shuffle a deck for each player
    let player1Cards, player2Cards;
    
    if (useSharedDeck) {
      // Shuffle the entire deck and split between players
      const shuffledDeck = shuffleDeck(allCards);
      const halfDeckSize = Math.floor(shuffledDeck.length / 2);
      
      player1Cards = shuffledDeck.slice(0, halfDeckSize);
      player2Cards = shuffledDeck.slice(halfDeckSize);
    } else {
      // Use separate copies of the deck for each player
      player1Cards = shuffleDeck([...allCards]);
      player2Cards = shuffleDeck([...allCards]);
    }
    
    // Convert to card IDs
    const player1CardIds = getCardIds(player1Cards);
    const player2CardIds = getCardIds(player2Cards);
    
    // Draw initial hands (5 cards each)
    const player1Hand = player1CardIds.slice(0, 5);
    const player1Deck = player1CardIds.slice(5);
    
    const player2Hand = player2CardIds.slice(0, 5);
    const player2Deck = player2CardIds.slice(5);
    
    // Create the initial game state
    const gameState: GameState = {
      id: gameId,
      playerTurn: player1Id, // Player 1 goes first
      players: {
        [player1Id]: {
          handCardIds: player1Hand,
          deckCardIds: player1Deck,
          health: 30 // Starting health
        },
        [player2Id]: {
          handCardIds: player2Hand,
          deckCardIds: player2Deck,
          health: 30 // Starting health
        }
      },
      board: [], // Start with an empty board
      turnNumber: 1,
      lastUpdated: new Date()
    };
    
    // Store the game state
    gameStates.set(gameId, gameState);
    
    return gameState;
  },

   // Draw cards from a player's deck
   drawCardsFromDeck: (
    gameId: string,
    playerId: string,
    numCards: number = 1
  ): GameState | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) return undefined;
    
    const playerState = gameState.players[playerId];
    if (!playerState) return undefined;
    
    // Calculate how many cards we can actually draw
    const availableCards = Math.min(numCards, playerState.deckCardIds.length);
    
    if (availableCards === 0) return gameState; // No cards to draw
    
    // Draw cards from the deck
    const drawnCards = playerState.deckCardIds.slice(0, availableCards);
    const remainingDeck = playerState.deckCardIds.slice(availableCards);
    
    // Update player's hand and deck
    const updatedPlayerState = {
      ...playerState,
      handCardIds: [...playerState.handCardIds, ...drawnCards],
      deckCardIds: remainingDeck
    };

    // Update game state
    const updatedGameState: GameState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: updatedPlayerState
      },
      lastUpdated: new Date()
    };
    
    // Save the updated game state
    gameStates.set(gameId, updatedGameState);
    
    return updatedGameState;
  },

  // Shuffle a player's deck
  shufflePlayerDeck: (
    gameId: string,
    playerId: string
  ): GameState | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) return undefined;
    
    const playerState = gameState.players[playerId];
    if (!playerState) return undefined;
    
    // Shuffle the deck using the shuffleDeck function
    const shuffledDeckIds = [...playerState.deckCardIds].sort(() => Math.random() - 0.5);
    
    // Update player's deck
    const updatedPlayerState = {
      ...playerState,
      deckCardIds: shuffledDeckIds
    };
    
    // Update game state
    const updatedGameState: GameState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: updatedPlayerState
      },
      lastUpdated: new Date()
    };
    
    // Save the updated game state
    gameStates.set(gameId, updatedGameState);
    
    return updatedGameState;
  },

   // Get a game state
   getGame: (gameId: string): GameState | undefined => {
    return gameStates.get(gameId);
  },
  
  // Update a game state
  updateGame: (gameId: string, updatedState: Partial<GameState>): GameState | undefined => {
    const currentState = gameStates.get(gameId);
    if (!currentState) return undefined;
    
    const newState: GameState = {
      ...currentState,
      ...updatedState,
      lastUpdated: new Date()
    };
    
    gameStates.set(gameId, newState);
    return newState;
  },

  // Place a card on the board - simplified with findCardById
  placeCard: (
    gameId: string,
    playerId: string,
    cardId: number,
    position: Position
  ): GameState | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) return undefined;
    
    // Check if it's the player's turn
    if (gameState.playerTurn !== playerId) return undefined;
    
    // Check if the player has the card in hand
    const playerState = gameState.players[playerId];
    if (!playerState || !playerState.handCardIds.includes(cardId)) {
      return undefined;
    }
    
    // Find the card data using findCardById
    const cardData = findCardById(cardId);
    if (!cardData) return undefined;
    
    // Check if it's a unit card
    if (!isUnitCard(cardData)) {
      return undefined; // Only unit cards can be placed directly
    }
    
    // Check if the position is already occupied
    const isPositionTaken = gameState.board.some(
      card => card.position.row === position.row && card.position.col === position.col
    );
    if (isPositionTaken) return undefined;
    
    // Create an equipped unit from the unit card
    const equippedUnit = createEquippedUnit(cardData);
    
    // Create a new placed card
    const placedCard: PlacedCard = {
      cardId,
      position,
      playerId,
      equippedUnit
    };
    
    // Update the game state
    const updatedGameState: GameState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: {
          ...playerState,
          // Remove the card from the player's hand
          handCardIds: playerState.handCardIds.filter(id => id !== cardId)
        }
      },
      board: [...gameState.board, placedCard],
      lastUpdated: new Date()
    };
    
    // Save the updated game state
    gameStates.set(gameId, updatedGameState);
    
    return updatedGameState;
  },
  
  // Equip a gear card to a unit - simplified with findCardById
  equipGear: (
    gameId: string,
    playerId: string,
    gearCardId: number,
    targetPosition: Position
  ): GameState | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) return undefined;
    
    // Check if it's the player's turn
    if (gameState.playerTurn !== playerId) return undefined;
    
    // Check if the player has the gear card in hand
    const playerState = gameState.players[playerId];
    if (!playerState || !playerState.handCardIds.includes(gearCardId)) {
      return undefined;
    }
    
    // Find the gear card data using findCardById
    const gearCardData = findCardById(gearCardId);
    if (!gearCardData || !isGearCard(gearCardData)) {
      return undefined; // Not a valid gear card
    }
    
    // Find the target unit on the board
    const targetCardIndex = gameState.board.findIndex(
      card => card.position.row === targetPosition.row && 
              card.position.col === targetPosition.col &&
              card.playerId === playerId  // Can only equip gear to your own units
    );
    
    if (targetCardIndex === -1) return undefined;
    
    // Get the placed card
    const placedCard = gameState.board[targetCardIndex];
    
    // Apply the gear effect
    const updatedUnit = equipGear(placedCard.equippedUnit, gearCardData);
    
    // Update the game state
    const updatedGameState: GameState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: {
          ...playerState,
          // Remove the gear card from hand
          handCardIds: playerState.handCardIds.filter(id => id !== gearCardId)
        }
      },
      board: gameState.board.map((card, index) => 
        index === targetCardIndex 
          ? { ...card, equippedUnit: updatedUnit }
          : card
      ),
      lastUpdated: new Date()
    };
    
    // Save the updated game state
    gameStates.set(gameId, updatedGameState);
    
    return updatedGameState;
  },
  
  // Attack a unit on the board - using findCardById for better debugging info
  attackUnit: (
    gameId: string,
    playerId: string,
    attackerPosition: Position,
    targetPosition: Position
  ): {
    gameState: GameState | undefined;
    result: {
      success: boolean;
      message: string;
      damageDealt?: number;
      defenderDefeated?: boolean;
    };
  } => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { 
        gameState: undefined, 
        result: { success: false, message: "Game not found" } 
      };
    }
    
    // Check if it's the player's turn
    if (gameState.playerTurn !== playerId) {
      return { 
        gameState, 
        result: { success: false, message: "Not your turn" }
      };
    }
    
    // Find the attacker unit
    const attackerIndex = gameState.board.findIndex(
      card => card.position.row === attackerPosition.row && 
              card.position.col === attackerPosition.col &&
              card.playerId === playerId // Can only attack with your own units
    );
    
    if (attackerIndex === -1) {
      return { 
        gameState, 
        result: { success: false, message: "Attacker unit not found" }
      };
    }
    
    // Find the target unit
    const targetIndex = gameState.board.findIndex(
      card => card.position.row === targetPosition.row && 
              card.position.col === targetPosition.col &&
              card.playerId !== playerId // Can only attack opponent's units
    );
    
    if (targetIndex === -1) {
      return { 
        gameState, 
        result: { success: false, message: "Target unit not found or not an enemy unit" }
      };
    }
    
    // Get the units
    const attacker = gameState.board[attackerIndex].equippedUnit;
    const defender = gameState.board[targetIndex].equippedUnit;
    
    // Get card names for better battle log (using findCardById)
    const attackerCard = findCardById(gameState.board[attackerIndex].cardId);
    const defenderCard = findCardById(gameState.board[targetIndex].cardId);
    const attackerName = attackerCard?.name || "Unknown Unit";
    const defenderName = defenderCard?.name || "Unknown Unit";
    
    // Calculate damage based on attacker's damage and defender's defense
    const actualDamage = Math.max(1, attacker.effectiveDamage - defender.defense);
    
    // Calculate defender's remaining health
    const defenderRemainingHealth = Math.max(0, defender.effectiveHealth - actualDamage);
    
    // Update the defender's health
    const updatedDefender = {
      ...defender,
      effectiveHealth: defenderRemainingHealth
    };
    
    // Check if the defender is defeated
    const defenderDefeated = defenderRemainingHealth <= 0;
    
    // Update the game state
    let updatedBoard;
    
    if (defenderDefeated) {
      // Remove the defeated unit from the board
      updatedBoard = gameState.board.filter((_, index) => index !== targetIndex);
    } else {
      // Update the defender's health
      updatedBoard = gameState.board.map((card, index) =>
        index === targetIndex
          ? { ...card, equippedUnit: updatedDefender }
          : card
      );
    }
    
    const updatedGameState: GameState = {
      ...gameState,
      board: updatedBoard,
      lastUpdated: new Date()
    };
    
    // Save the updated game state
    gameStates.set(gameId, updatedGameState);
    
    // Return the result
    return {
      gameState: updatedGameState,
      result: {
        success: true,
        message: defenderDefeated
          ? `${attackerName} attacked and defeated ${defenderName}!`
          : `${attackerName} attacked ${defenderName} for ${actualDamage} damage!`,
        damageDealt: actualDamage,
        defenderDefeated
      }
    };
  },
  
  // Get full card information for all cards in a player's hand
  getPlayerHandWithDetails: (gameId: string, playerId: string) => {
    const gameState = gameStates.get(gameId);
    if (!gameState) return undefined;
    
    const playerState = gameState.players[playerId];
    if (!playerState) return undefined;
    
    // Map card IDs to full card details using findCardById
    return playerState.handCardIds.map(id => findCardById(id)).filter(card => card !== undefined);
  },
  
  // Get details about cards on the board
  getBoardWithDetails: (gameId: string) => {
    const gameState = gameStates.get(gameId);
    if (!gameState) return undefined;
    
    // Return board with detailed card information
    return gameState.board.map(boardCard => ({
      ...boardCard,
      cardDetails: findCardById(boardCard.cardId)
    }));
  }
};