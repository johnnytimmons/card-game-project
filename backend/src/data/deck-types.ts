// data/deck-types.ts
import { handCards, gearCards, spellCards, boardCards, allCards } from "./card-registry";

export interface DeckType {
    id: string;
    name: string;
    description: string;
    cards: number[];
}

//Function to get card Ids from a card array
const getCardIds = (cards: any[]) => cards.map(card => card.id);

//Define available deck types
export const deckTypes: DeckType[] = [
    {
        id: "standard",
    name: "Standard Deck",
    description: "A balanced mix of units and gear",
    cards: getCardIds(allCards)
    },
    {
        id: "units-only",
        name: "Units Only",
        description: "Only unit cards, no gear",
        cards: getCardIds(handCards)
      }
]

//Function to get a deck by ID
export function getDeckById(deckId: string): DeckType | undefined {
    return deckTypes.find(deck => deck.id === deckId);
  }

  // Function to get all available decks (without the cards array to reduce payload)
export function getAvailableDecks(): Omit<DeckType, "cards">[] {
    return deckTypes.map(({ id, name, description }) => ({
      id,
      name,
      description
    }));
  }