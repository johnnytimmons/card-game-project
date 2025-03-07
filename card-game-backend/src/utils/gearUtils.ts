// utils/gearUtils.ts
import { UnitCard, GearCard } from "../models/cardModel";
import { EquippedUnit, createEquippedUnit } from "../models/attachmentModel";

/**
 * Equips a gear card to a unit and recalculates stats
 */
export function equipGear(unit: EquippedUnit, gear: GearCard): EquippedUnit {
    // Create a new object to avoid mutating the original
    const updatedUnit: EquippedUnit = { 
      ...unit,
      equippedGear: [...unit.equippedGear, gear],
      abilities: [...unit.abilities]
    };

     // Apply stat changes from the gear
  if (gear.damage) {
    updatedUnit.effectiveDamage += gear.damage;

    if (gear.health) {
        updatedUnit.effectiveHealth += gear.health;
      }
  }
 
  // Handle ability text
  if (gear.ability) {
    // Check if ability includes stat modifiers like "+20 Health"
    const healthModMatch = gear.ability.match(/([+-]\d+)\s+Health/i);
    const damageModMatch = gear.ability.match(/([+-]\d+)\s+Dam/i);
    const defModMatch = gear.ability.match(/([+-]\d+)\s+Def/i);
    
      // Apply health modifier from ability text
      if (healthModMatch) {
        const modifier = parseInt(healthModMatch[1]);
        updatedUnit.effectiveHealth += modifier;
      }

      // Apply damage modifier from ability text
    if (damageModMatch) {
        const modifier = parseInt(damageModMatch[1]);
        updatedUnit.effectiveDamage += modifier;
      }

     // Apply defense modifier from ability text
     if (defModMatch) {
        const modifier = parseInt(defModMatch[1]);
        updatedUnit.defense += modifier;
      }
      
      // Add the ability to the unit's ability list
      updatedUnit.abilities.push(gear.ability);
    }

    return updatedUnit;
}

/**
 * Converts a regular unit card to an equipped unit with the given gear
 */

export function createUnitWithGear(unit: UnitCard, gear: GearCard[]): EquippedUnit {
  // Start with a basic equipped unit
  let equippedUnit = createEquippedUnit(unit);
  
  // Apply each piece of gear sequentially
  for (const gearItem of gear) {
    equippedUnit = equipGear(equippedUnit, gearItem);
  }
  
  return equippedUnit;
}

/**
 * Removes a specific gear card from a unit
 */
export function removeGear(unit: EquippedUnit, gearId: number): EquippedUnit {
  // Find the gear to remove
  const gearToRemove = unit.equippedGear.find(gear => gear.id === gearId);
  
  if (!gearToRemove) {
    // Gear not found, return the unit unchanged
    return unit;
  }

   // Create new unit without the specific gear
   const updatedGearList = unit.equippedGear.filter(gear => gear.id !== gearId);
  
   // Start fresh with the base unit
   const baseUnit = unit.baseUnit;
   
   // Re-apply all remaining gear to recalculate stats
   return createUnitWithGear(baseUnit, updatedGearList);
 }
