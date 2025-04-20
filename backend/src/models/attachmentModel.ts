// models/attachmentModel.ts
import { Card, BoardCard, GearCard } from "./cardModel";

// Represents a unit card with gear attached to it
export interface EquippedUnit {
  baseUnit: BoardCard; // The original unit card
  equippedGear: GearCard[]; // Array of gear cards attached to this unit

  // Calculated/effective stats after applying all gear effects
  effectiveDamage: number;
  effectiveHealth: number;
  defense: number; // Defense value that modifies incoming damage

  // Special abilities gained from gear
  abilities: string[];
}

// Function to create a new EquippedUnit from a base unit
export function createEquippedUnit(baseUnit: BoardCard): EquippedUnit {
  return {
    baseUnit,
    equippedGear: [],
    effectiveDamage: baseUnit.damage || 0, // Use 0 if damage is undefined
    effectiveHealth: baseUnit.currentHealth || baseUnit.health || 0, // Use 0 if health is undefined
    abilities: Array.isArray(baseUnit.abilities)
      ? [...baseUnit.abilities]
      : baseUnit.abilities
        ? [baseUnit.abilities]
        : [],
    defense: 0,
  };
}
