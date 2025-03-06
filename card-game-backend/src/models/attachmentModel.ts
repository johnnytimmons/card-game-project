// models/attachmentModel.ts
import { UnitCard, GearCard } from "./cardModel";

// Represents a unit card with gear attached to it
export interface EquippedUnit {
    baseUnit: UnitCard;         // The original unit card
    equippedGear: GearCard[];   // Array of gear cards attached to this unit
    
    // Calculated/effective stats after applying all gear effects
    effectiveDamage: number;    
    effectiveHealth: number;
    defense: number;        // Defense value that modifies incoming damage
    
    // Special abilities gained from gear
    abilities: string[];        
  }

  // Function to create a new EquippedUnit from a base unit
export function createEquippedUnit(baseUnit: UnitCard): EquippedUnit {
    return {
      baseUnit,
      equippedGear: [],
      effectiveDamage: baseUnit.damage,
      effectiveHealth: baseUnit.health,
      abilities: [],
      defense: 0,
    };
  }