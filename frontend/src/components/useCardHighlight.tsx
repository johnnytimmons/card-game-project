// components/useCardHighlight.tsx
import { useState, useEffect } from "react";
import { Card } from "../../../backend/src/models/cardModel";
import { getCardDeploymentCost } from "../../../backend/src/utils/deploymentPoints/deploymentPointSystem";

// This hook manages highlighting logic for cards and their valid targets
export function useCardHighlight(
  cards: Card[],
  currentDP: number,
  gamePhase: string,
  friendlyUnitsOnBoard: number,
  enemyUnitsOnBoard: number
) {
  // Track which cards are playable
  const [playableCardIds, setPlayableCardIds] = useState<number[]>([]);

  // Update playable cards whenever relevant state changes
  useEffect(() => {
    const newPlayableCardIds = cards
      .filter((card) => isCardPlayable(card))
      .map((card) => card.cardId);

    setPlayableCardIds(newPlayableCardIds);
  }, [cards, currentDP, gamePhase, friendlyUnitsOnBoard, enemyUnitsOnBoard]);

  // Check if a card can be played based on game conditions
  const isCardPlayable = (card: Card): boolean => {
    // Check DP cost
    const cost = getCardDeploymentCost(card);
    if (cost > currentDP) {
      return false;
    }

    // Check phase compatibility
    if (!isCorrectPhaseForCard(card.type, gamePhase)) {
      return false;
    }

    // Check additional conditions
    if (!checkAdditionalConditions(card)) {
      return false;
    }

    return true;
  };

  // Check if the current game phase allows playing this card type
  const isCorrectPhaseForCard = (cardType: string, phase: string): boolean => {
    switch (phase.toUpperCase()) {
      case "DEPLOYMENT":
        return ["Unit", "Evolution Unit", "Evolution Kin"].includes(cardType);
      case "ACTION":
        return ["Spell", "Ability"].includes(cardType);
      default:
        return false;
    }
  };

  // Check additional card-specific conditions
  const checkAdditionalConditions = (card: Card): boolean => {
    // For gear cards, check if there are friendly units to equip
    if (
      card.type === "Gear" ||
      (card.usageTypes && card.usageTypes.includes("Gear"))
    ) {
      return friendlyUnitsOnBoard > 0;
    }

    // For spells targeting enemies, check if there are enemy units
    if (
      card.type === "Spell" ||
      (card.usageTypes && card.usageTypes.includes("Spell"))
    ) {
      // This is simplified; you might need more complex logic based on spell type
      return enemyUnitsOnBoard > 0;
    }

    return true;
  };

  // Return the playable card IDs and the function to check playability
  return {
    playableCardIds,
    isCardPlayable,
  };
}
