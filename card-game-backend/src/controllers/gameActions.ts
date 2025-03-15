import { gameStateStore } from '../store/gameStateStore';
// /controllers/gameActions.ts
import fs from 'fs';
import path from 'path';
import { Request, Response } from "express";
import { getAvailableDecks as getDecks, getDeckById } from '../data/deck-types';
import { findCardById } from '../data/card-registry';
import { GameState, Position, PlayerState } from "../models/gameStateModel";
import { BoardCard } from "../models/cardModel";

// Place a card directly on the board
export function placeCardOnBoard(
  gameState: GameState,
  playerId: string,
  cardId: number,
  position: Position
): GameState {
  // Get the card from the registry
  const card = findCardById(cardId);
  if (!card) {
    throw new Error(`Card with ID ${cardId} not found`);
  }
  
  // Create a BoardCard with all required properties-------------------------------------
  const boardCard: BoardCard = {
    ...card,
    position: position,
    playerId: playerId,
    currentHealth: card.health || 0,
    damage: card.damage || 0, // Explicitly set damage to ensure it's not undefined
    isExhausted: true, // Cards are exhausted when first placed
    tempEffects: {}
  };

   // Add to the game board---------------------------------------------------------
   const updatedGameState = {
    ...gameState,
    board: [...gameState.board, boardCard]
  };
  
  // Remove from player's hand---------------------------------------------------
  const playerState = gameState.players[playerId];
  if (playerState) {
    updatedGameState.players = {
      ...gameState.players,
      [playerId]: {
        ...playerState,
        handCardIds: playerState.handCardIds.filter(id => id !== cardId)
      }
    };
  }
  
  console.log(`Player ${playerId} placed ${card.name} at position ${position.row},${position.col}`);
  return updatedGameState;
}

// UpdatePlayerDeck--------------------------------------------------------------------------------------------
export const updatePlayerDeck = (req: Request, res: Response): void => {
  try {
    // Log the exact params for debugging
    console.log("Route params:", req.params);
    
    // Get the gameId parameter
    let { gameId } = req.params;
    
    // Add the "game_" prefix if it's not already there
    if (!gameId.startsWith("game_")) {
      gameId = `game_${gameId}`;
    }

    console.log("Looking for game with ID:", gameId);
    
    const { deckId } = req.body;
    const playerId = req.headers['player-id'] as string;
    
    if (!gameId || !deckId || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    
    // Get the current game state
    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) {
      res.status(404).json({ error: `Game not found with ID: ${gameId}` });
      return;
    }
    
    // Get the deck by ID
    const deck = getDeckById(deckId);
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    
    // Check if player exists in this game
    const playerState = gameState.players[playerId];
    if (!playerState) {
      res.status(404).json({ error: "Player not found in this game" });
      return;
    }
    
    console.log(`Updating deck for player ${playerId} in game ${gameId} to ${deckId}`);
    
    // Create a new deck for the player from the selected deck type
    const cardObjects = deck.cards
      .map(cardId => findCardById(cardId))
      .filter(card => card !== undefined);
    
    // Shuffle the deck
    const shuffledCards = [...cardObjects].sort(() => Math.random() - 0.5);
    
    // Get card IDs
    const cardIds = shuffledCards.map(card => card?.id).filter(id => id !== undefined) as number[];
    
    // Split into hand and deck
    const handCards = cardIds.slice(0, 5);
    const deckCards = cardIds.slice(5);
    
    // Create a player state object that matches our PlayerState interface
    const updatedPlayerState: PlayerState = {
      ...playerState,
      handCardIds: handCards,
      deckCardIds: deckCards,
      deckType: deckId
    };
    
    // Update game state
    const updatedGameState = gameStateStore.updateGame(gameId, {
      players: {
        ...gameState.players,
        [playerId]: updatedPlayerState
      }
    });
    
    if (!updatedGameState) {
      res.status(500).json({ error: "Failed to update player deck" });
      return;
    }
    
    res.json(updatedGameState);
  } catch (error) {
    console.error("Error updating player deck:", error);
    res.status(500).json({ error: "Failed to update player deck" });
  }
};

