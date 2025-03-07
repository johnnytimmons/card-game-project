// utils/combatUtils.ts
import { EquippedUnit } from "../models/attachmentModel";

/**
 * Calculates actual damage dealt based on attacker's damage and defender's defense
 */

export function calculateDamage(attackerDamage: number, defenderDefense: number): number {
    // Defense modifies incoming damage (positive defense reduces damage, negative increases it)
    const actualDamage = attackerDamage - defenderDefense;
    
    // Damage cannot be less than 1 (minimum damage)
    return Math.max(1, actualDamage);
  }
  /**
 * Applies damage to a unit and returns the updated unit
 */
export function executeCombat(attacker: EquippedUnit, defender: EquippedUnit): {
  damageDealt: number;
  updatedDefender: EquippedUnit;
  defenderDefeated: boolean;
} {
  //Calculate Damage considering Defense
    const damageDealt = calculateDamage(attacker.effectiveDamage, defender.defense);
  // Apply the damage to create an updated defender  
    const updatedDefender: EquippedUnit = {
      ...defender,
      effectiveHealth: Math.max(0, defender.effectiveHealth - damageDealt)
    };
  
    return {
      damageDealt,
      updatedDefender,
      defenderDefeated: updatedDefender.effectiveHealth <= 0
    };
  }