import { Request, Response } from "express";
import { allCards } from "../data/all-cards";

// Function to return all cards
export const getCards = (req: Request, res: Response) => {
    res.json(allCards);
};

// Function to shuffle the entire deck
export const shuffleDeck = (deck = allCards) => {
    return [...deck].sort(() => Math.random() - 0.5);
};

// Endpoint to shuffle and return the entire deck
export const shuffleDeckHandler = (req: Request, res: Response) => {
    const shuffledDeck = shuffleDeck();
    res.json(shuffledDeck);
};

// Function to shuffle the deck and draw a specified number of cards
export const drawCards = (req: Request, res: Response) => {
    const numCards = parseInt(req.query.numCards as string) || 5; // Get numCards from the query parameter, default to 5
    const shuffledDeck = shuffleDeck(); // Shuffle the deck
    const drawnCards = shuffledDeck.slice(0, numCards); // Draw the requested number of cards
    res.json(drawnCards); // Return the drawn cards in the response
};
