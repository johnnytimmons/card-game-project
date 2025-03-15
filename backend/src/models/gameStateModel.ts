// models/gameStateModel.ts
import { BoardCard } from "./cardModel";


export interface Position {
  row: number;
  col: number;
}

export interface PlacedCard {
  cardId: number;
  position: Position;
  playerId: string;
  type: string;
  health: number;
  defeatedCount?: number;  // Track enemies defeated
  placedOnTurn?: number;   // Track when card was placed
  movementPattern?: string;
  attackRange?: number;
  currentHealth?: number;
  isCreature?: boolean;
  isPlaced: boolean;
  isExhausted: boolean;
   }

// Define a separate interface for player state
export interface PlayerState {
  handCardIds: number[];
  deckCardIds: number[];
  health: number;
  deckType?: string;
}

export interface GameState {
  id: string;
  playerTurn: string; // ID of the player whose turn it is
  players: {
    [playerId: string]: PlayerState;
  };
  board: BoardCard[]; // Cards currently on the board
  turnNumber: number;
  lastUpdated: Date;
  gameLog: string[];
}