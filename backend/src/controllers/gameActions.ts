import { gameStateStore } from "../store/gameStateStore";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { findCardById } from "../data/card-registry";
import {
  getAvailableDecks as getAllDecks,
  getDeckById,
} from "../data/card-registry";

// Create a new game
export const createGame = (req: Request, res: Response): void => {
  try {
    const { player1Id, player2Id } = req.body;

    if (!player1Id || !player2Id) {
      res.status(400).json({ error: "Both player IDs are required" });
      return;
    }

    // Player 1 always goes first in this simplified version
    const firstPlayerId = player1Id;

    // Create a basic game with a circular board
    const gameState = gameStateStore.createGame(
      player1Id,
      player2Id,
      true,
      firstPlayerId
    );

    res.json(gameState);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game" });
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

    // Return board spaces, connections, and player positions
    res.json({
      spaces: gameState.gameBoard?.spaces || [],
      connections: gameState.gameBoard?.connections || {},
      playerPositions: gameState.playerPositions || {},
    });
  } catch (error) {
    console.error("Error getting game board:", error);
    res.status(500).json({ error: "Failed to get game board" });
  }
};

// Roll dice and move player - important for Culdcept-style movement
export const rollDice = (req: Request, res: Response): void => {
  try {
    const { gameId } = req.params;
    const playerId = req.headers["player-id"] as string;
    // Generate random roll if not provided
    const roll = req.body.roll || Math.floor(Math.random() * 6) + 1;

    if (!gameId || !playerId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    // Make sure it's the player's turn
    if (gameState.playerTurn !== playerId) {
      res.status(403).json({ error: "Not your turn" });
      return;
    }

    // Use the movePlayer method to handle movement
    const moveResult = gameStateStore.movePlayer(gameId, playerId, roll);

    if (!moveResult.success) {
      res.status(400).json({ error: "Failed to move player" });
      return;
    }

    // Use optional chaining to safely access the property
    res.json({
      success: true,
      roll,
      newPosition: moveResult.newPosition,
      spaceInfo: moveResult.spaceInfo,
      // Add a fallback if landedOnUnowned doesn't exist
      landedOnUnowned: moveResult.landedOnUnowned ?? false,
    });
  } catch (error) {
    console.error("Error rolling dice:", error);
    res.status(500).json({ error: "Failed to roll dice" });
  }
};

// Claim an unowned space - essential for Culdcept-style gameplay
export const claimSpace = (req: Request, res: Response): void => {
  try {
    const { gameId } = req.params;
    const playerId = req.headers["player-id"] as string;
    const { spaceId, cardId } = req.body;

    if (!gameId || !playerId || spaceId === undefined) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    // If cardId is provided, use card-based claiming
    if (cardId) {
      // Existing card-based claim logic
      const claimResult = gameStateStore.claimSpace(
        gameId,
        playerId,
        spaceId,
        cardId
      );

      if (!claimResult.success) {
        res.status(400).json({ error: claimResult.message });
        return;
      }

      res.json({
        success: true,
        message: "Space claimed successfully with card",
        spaceId,
        owner: playerId,
        unit: claimResult.unit,
      });
    } else {
      // New post-movement claiming logic (without a card)
      const gameState = gameStateStore.getGame(gameId);
      if (!gameState) {
        res.status(404).json({ error: "Game not found" });
        return;
      }

      // Verify it's the player's turn
      if (gameState.playerTurn !== playerId) {
        res.status(403).json({ error: "Not your turn" });
        return;
      }

      // Verify player is on this space
      if (gameState.playerPositions[playerId] !== spaceId) {
        res
          .status(400)
          .json({ error: "You can only claim the space you're on" });
        return;
      }

      // Update the space ownership directly
      const updatedSpaces = gameState.gameBoard.spaces.map((space) => {
        if (space.id === spaceId) {
          return { ...space, owner: playerId };
        }
        return space;
      });

      // Update game state with claimed space
      gameStateStore.updateGame(gameId, {
        gameBoard: {
          ...gameState.gameBoard,
          spaces: updatedSpaces,
        },
        // Update player's owned cells
        players: {
          ...gameState.players,
          [playerId]: {
            ...gameState.players[playerId],
            ownedCells: [
              ...(gameState.players[playerId].ownedCells || []),
              spaceId,
            ],
          },
        },
        // Add to game log
        gameLog: [
          ...(gameState.gameLog || []),
          `Player ${playerId} claimed space ${spaceId} after movement`,
        ],
      });

      res.json({
        success: true,
        message: "Space claimed successfully after movement",
        spaceId,
        owner: playerId,
      });
    }
  } catch (error) {
    console.error("Error claiming space:", error);
    res.status(500).json({ error: "Failed to claim space" });
  }
};

// Save game state
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

    const savesDir = path.join(__dirname, "..", "saves");
    if (!fs.existsSync(savesDir)) {
      fs.mkdirSync(savesDir, { recursive: true });
    }

    const savePath = path.join(savesDir, `${filename}.json`);
    fs.writeFileSync(savePath, JSON.stringify(gameState, null, 2));

    res.json({
      message: "Game saved successfully",
      path: savePath,
      gameId: gameId,
    });
  } catch (error) {
    console.error("Error saving game:", error);
    res.status(500).json({ error: "Failed to save game" });
  }
};

// Load saved game
export const loadGame = (req: Request, res: Response): void => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      res.status(400).json({ error: "Filename is required" });
      return;
    }

    const savePath = path.join(__dirname, "..", "saves", `${filename}.json`);

    if (!fs.existsSync(savePath)) {
      res.status(404).json({ error: "Saved game not found" });
      return;
    }

    const fileContent = fs.readFileSync(savePath, "utf8");
    const gameState = JSON.parse(fileContent);

    gameStateStore.updateGame(gameState.id, gameState);

    res.json({
      message: "Game loaded successfully",
      gameState: gameState,
    });
  } catch (error) {
    console.error("Error loading game:", error);
    res.status(500).json({ error: "Failed to load game" });
  }
};

// Get available decks (for future implementation)
export const getAvailableDecks = (req: Request, res: Response): void => {
  try {
    const decks = getAllDecks();
    res.json(decks);
  } catch (error) {
    console.error("Error getting available decks:", error);
    res.status(500).json({ error: "Failed to get available decks" });
  }
};

// Placeholder functions that will be implemented later

export const attackCard = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const drawCards = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const endTurn = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const getPlayerHand = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const updatePlayerDeck = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const equipGear = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const getPlayerInfo = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const discardCard = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const advancePhase = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const evolveCard = (req: Request, res: Response): void => {
  res.status(501).json({ message: "Not implemented yet" });
};
