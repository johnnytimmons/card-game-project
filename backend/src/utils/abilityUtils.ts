// utils/abilitySystem.ts
import { GameState } from "../models/gameStateTypes";
import { BoardCard, Card } from "../models/cardModel"; // Using your new interface

// Define the Ability interface
export interface Ability {
  name: string;
  description: string;
  effect: (game: GameState, source: BoardCard, target?: BoardCard) => void;
}

// Create the ability registry
export const abilityRegistry: Map<string, Ability> = new Map();

// Helper function to register abilities
export function registerAbility(id: string, ability: Ability): void {
  abilityRegistry.set(id, ability);
}

// Helper function to execute an ability
export function executeAbility(
  abilityId: string,
  game: GameState,
  source: BoardCard,
  target?: BoardCard
): boolean {
  const ability = abilityRegistry.get(abilityId);
  if (!ability) {
    console.warn(`Ability "${abilityId}" not found in registry`);
    return false;
  }

  try {
    ability.effect(game, source, target);
    return true;
  } catch (error) {
    console.error(`Error executing ability "${abilityId}":`, error);
    return false;
  }
}

// Helper function to get ability by ID
export function getAbility(abilityId: string): Ability | undefined {
  return abilityRegistry.get(abilityId);
}

// Helper function to check if a card has an ability
export function hasAbility(card: BoardCard | Card, abilityId: string): boolean {
  if (!card.abilities) return false;

  if (typeof card.abilities === "string") {
    return card.abilities === abilityId;
  }

  return card.abilities.includes(abilityId);
}
