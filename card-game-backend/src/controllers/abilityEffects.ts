import { GameState, GameCardState } from '../models/gameModel';
import { Card, Cards } from "../models/cardModel";
//import { findAdjacentUnits, calculateDamage, applyDamage, countCardsByOrigin } from "../utils/combatUtils";

// Define the structure for our ability effect handlers
export type AbilityEffectHandler = (cardState: GameCardState, game: GameState, target?: Card, value?: number) => void;

// Map of effect strings to their handler implementations
export const abilityEffectHandlers: Record<string, AbilityEffectHandler> = {
  // Unit abilities
  /*'BUFF_ADJACENT_DAMAGE': (card, game, _, value = 2) => {
    // Find adjacent friendly units
    const adjacentUnits = findAdjacentUnits(game, card, true);
    
    // Apply damage bonus to each adjacent unit
    adjacentUnits.forEach(unit => {
      unit.tempDamageBonus = (unit.tempDamageBonus || 0) + value;
    });
    
    // Log the effect
    game.addToLog(`${card.name} inspired nearby allies, granting +${value} damage`);
  },
  
  'EXTRA_MOVEMENT': (card, game, _, value = 1) => {
    // Increase movement points for this unit
    card.extraMovement = (card.extraMovement || 0) + value;
    game.addToLog(`${card.name} can move ${value} additional space(s) this turn`);
  },
  
  'DIRECTIONAL_DEFENSE': (card, game, _, value = 5) => {
    // Add directional defense property to the card
    card.directionalDefense = {
      front: value,
      sides: 0,
      back: 0
    };
    game.addToLog(`${card.name} has +${value} defense against frontal attacks`);
  },
  
  'BEHIND_ATTACK_BONUS': (card, game, target, value = 5) => {
    // Only apply if attacking from behind
    if (target && isAttackingFromBehind(card, target, game)) {
      card.tempDamageBonus = (card.tempDamageBonus || 0) + value;
      game.addToLog(`${card.name} gains +${value} damage from attacking ${target.name} from behind`);
    }
  },
  
  'FIRST_ATTACK': (card, game, target) => {
    // This is handled in the combat system by checking for the ability
    // Just log that the ability is active
    if (target) {
      game.addToLog(`${card.name} is prepared to ambush its target`);
    }
  },
  
  'IGNORE_OBSTACLES': (card, game) => {
    // Set the flight property
    card.ignoresObstacles = true;
    game.addToLog(`${card.name} can fly over terrain and units`);
  },
  
  'TUNNEL_ATTACK': (card, game, target) => {
    // This requires special handling in the movement system
    card.canTunnel = true;
    card.directAttack = true;
    
    if (target) {
      game.addToLog(`${card.name} tunnels under the battlefield and emerges near ${target.name}`);
    } else {
      game.addToLog(`${card.name} can tunnel under the battlefield`);
    }
  },
  
  'FAST_DEPLOY': (card, game, _, value = 4) => {
    // Allow unit to attack on the turn it's deployed
    card.canAttackOnDeploy = true;
    
    // Set maximum deployment rows (from own territory edge)
    card.maxDeployRows = value;
    
    game.addToLog(`${card.name} is ready for immediate action after deployment`);
  },
  
  // Gear abilities
  'BUFF_DEFENSE': (card, game, _, value = 10) => {
    // Increase the card's defense
    card.defense = (card.defense || 0) + value;
    game.addToLog(`${card.name} gained +${value} defense`);
  },
  
  'ATTACK_DIAGONAL': (card, game) => {
    // Allow diagonal attacks
    card.attackPattern = { 
      ...(card.attackPattern || {}),
      includeDiagonal: true 
    };
    game.addToLog(`${card.name} can now attack diagonally`);
  },
  
  'IGNORE_DEFENSE': (card, game) => {
    // Set piercing attack property
    card.ignoresDefense = true;
    game.addToLog(`${card.name}'s attacks now pierce through defense`);
  },
  
  'UNTARGETABLE_UNTIL_ATTACK': (card, game) => {
    // Set cloaking property
    card.untargetableUntilAttack = true;
    game.addToLog(`${card.name} is cloaked until it attacks`);
  },
  
  'TRADE_DEFENSE_FOR_DAMAGE': (card, game, _, value = 10) => {
    // Increase damage but reduce defense
    card.tempDamageBonus = (card.tempDamageBonus || 0) + value;
    card.defense = Math.max(0, (card.defense || 0) - 5); // Always reduce by 5
    
    game.addToLog(`${card.name} sacrificed defense for +${value} damage`);
  },
  
  'HEAL': (card, game, _, value = 20) => {
    // Heal the unit
    const maxHealth = card.health || 0;
    const currentHealth = card.currentHealth || maxHealth;
    const newHealth = Math.min(currentHealth + value, maxHealth);
    
    card.currentHealth = newHealth;
    
    const healAmount = newHealth - currentHealth;
    game.addToLog(`${card.name} recovered ${healAmount} health`);
  },
  
  'OPPORTUNITY_ATTACK': (card, game, _, value = 1) => {
    // Set overwatch property with range
    card.overwatch = {
      active: true,
      range: value
    };
    game.addToLog(`${card.name} is on overwatch, ready to attack enemies that come within ${value} spaces`);
  },
  
  // Kindred abilities
  'ON_DAMAGE_SLEEP': (card, game, target) => {
    // Only apply if the card took damage but wasn't defeated
    if (target && card.currentHealth && card.currentHealth > 0) {
      target.statusEffects = target.statusEffects || {};
      target.statusEffects.sleep = {
        duration: 1,
        source: card.id
      };
      
      game.addToLog(`${card.name}'s dreamtouch puts ${target.name} to sleep for 1 turn`);
    }
  },
  
  'DREAM_DEF_BUFF': (card, game, _, value = 1) => {
    // Count dream creatures
    const dreamCount = countCardsByOrigin(game, getCardPlayerId(card, game), 'Dream');
    
    // Apply defense bonus
    const defBonus = value * dreamCount;
    card.defense = (card.defense || 0) + defBonus;
    
    game.addToLog(`${card.name} gained +${defBonus} defense from Dreamshield`);
  },

  'DREAM_HEALTH_RESTORE': (card, game, _, value = 1) => {
    // Count dream creatures
    const dreamCount = countCardsByOrigin(game, getCardPlayerId(card, game), 'Dream');
    
    // Apply healing
    const healAmount = value * dreamCount;
    const maxHealth = card.health || 0;
    const currentHealth = card.currentHealth || maxHealth;
    const newHealth = Math.min(currentHealth + healAmount, maxHealth);
    
    card.currentHealth = newHealth;
    
    const actualHeal = newHealth - currentHealth;
    if (actualHeal > 0) {
      game.addToLog(`${card.name} recovered ${actualHeal} health from Dreamflow`);
    }
  }
};

// Function to process a card's ability effects
export function processAbilityEffect(card: Card, abilityDef: AbilityDefinition, game: GameState, target?: Card): void {
  const handler = abilityEffectHandlers[abilityDef.effect];
  
  if (handler) {
    // Execute the effect handler with the ability's value
    handler(card, game, target, abilityDef.value);
  } else {
    console.warn(`No handler implemented for effect: ${abilityDef.effect}`);
  }
}

// Helper function to determine if a card is attacking from behind
function isAttackingFromBehind(attacker: Card, defender: Card, game: GameState): boolean {
  // This is a placeholder - you would need to implement the actual logic
  // based on your game's board representation and direction system
  
  // Example implementation:
  const attackerPos = attacker.position;
  const defenderPos = defender.position;
  const defenderFacing = defender.facing || 'north';
  
  if (!attackerPos || !defenderPos) return false;
  
  // Determine if attacker is behind defender based on facing
  switch(defenderFacing) {
    case 'north': return attackerPos.row > defenderPos.row;
    case 'south': return attackerPos.row < defenderPos.row;
    case 'east': return attackerPos.col < defenderPos.col;
    case 'west': return attackerPos.col > defenderPos.col;
    default: return false;
  }
}

// Helper function to get a card's player ID
function getCardPlayerId(card: Card, game: GameState): string {
  // This is a placeholder - implement based on your game structure
  return card.playerId || '';
  */}