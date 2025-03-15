// data/card-registry.ts
import { 
  Card, 
  BoardCard, 
  SpellCard, 
  GearCard,
  CardOrigin,
  CardPower
} from "../models/cardModel";
import dreamWispEntityGroup from "./kindred/dream-entities";

// Create an array of all entity groups for easier iteration
const entityGroups = [
    dreamWispEntityGroup,
    //memoryEntityGroup,
    //promiseEntityGroup
    // Add new groups here as you create them
  ];


  // Collect all cards by type using the entity groups array
  export const handCards = entityGroups.flatMap(group => group.getHandCards());
  export const spellCards = entityGroups.flatMap(group => group.getSpells());
  export const gearCards = entityGroups.flatMap(group => group.getGear());
  export const boardCards = entityGroups.flatMap(group => group.getBoardCards());
 
// Combined collection remains the same
export const allCards: Card[] = [
    ...handCards,
    ...spellCards,
    ...gearCards
  ];

  // Helper Function to get all cards with a specific ability---------------------------------------
export function getCardsByAbility(abilityName: string): Card[] {
    return allCards.filter(card => {
      if (typeof card.abilities === 'string') {
        return card.abilities === abilityName;
      } else if (Array.isArray(card.abilities)) {
        return card.abilities.includes(abilityName);
      }
      return false;
    });
  }

  // Helper function to get counts of each card type------------------------------------------------
  export function getCardCounts() {
    return {
        units: handCards.length,
        spells: spellCards.length,
        gear: gearCards.length,
        boards: boardCards.length,
        total: allCards.length
    };
}

  // Helper function to find a card by ID ------------------------------------------------------------
export function findCardById(cardId: number) {
    return allCards.find(card => card.id === cardId);
  }

  // Helper function to get counts by origin------------------------------------------------------------
export function getCardCountsByOrigin() {
    const counts: Record<string, number> = {};
    
    allCards.forEach(card => {
      if (card.origin) {
        counts[card.origin] = (counts[card.origin] || 0) + 1;
      }
    });
    return counts;
  }

  // Helper function to get all evolution relationships ------------------------------------------------------------
export function getEvolutionPairs(): {base: Card, evolved: Card}[] {
    const pairs = [];
    for (const card of handCards) {
      if (card.evolution?.canEvolve && card.evolution.evolvesToId) {
        const evolved = handCards.find(c => c.id === card.evolution?.evolvesToId);
        if (evolved) {
          pairs.push({ base: card, evolved });
        }
      }
    }
    return pairs;
  }

  // Helper function to get all cards of a specific entity-----------------------------------------------------
export function getEntityCards(name: string, origin: string) {
    const handCard = handCards.find(card => card.name === name && card.origin === origin);
    const spell = spellCards.find(card => card.name === name && card.origin === origin);
    const gear = gearCards.find(card => card.name === name && card.origin === origin);
    const boardCard = boardCards.find(card => card.name === name && card.origin === origin);
    
    return { handCard, spell, gear, boardCard };
  }

  // Helper function to get the evolved form of a card
export function getEvolvedForm(cardId: number) {
    const card = handCards.find(c => c.id === cardId);
    if (card?.evolution?.canEvolve && card.evolution.evolvesToId) {
      return handCards.find(c => c.id === card.evolution?.evolvesToId);
    }
    return undefined;
  }