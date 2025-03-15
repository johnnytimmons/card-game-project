// gameModel.ts - Game state models

import { Card, CardOrigin } from './cardModel';
// Represents a card that's in play with its current state
export interface GameCardState {
  card: Card;                // Reference to the original card definition
  
  // Position and basic state
  playerId: string;
  position?: { row: number, col: number };
  facing: 'north' | 'south' | 'east' | 'west';
  currentHealth: number;
  
  // Properties that abilities might add or modify
  origin?: CardOrigin;
  damage: number;
  tempDamageBonus: number;
  extraMovement: number;
  directionalDefense?: { front: number, sides: number, back: number };
  ignoresObstacles: boolean;
  canTunnel: boolean;
  directAttack: boolean;
  canAttackOnDeploy: boolean;
  maxDeployRows: number;
  ignoresDefense: boolean;
  untargetableUntilAttack: boolean;
  attackPattern: { includeDiagonal: boolean };
  overwatch?: { active: boolean, range: number };
  statusEffects: Record<string, { duration: number, source: number }>;
  defense: number;
}

// Overall game state
export interface GameState {
  id: string;
  turnNumber: number;
  activePlayerId: string;
  players: Record<string, GamePlayerState>;
  board: GameCardState[];
  log: string[];
  
  // Method to add messages to the game log
  addToLog(message: string): void;
}

export interface GamePlayerState {
  id: string;
  health: number;
  handCards: Card[];
  deckCards: Card[];
  discardPile: Card[];
}

// Helper function to create a GameCardState from a Card
export function createGameCardState(card: Card, playerId: string): GameCardState {
  return {
    card,
    playerId,
    facing: 'north',
    // Explicitly handle potential undefined health
    currentHealth: card.health ?? 0, // Use nullish coalescing to default to 0
    
    // Initialize all runtime properties with sensible defaults
    damage: card.damage ?? 0,
    tempDamageBonus: 0,
    extraMovement: 0,
    ignoresObstacles: false,
    canTunnel: false,
    directAttack: false,
    canAttackOnDeploy: false,
    maxDeployRows: 0,
    ignoresDefense: false,
    untargetableUntilAttack: false,
    attackPattern: { includeDiagonal: false },
    statusEffects: {},
    // Use the card's defense value or default to 0
    defense: card.defense ?? 0,
  };
}

// Helper function to get the original card from a GameCardState
export function getOriginalCard<T extends Card = Card>(cardState: GameCardState): T {
  return cardState.card as T;
}