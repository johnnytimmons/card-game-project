import { Request, Response } from "express";
import { allCards } from "../data/card-registry";
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