// Save a game to a file----------------------------------------------------------------------
export const saveGame = (req: Request, res: Response): void => {
  try {
    const { gameId, filename } = req.body;
    
    if (!gameId || !filename) {
      res.status(400).json({ error: "Game ID and filename are required" });
      return;
    }
    
    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    
    const savesDir = path.join(__dirname, '..', 'saves');
    if (!fs.existsSync(savesDir)) {
      fs.mkdirSync(savesDir, { recursive: true });
    }
    
    const savePath = path.join(savesDir, `${filename}.json`);
    fs.writeFileSync(savePath, JSON.stringify(gameState, null, 2));
    
    res.json({ 
      message: "Game saved successfully", 
      path: savePath,
      gameId: gameId,
      lastUpdated: gameState.lastUpdated
    });
  } catch (error) {
    console.error("Error saving game:", error);
    res.status(500).json({ error: "Failed to save game" });
  }
};

// Load a game from a file--------------------------------------------------------------
export const loadGame = (req: Request, res: Response): void => {
  try {
    const filename = req.params.filename;
    
    if (!filename) {
      res.status(400).json({ error: "Filename is required" });
      return;
    }
    
    const savePath = path.join(__dirname, '..', 'saves', `${filename}.json`);
    
    if (!fs.existsSync(savePath)) {
      res.status(404).json({ error: "Saved game not found" });
      return;
    }
    
    const fileContent = fs.readFileSync(savePath, 'utf8');
    const gameState = JSON.parse(fileContent);
    
    gameStateStore.updateGame(gameState.id, gameState);
    
    res.json({ 
      message: "Game loaded successfully", 
      gameState: gameState 
    });
  } catch (error) {
    console.error("Error loading game:", error);
    res.status(500).json({ error: "Failed to load game" });
  }
};

