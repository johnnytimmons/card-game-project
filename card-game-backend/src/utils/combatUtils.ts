// utils/combatUtils.ts
import { EquippedUnit } from "../models/attachmentModel";
import { GameState } from '../models/gameModel';
import { Cards, Card, BoardCard } from "../models/cardModel";


// Simplified combat function using new ability system
export function executeCombat(
  attacker: BoardCard,
  defender: BoardCard,
  game: GameState
): {
  attackerDamageDealt: number;
  defenderDamageDealt: number;
  attackerDefeated: boolean;
  defenderDefeated: boolean;
  combatLog: string[];
} {
  const combatLog: string[] = [];
  
 
  // Calculate damage (simplified for this example)
  const attackerDamage = (attacker.damage || 0) + (attacker.tempEffects.damageBuff || 0);
  const defenderDefense = (defender.defense || 0) + (defender.tempEffects.defenseBuff || 0);
  const attackerDamageDealt = Math.max(1, attackerDamage - defenderDefense);
  
  // Apply damage to defender
  defender.currentHealth -= attackerDamageDealt;
  combatLog.push(`${attacker.name} deals ${attackerDamageDealt} damage to ${defender.name}`);
  
  // Check if defender was defeated
  if (defender.currentHealth <= 0) {
    combatLog.push(`${defender.name} was defeated!`);
    return {
      attackerDamageDealt,
      defenderDamageDealt: 0,
      attackerDefeated: false,
      defenderDefeated: true,
      combatLog
    };
  }
  
  // Defender counterattack (if they didn't go first with ambush)
  let defenderDamageDealt = 0;
  
    const defenderDamage = (defender.damage || 0) + (defender.tempEffects.damageBuff || 0);
    const attackerDefense = (attacker.defense || 0) + (attacker.tempEffects.defenseBuff || 0);
    defenderDamageDealt = Math.max(1, defenderDamage - attackerDefense);
    
    // Apply damage to attacker
    attacker.currentHealth -= defenderDamageDealt;
    combatLog.push(`${defender.name} counterattacks for ${defenderDamageDealt} damage`);
    
    // Check if attacker was defeated
    if (attacker.currentHealth <= 0) {
      combatLog.push(`${attacker.name} was defeated!`);
      return {
        attackerDamageDealt,
        defenderDamageDealt,
        attackerDefeated: true,
        defenderDefeated: false,
        combatLog
      };
    }

  
  // Both units survived
  combatLog.push("Both units survived the combat.");
  return {
    attackerDamageDealt,
    defenderDamageDealt,
    attackerDefeated: false,
    defenderDefeated: false,
    combatLog
  };
}

// Function to count cards by origin (used by ability effects)
export function countCardsByOrigin(game: GameState, playerId: string, origin: string): number {
  return game.board.filter(Card => 
    Card.playerId === playerId && Card.origin === origin
  ).length;
}