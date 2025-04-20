// utils/deploymentPoints/deploymentPointSystem.ts
import { Card } from "../../models/cardModel";
import { BoardUnit } from "../../models/BoardUnit";
/**
 * Get the deployment cost of a card - simply uses the card's predefined DP cost
 * @param card The card to check
 * @returns The card's deployment point cost
 */
export function getCardDeploymentCost(card: Card): number {
  // If the card has an explicit cost, use that
  if (card.dpCost !== undefined) {
    return card.dpCost;
  }

  // If no dpCost is assigned, default to 1 DP as a fallback
  return 1;
}

/**
 * Check if a player can deploy a card with their current DP
 * @param card The card to be played
 * @param currentDP The player's current DP
 * @returns True if the player has enough DP to play the card
 */
export function canDeployCard(card: Card, currentDP: number): boolean {
  const cost = getCardDeploymentCost(card);
  return cost <= currentDP;
}

/**
 * Handle DP deduction when playing a card
 * @param currentDP Current DP value
 * @param card Card being played
 * @returns New DP amount after deduction
 */
export function deductDPForCard(currentDP: number, card: Card): number {
  const cost = getCardDeploymentCost(card);
  return Math.max(0, currentDP - cost); // Ensure we don't go negative
}

/**
 * Calculate DP gained from completing a lap
 * @param lapNumber The current lap number
 * @returns The amount of DP gained
 */
export function getDPFromLap(lapNumber: number): number {
  // First lap gives 2 DP, each additional lap gives +1 more
  // Similar to Culdcept Saga's increasing DP rewards
  return 1 + lapNumber;
}

/**
 * Calculate DP gained when a land is upgraded
 * @param landLevel The current level of the land (after upgrade)
 * @returns The amount of DP gained from the upgrade
 */
export function getDPFromLandUpgrade(landLevel: number): number {
  // Higher level lands provide more DP
  return landLevel; // Level 1 = 1 DP, Level 2 = 2 DP, etc.
}