// Create a new game
export const createGame = (req: Request, res: Response): void => {
  try {
    const { player1Id, player2Id, useSharedDeck } = req.body;
    
    if (!player1Id || !player2Id) {
      res.status(400).json({ error: "Both player IDs are required" });
      return;
    }

    const gameState = gameStateStore.createGame(
      player1Id, 
      player2Id,
      useSharedDeck ?? true
    );
    
    res.json(gameState);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
};

// Get available deck types
export const getAvailableDecks = (req: Request, res: Response): void => {
  try {
    const decks = getDecks();
    res.json(decks);
  } catch (error) {
    console.error("Error getting available decks:", error);
    res.status(500).json({ error: "Failed to get available decks" });
  }
};

// Get a game by ID
export const getGame = (req: Request, res: Response): void => {
  try {
    const gameId = req.params.gameId;
    
    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    
    res.json(gameState);
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({ error: "Failed to get game" });
  }
};

// Place a card on the board
export const placeCard = (req: Request, res: Response): void => {
  try {
    const { gameId, cardId, position } = req.body;
    const playerId = req.headers['player-id'] as string;
    
    if (!gameId || !cardId || !position || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    
    // Get the current game state--------------------------------------------------
    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    
    // Check if it's the player's turn--------------------------------------------------
    if (gameState.playerTurn !== playerId) {
      res.status(403).json({ error: "Not your turn" });
      return;
    }
    
    // Check if the player has the card in hand--------------------------------------------------
    const playerState = gameState.players[playerId];
    if (!playerState || !playerState.handCardIds.includes(cardId)) {
      res.status(400).json({ error: "Card not found in player's hand" });
      return;
    }
    
    // Check if the position is valid--------------------------------------------------
    if (position.row < 0 || position.row > 5 || position.col < 0 || position.col > 4) {
      res.status(400).json({ error: "Invalid position" });
      return;
    }
    
    // Check if the position is already occupied--------------------------------------------------
    const isPositionOccupied = gameState.board.some(
      card => card.position.row === position.row && card.position.col === position.col
    );
    
    if (isPositionOccupied) {
      res.status(400).json({ error: "Position is already occupied" });
      return;
    }
    
    // Place the card on the board--------------------------------------------------
    const updatedGameState = placeCardOnBoard(gameState, playerId, cardId, position);
    
    // Update the game in the store--------------------------------------------------
    const finalGameState = gameStateStore.updateGame(gameId, updatedGameState);
    
    res.json(finalGameState);
  } catch (error) {
    console.error("Error placing card:", error);
    res.status(500).json({ error: "Failed to place card" });
  }
};

// Attack a card on the board
export const attackCard = (req: Request, res: Response): void => {
  try {
    const { gameId, attackerPosition, targetPosition } = req.body;
    const playerId = req.headers['player-id'] as string;
    
    if (!gameId || !attackerPosition || !targetPosition || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    
    // Get the current game state
    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    
    // Check if it's the player's turn
    if (gameState.playerTurn !== playerId) {
      res.status(403).json({ error: "Not your turn" });
      return;
    }
    
    // Find the attacker and target cards
    const attacker = gameState.board.find(
      card => card.position.row === attackerPosition.row && 
              card.position.col === attackerPosition.col &&
              card.playerId === playerId
    );
    
    const target = gameState.board.find(
      card => card.position.row === targetPosition.row && 
              card.position.col === targetPosition.col &&
              card.playerId !== playerId
    );
    
    if (!attacker) {
      res.status(400).json({ error: "Attacker card not found" });
      return;
    }
    
    if (!target) {
      res.status(400).json({ error: "Target card not found" });
      return;
    }
    
    // Check if attacker is exhausted
    if (attacker.isExhausted) {
      res.status(400).json({ error: "This card has already attacked this turn" });
      return;
    }
    
    // Execute combat
    const result = gameStateStore.executeCombat(gameId, attacker, target);
    
    res.json(result);
  } catch (error) {
    console.error("Error attacking card:", error);
    res.status(500).json({ error: "Failed to attack card" });
  }
};

// Draw cards from deck
export const drawCards = (req: Request, res: Response): void => {
  try {
    const { gameId, numCards } = req.body;
    const playerId = req.headers['player-id'] as string;
    
    if (!gameId || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    
    const updatedGameState = gameStateStore.drawCardsFromDeck(
      gameId,
      playerId,
      numCards || 1
    );
    
    if (!updatedGameState) {
      res.status(400).json({ error: "Failed to draw cards" });
      return;
    }
    
    res.json(updatedGameState);
  } catch (error) {
    console.error("Error drawing cards:", error);
    res.status(500).json({ error: "Failed to draw cards" });
  }
};

// End the current player's turn
export const endTurn = (req: Request, res: Response): void => {
  try {
    const { gameId } = req.body;
    const playerId = req.headers['player-id'] as string;
    
    if (!gameId || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    
    const gameState = gameStateStore.getGame(gameId);
    
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    
    if (gameState.playerTurn !== playerId) {
      res.status(403).json({ error: "Not your turn" });
      return;
    }
    
    // Get player IDs
    const playerIds = Object.keys(gameState.players);
    if (playerIds.length !== 2) {
      res.status(400).json({ error: "Invalid game state" });
      return;
    }
    
    // Get the next player's ID
    const currentPlayerIndex = playerIds.indexOf(playerId);
    const nextPlayerId = playerIds[(currentPlayerIndex + 1) % 2];
    

        // Reset exhaustion for next player's cards
    const refreshedBoard = gameState.board.map(card => {
      if (card.playerId === nextPlayerId) {
        return { ...card, isExhausted: false };
      }
      return card;
    });
    
    // Update game state
    const updatedGameState = gameStateStore.updateGame(gameId, {
      playerTurn: nextPlayerId,
      turnNumber: gameState.turnNumber + 1,
      board: refreshedBoard
    });
    
    if (!updatedGameState) {
      res.status(400).json({ error: "Failed to end turn" });
      return;
    }
    
     // Automatically draw a card for the next player
     const finalGameState = gameStateStore.drawCardsFromDeck(
      gameId,
      nextPlayerId,
      1
    );
    
    res.json(finalGameState || updatedGameState);
  } catch (error) {
    console.error("Error ending turn:", error);
    res.status(500).json({ error: "Failed to end turn" });
  }
};

// Get player hand with detailed card info
export const getPlayerHand = (req: Request, res: Response): void => {
  try {
    const gameId = req.params.gameId;
    const playerId = req.headers['player-id'] as string;
    
    if (!gameId || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    
    const handWithDetails = gameStateStore.getPlayerHandWithDetails(gameId, playerId);
    
    if (!handWithDetails) {
      res.status(404).json({ error: "Game or player not found" });
      return;
    }
    
    res.json(handWithDetails);
  } catch (error) {
    console.error("Error getting player hand:", error);
    res.status(500).json({ error: "Failed to get player hand" });
  }
};

// Get board state
export const getBoardState = (req: Request, res: Response): void => {
  try {
    const gameId = req.params.gameId;
    
    if (!gameId) {
      res.status(400).json({ error: "Game ID is required" });
      return;
    }
    
    const gameState = gameStateStore.getGame(gameId);
    
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    
    res.json(gameState.board);
  } catch (error) {
    console.error("Error getting board state:", error);
    res.status(500).json({ error: "Failed to get board state" });
  }
};