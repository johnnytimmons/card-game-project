// models/gameModel.ts
export interface Position {
  x: number;
  y: number;
}

export interface Unit {
  id: number;
  name: string;
  type: string;
  playerId: string;
  health: number;
  currentHealth: number;
  damage: number;
}

// Represents a basic card
export interface Card {
  cardId: number;
  name: string;
  type: string;
  damage?: number;
  health?: number;
  defense?: number;
}

// Create a unit from a card
export function createUnit(card: Card, playerId: string): Unit {
  return {
    id: card.cardId,
    name: card.name,
    type: card.type,
    playerId,
    health: card.health || 1,
    currentHealth: card.health || 1,
    damage: card.damage || 0,
  };
}

// Create an initial game state with minimal properties
export function createInitialGameState(player1Id: string, player2Id: string) {
  return {
    id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    activePlayerId: player1Id,
    players: {
      [player1Id]: {
        id: player1Id,
        health: 20,
        deploymentPoints: 5,
      },
      [player2Id]: {
        id: player2Id,
        health: 20,
        deploymentPoints: 5,
      },
    },
    board: [],
  };
}
