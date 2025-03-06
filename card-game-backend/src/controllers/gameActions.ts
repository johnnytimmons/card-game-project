// controllers/gameActions.ts
import { Request, Response } from "express";
import { gameStateStore } from "../store/gameStateStore";
import { Position } from "../models/gameStateModel";

//--------------------------------------------------------------------------------------------

// Create a new game
export const createGame = (req: Request, res: Response) => {
    try {
      const { player1Id, player2Id, useSharedDeck } = req.body;
      
      if (!player1Id || !player2Id) {
        return res.status(400).json({ error: "Both player IDs are required" });
      }

       // Create a new game using our store
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
//--------------------------------------------------------------------------------------------

  // Get a game by ID
export const getGame = (req: Request, res: Response) => {
    try {
      const gameId = req.params.gameId;
      
      const gameState = gameStateStore.getGame(gameId);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      res.json(gameState);
    } catch (error) {
      console.error("Error getting game:", error);
      res.status(500).json({ error: "Failed to get game" });
    }
  };

  //------------------------------------------------------------------------------------------

  // Place a card on the board
export const placeCard = (req: Request, res: Response) => {
    try {
      const { gameId, cardId, position } = req.body;
      const playerId = req.headers['player-id'] as string;
      
      if (!gameId || !cardId || !position || !playerId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Place the card using our store (no need to find the card, store does it)
      const updatedGameState = gameStateStore.placeCard(
        gameId,
        playerId,
        cardId,
        position as Position
      );
      
      if (!updatedGameState) {
        return res.status(400).json({ error: "Failed to place card" });
      }
      
      res.json(updatedGameState);
    } catch (error) {
      console.error("Error placing card:", error);
      res.status(500).json({ error: "Failed to place card" });
    }
  };

  //------------------------------------------------------------------------------------------

  // Equip a gear card to a unit on the board
export const equipGearCard = (req: Request, res: Response) => {
    try {
      const { gameId, gearCardId, targetUnitPosition } = req.body;
      const playerId = req.headers['player-id'] as string;
      
      if (!gameId || !gearCardId || !targetUnitPosition || !playerId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Equip the gear using our store (no need to find the card, store does it)
      const updatedGameState = gameStateStore.equipGear(
        gameId,
        playerId,
        gearCardId,
        targetUnitPosition as Position
      );
      
      if (!updatedGameState) {
        return res.status(400).json({ error: "Failed to equip gear" });
      }
      
      res.json(updatedGameState);
    } catch (error) {
      console.error("Error equipping gear:", error);
      res.status(500).json({ error: "Failed to equip gear" });
    }
  };

  //--------------------------------------------------------------------------------------------

  // Attack a unit on the board
export const attackUnit = (req: Request, res: Response) => {
    try {
      const { gameId, attackerPosition, targetPosition } = req.body;
      const playerId = req.headers['player-id'] as string;
      
      if (!gameId || !attackerPosition || !targetPosition || !playerId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Attack the unit using our store
      const { gameState, result } = gameStateStore.attackUnit(
        gameId,
        playerId,
        attackerPosition as Position,
        targetPosition as Position
      );
      
      if (!gameState) {
        return res.status(400).json({ error: result.message });
      }
      
      // Return both the updated game state and combat result
      res.json({
        gameState,
        combat: result
      });
    } catch (error) {
      console.error("Error attacking unit:", error);
      res.status(500).json({ error: "Failed to attack unit" });
    }
  };
//----------------------------------------------------------------------------------------

  // Draw cards from deck
export const drawCards = (req: Request, res: Response) => {
    try {
      const { gameId, numCards } = req.body;
      const playerId = req.headers['player-id'] as string;
      
      if (!gameId || !playerId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Draw cards using our store
      const updatedGameState = gameStateStore.drawCardsFromDeck(
        gameId,
        playerId,
        numCards || 1
      );
      
      if (!updatedGameState) {
        return res.status(400).json({ error: "Failed to draw cards" });
      }
      
      res.json(updatedGameState);
    } catch (error) {
      console.error("Error drawing cards:", error);
      res.status(500).json({ error: "Failed to draw cards" });
    }
  };

  //----------------------------------------------------------------------------------------

  // End the current player's turn
export const endTurn = (req: Request, res: Response) => {
    try {
      const { gameId } = req.body;
      const playerId = req.headers['player-id'] as string;
      
      if (!gameId || !playerId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Get the game state to verify it's this player's turn
      const gameState = gameStateStore.getGame(gameId);
      
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      // Check if it's the player's turn
      if (gameState.playerTurn !== playerId) {
        return res.status(403).json({ error: "Not your turn" });
      }
      
      // Get player IDs
      const playerIds = Object.keys(gameState.players);
      if (playerIds.length !== 2) {
        return res.status(400).json({ error: "Invalid game state" });
      }
      
      // Get the next player's ID
      const currentPlayerIndex = playerIds.indexOf(playerId);
      const nextPlayerId = playerIds[(currentPlayerIndex + 1) % 2];
      
      // Update game state to next player's turn
      const updatedGameState = gameStateStore.updateGame(gameId, {
        playerTurn: nextPlayerId,
        turnNumber: gameState.turnNumber + 1
      });
      
      if (!updatedGameState) {
        return res.status(400).json({ error: "Failed to end turn" });
      }
      
      // Draw a card for the next player
      const finalGameState = gameStateStore.drawCardsFromDeck(gameId, nextPlayerId, 1);
      
      res.json(finalGameState || updatedGameState);
    } catch (error) {
      console.error("Error ending turn:", error);
      res.status(500).json({ error: "Failed to end turn" });
    }
  };
  
  //--------------------------------------------------------------------------------------------

  // Get player hand with detailed card info
export const getPlayerHand = (req: Request, res: Response) => {
    try {
      const gameId = req.params.gameId;
      const playerId = req.headers['player-id'] as string;
      
      if (!gameId || !playerId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const handWithDetails = gameStateStore.getPlayerHandWithDetails(gameId, playerId);
      
      if (!handWithDetails) {
        return res.status(404).json({ error: "Game or player not found" });
      }
      
      res.json(handWithDetails);
    } catch (error) {
      console.error("Error getting player hand:", error);
      res.status(500).json({ error: "Failed to get player hand" });
    }
  };

  //--------------------------------------------------------------------------------------------

  // Get board state with detailed card info
export const getBoardState = (req: Request, res: Response) => {
    try {
      const gameId = req.params.gameId;
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }
      
      const boardWithDetails = gameStateStore.getBoardWithDetails(gameId);
      
      if (!boardWithDetails) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      res.json(boardWithDetails);
    } catch (error) {
      console.error("Error getting board state:", error);
      res.status(500).json({ error: "Failed to get board state" });
    }
  };