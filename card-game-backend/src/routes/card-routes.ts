import express from "express";
import { getCards, shuffleDeckHandler, drawCards } from "../controllers/cardController";

const router = express.Router();

router.get("/allCards", getCards); // Get all cards
router.get("/shuffle", shuffleDeckHandler); // Shuffle full deck
router.get("/draw-cards", drawCards); // Draw cards

export default router;