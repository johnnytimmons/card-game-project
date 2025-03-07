import { allCards } from "../data/all-cards";

// Helper function to find a card by ID
export function findCardById(cardId: number) {
    return allCards.find(card => card.id === cardId);
  }

