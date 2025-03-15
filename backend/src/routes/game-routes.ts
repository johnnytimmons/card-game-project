import express from "express";

import { 
  createGame, 
  getGame, 
  placeCard, 
  attackCard,  // Add this import
  drawCards, 
  endTurn,
  getPlayerHand,
  getBoardState,
  saveGame,
  loadGame,
  getAvailableDecks,
  updatePlayerDeck
} from "../controllers/gameActions";

  const router = express.Router();


  // Deck operations
router.get("/decks", getAvailableDecks);  // Get available deck types


  // Game creation and retrieval
  router.post("/create", createGame);      // Create a new game
  router.post("/save", saveGame);           // Save a game to file
 
  
// Game actions
router.post("/place-card", placeCard);    // Place a card on the board
router.post("/attack-card", attackCard);
router.post("/draw-cards", drawCards);    // Draw cards from deck
router.post("/end-turn", endTurn);        // End the current turn
router.get("/load/:filename", loadGame);  // Load a game from file
// Routes with gameId parameter - should come AFTER specific routes
router.get("/:gameId", getGame);          // Get a game by ID
router.get("/:gameId/hand", getPlayerHand);  // Get player's hand
router.get("/:gameId/board", getBoardState); // Get board state
router.post("/:gameId/player/deck", updatePlayerDeck);

// Equipment mechanics (if needed)
//router.post("/equip-gear", equipGear);       // Equip gear to a unit
//router.post("/unequip-gear", unequipGear);   // Remove gear from a unit

export default router;