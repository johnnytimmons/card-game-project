// utils/combatUtils.ts
import { EquippedUnit } from "../models/attachmentModel";
import { GameState } from "../models/gameStateTypes";
import { Cards, Card, BoardCard } from "../models/cardModel";
import { BoardSpace } from "../models/boardSpaceModel";
import { findCardById } from "../data/card-registry";
import { BoardUnit } from "../models/BoardUnit";

// Calculate terrain bonuses based on space type
function calculateTerrainBonus(
  unit: BoardUnit,
  space: BoardSpace
): { damageMod: number; healthMod: number } {
  // Default - no bonus
  const bonus = { damageMod: 0, healthMod: 0 };

  // Get unit's element/origin (for elemental affinities)
  const element = unit.origin || "neutral";

  // Apply terrain bonuses based on space type and unit element
  switch (space.type) {
    case "BATTLEFIELD":
      // Example: Military units get bonus on battlefields
      if (element === "military") {
        bonus.damageMod = 2;
      }
      break;
    case "BUNKER":
      // Example: Defense bonus for all units
      bonus.healthMod = 2;
      break;
    case "RITUAL_SITE":
      // Example: Occult units get power on ritual sites
      if (element === "occult") {
        bonus.damageMod = 3;
      }
      break;
    case "OUTPOST":
      // No special bonus yet
      break;
  }

  return bonus;
}

// Function to calculate mana cost to claim a space (used for toll calculation)
export function calculateManaCost(space: BoardSpace): number {
  // Base value is determined by space value (1-5)
  let baseCost = space.value * 5;

  // Multiply by level (upgrades)
  baseCost *= 1 + space.level * 0.5;

  return Math.floor(baseCost);
}

// Simplified combat function that incorporates land and terrain effects
export function executeCombat(
  attackingCard: Card,
  defendingUnit: BoardUnit, // Changed from BoardCard to BoardUnit
  space: BoardSpace,
  game: GameState
): {
  attackerWins: boolean;
  tollAmount: number;
  combatLog: string[];
} {
  const combatLog: string[] = [];

  // Get terrain bonuses for defender (who owns the land)
  const defenderTerrainBonus = calculateTerrainBonus(defendingUnit, space);

  // Calculate effective stats
  const attackerDamage = attackingCard.damage || 0;
  const defenderDamage =
    (defendingUnit.damage || 0) + defenderTerrainBonus.damageMod;

  const attackerHealth = attackingCard.health || 1;
  const defenderHealth =
    (defendingUnit.currentHealth || 1) + defenderTerrainBonus.healthMod;

  // Log initial stats with terrain effects
  combatLog.push(`[Battle for ${space.type} (Level ${space.level})]`);
  combatLog.push(
    `Attacker: ${attackingCard.name} (${attackerDamage}⚔️/${attackerHealth}❤️)`
  );
  combatLog.push(
    `Defender: ${defendingUnit.name} (${defenderDamage}⚔️/${defenderHealth}❤️ + terrain bonus)`
  );

  // Simple battle resolution: higher damage wins, ties go to defender
  const attackerWins = attackerDamage > defenderDamage;

  // Calculate the toll/mana cost if attacker loses
  const tollAmount = calculateManaCost(space);

  if (attackerWins) {
    combatLog.push(
      `${attackingCard.name} wins the battle and claims the space!`
    );
  } else {
    combatLog.push(`${defendingUnit.name} defends the space successfully.`);
    combatLog.push(`Attacker must pay ${tollAmount} DP in toll.`);
  }

  return {
    attackerWins,
    tollAmount,
    combatLog,
  };
}

// Function to initiate a battle
export function initiateBattle(
  gameState: GameState,
  spaceId: number,
  attackingPlayerId: string,
  attackingCardId: number
): {
  success: boolean;
  attackerWins?: boolean;
  tollAmount?: number;
  message: string;
  combatLog?: string[];
} {
  // Find the space
  const space = gameState.gameBoard.spaces.find((s) => s.id === spaceId);

  if (!space) {
    return { success: false, message: "Space not found" };
  }

  // Check if space is occupied by an opponent
  if (!space.owner || space.owner === attackingPlayerId) {
    return { success: false, message: "No opponent controls this space" };
  }

  // Check if there's a defending unit
  if (!space.unit) {
    return { success: false, message: "No defending unit on this space" };
  }

  // Get the attacking card
  const attackerState = gameState.players[attackingPlayerId];
  // Find the actual card object using findCardById
  const attackingCard = findCardById(attackingCardId);

  if (!attackingCard) {
    return { success: false, message: "Attacking card not found" };
  }

  // Check if the player has this card in hand
  if (!attackerState.handCardIds.includes(attackingCardId)) {
    return { success: false, message: "Card not in player's hand" };
  }

  // Execute combat
  const combatResult = executeCombat(
    attackingCard,
    space.unit,
    space,
    gameState
  );

  return {
    success: true,
    attackerWins: combatResult.attackerWins,
    tollAmount: combatResult.tollAmount,
    message: combatResult.attackerWins
      ? "Battle won! Space claimed."
      : `Battle lost. Pay ${combatResult.tollAmount} DP as toll.`,
    combatLog: combatResult.combatLog,
  };
}
