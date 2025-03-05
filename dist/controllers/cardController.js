"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCards = exports.shuffleDeckHandler = exports.shuffleDeck = exports.getCards = void 0;
const all_cards_1 = require("../data/all-cards");
// Function to return all cards
const getCards = (req, res) => {
    res.json(all_cards_1.allCards);
};
exports.getCards = getCards;
// Function to shuffle the entire deck
const shuffleDeck = (deck = all_cards_1.allCards) => {
    return [...deck].sort(() => Math.random() - 0.5);
};
exports.shuffleDeck = shuffleDeck;
// Endpoint to shuffle and return the entire deck
const shuffleDeckHandler = (req, res) => {
    const shuffledDeck = (0, exports.shuffleDeck)();
    res.json(shuffledDeck);
};
exports.shuffleDeckHandler = shuffleDeckHandler;
// Function to shuffle the deck and draw a specified number of cards
const drawCards = (req, res) => {
    const numCards = parseInt(req.query.numCards) || 5; // Get numCards from the query parameter, default to 5
    const shuffledDeck = (0, exports.shuffleDeck)(); // Shuffle the deck
    const drawnCards = shuffledDeck.slice(0, numCards); // Draw the requested number of cards
    res.json(drawnCards); // Return the drawn cards in the response
};
exports.drawCards = drawCards;
