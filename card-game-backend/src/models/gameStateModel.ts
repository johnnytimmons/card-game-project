// models/gameStateModel.ts
import { EquippedUnit, } from "./attachmentModel";

export interface Position {
    row: number;
    col: number;
  }

  export interface PlacedCard {
    cardId: number;
    equippedUnit: EquippedUnit; // Now using EquippedUnit instead of just IDs
    position: Position;
    playerId: string;
  }

  export interface GameState {
    id: string;
    playerTurn: string; // ID of the player whose turn it is
    players: {
      [playerId: string]: {
        handCardIds: number[]; // IDs of cards in hand
        deckCardIds: number[]; // IDs of cards in deck
        health: number;
      }
    };
    board: PlacedCard[]; // Cards currently on the board
    turnNumber: number;
    lastUpdated: Date;
  }