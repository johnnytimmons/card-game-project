import express from "express";
import {
  createGame,
  getGame,
  getBoardState,
  claimSpace,
  saveGame,
  loadGame,
} from "../controllers/gameActions";

const router = express.Router();

// Game creation and retrieval
router.post("/create", createGame); // Create a new game
router.post("/save", saveGame); // Save a game to file
router.get("/load/:filename", loadGame); // Load a game from file

// Basic game functionality
router.get("/:gameId", getGame); // Get current game state
router.get("/:gameId/board", getBoardState); // Get board state
router.post("/:gameId/claim-space", claimSpace); // Claim a space on the board

export default router;
