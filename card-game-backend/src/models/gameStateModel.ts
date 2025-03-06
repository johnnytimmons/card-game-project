export interface Position {
    row: number;
    col: number;
  }

  export interface PlacedCard {
    cardId: number;
    position: Position;
    playerId: string;
    health: number; // Current health, which might differ from max
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