// data/card-registry.ts

import { Card, GearCard } from "../models/cardModel";

// Define a Deck interface
export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: number[]; // Array of card IDs
}

// Sample card data - replace this with your actual card database
const cardDatabase: Card[] = [
  {
    cardId: 1,
    name: "Wehrmacht Infantry",
    type: "Unit",
    damage: 3,
    health: 3,
    description: "Standard German infantry unit",
    abilities: ["Quick Deploy"],
  },
  {
    cardId: 2,
    name: "Allied Soldier",
    type: "Unit",
    damage: 2,
    health: 4,
    description: "Resilient allied forces",
    abilities: ["Endurance"],
  },
  {
    cardId: 3,
    name: "Occult Officer",
    type: "Unit",
    damage: 4,
    health: 2,
    description: "Nazi occult research division",
    abilities: ["Dark Ritual"],
  },
  // Add more cards as needed
];

// Sample deck data
const deckDatabase: Deck[] = [
  {
    id: "standard",
    name: "Standard Deck",
    description: "A balanced mix of military and occult units",
    cards: [1, 2, 3], // IDs of cards in this deck
  },
  {
    id: "military",
    name: "Military Might",
    description: "Focused on strong military units and tactics",
    cards: [1, 2], // IDs of military-themed cards
  },
  {
    id: "occult",
    name: "Occult Powers",
    description: "Harness dark occult forces from the war",
    cards: [3], // IDs of occult-themed cards
  },
];

// Function to find a card by ID
export function findCardById(cardId: number): Card | undefined {
  return cardDatabase.find((card) => card.cardId === cardId);
}

// Function to find a deck by ID
export function getDeckById(deckId: string): Deck | undefined {
  return deckDatabase.find((deck) => deck.id === deckId);
}

// Function to get all available decks
export function getAvailableDecks(): Deck[] {
  return deckDatabase;
}

// Get all cards
export const allCards = cardDatabase;

// Get a filtered subset of cards by type
export function getCardsByType(type: string): Card[] {
  return cardDatabase.filter((card) => card.type === type);
}
