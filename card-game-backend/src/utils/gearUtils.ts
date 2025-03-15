// utils/gearUtils.ts
import { Card, GearCard, BoardCard } from "../models/cardModel";
import { EquippedUnit, createEquippedUnit } from "../models/attachmentModel";

/**
 * Processes ability text to extract numerical modifiers
 * Works with both string and string[] ability types
 * @param ability The ability text to process
 * @param pattern The regex pattern to match
 * @returns The extracted numerical value or 0 if no match
 */
function extractModifierFromAbility(abilities: string | string[] | undefined, pattern: RegExp): number {
  // If ability is undefined, return 0
  if (!abilities) return 0;
  
  // Convert ability to string if it's an array
  const abilityText = Array.isArray(abilities) ? abilities.join(' ') : abilities;
  
  // Match the pattern
  const match = abilityText.match(pattern);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}

/**-----------------------------------------------------------------------------------------------------
 * Equips a gear card to a unit, updating its stats and abilities
 * @param unit The unit to equip the gear to
 * @param gear The gear card to equip
 * @returns The updated unit with the gear equipped
 */
export function equipGear(unit: EquippedUnit, gear: GearCard): EquippedUnit {
  // Create a copy of the unit to avoid modifying the original
  const updatedUnit: EquippedUnit = {
    ...unit,
    equippedGear: [...unit.equippedGear, gear],
    effectiveDamage: unit.effectiveDamage,
    effectiveHealth: unit.effectiveHealth,
    defense: unit.defense,
    abilities: [...unit.abilities]
  };
  
  // Apply any direct stat boosts from the gear card
  if (gear.damage) {
    updatedUnit.effectiveDamage += gear.damage;
  }
  
  if (gear.health) {
    updatedUnit.effectiveHealth += gear.health;
  }
  
  // Extract modifiers from ability text
  const healthMod = extractModifierFromAbility(gear.abilities, /([+-]\d+)\s+Health/i);
  const damageMod = extractModifierFromAbility(gear.abilities, /([+-]\d+)\s+Dam/i);
  const defMod = extractModifierFromAbility(gear.abilities, /([+-]\d+)\s+Def/i);
  
  // Apply the extracted modifiers
  updatedUnit.effectiveDamage += damageMod;
  updatedUnit.effectiveHealth += healthMod;
  updatedUnit.defense += defMod;
  
  // Add the ability text to the unit's abilities array
  if (gear.abilities) {
    if (Array.isArray(gear.abilities)) {
      // If it's an array, add each ability individually
      updatedUnit.abilities.push(...gear.abilities);
    } else {
      // If it's a string, add the whole ability
      updatedUnit.abilities.push(gear.abilities);
    }
  }
  
  return updatedUnit;
}
/**----------------------------------------------------------------------------------------
 * Converts a regular unit card to an equipped unit with the given gear
 */

export function createUnitWithGear(unit: BoardCard, gear: GearCard[]): EquippedUnit {
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
