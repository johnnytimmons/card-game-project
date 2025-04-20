// src/models/boardUnit.ts

// Define BoardUnit type that matches the properties needed
export interface BoardUnit {
  cardId: number;
  position: { row: number; col: number };
  playerId: string;
  currentHealth: number; // Added from GameCardState
  damage: number; // Added from GameCardState
  isExhausted: boolean; // Added from GameCardState
  equippedUnit?: {
    effectiveDamage: number;
    effectiveHealth: number;
  };
  baseUnit?: {
    name: string;
    type: string;
    ability?: string | string[];
    damage: number;
    health: number;
  };
  name: string;
  origin?: string;
  // Add any other properties needed by gameActions.ts
}
