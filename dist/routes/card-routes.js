"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cardController_1 = require("../controllers/cardController");
const router = express_1.default.Router();
router.get("/allCards", cardController_1.getCards); // Get all cards
router.get("/shuffle", cardController_1.shuffleDeckHandler); // Shuffle full deck
router.get("/draw-cards", cardController_1.drawCards); // Draw cards
exports.default = router;
