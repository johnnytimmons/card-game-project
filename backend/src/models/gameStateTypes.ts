import { BoardCard, Card, CardOrigin } from "./cardModel";
import { GamePhase } from "../../../shared/types/gameTypes";
import { GameBoard } from "./boardSpaceModel";
import { BoardUnit } from "./BoardUnit";

// Basic position type
export interface Position {
  row: number;
  col: number;
}

// Player state
export interface PlayerState {
  id?: string; // Make this optional to work with both implementations
  handCardIds: number[];
  handCards?: Card[]; // Support both array of IDs and array of Cards
  deckCardIds: number[];
  deckCards?: Card[]; // Support both
  health: number;
  deckType?: string;
  currentDP: number;
  territoryDP: number;
  combatDP: number;
  positionDP: number;
  defeatedUnits: BoardCard[];
  deploymentPoints: number;
  discardPile?: Card[]; // From the second implementation
  ownedCells: number[];
}

// Consolidated game state
export interface GameState {
  // Basic game info
  id: string;

  // Turn information
  playerTurn: string; // ID of the player whose turn it is
  activePlayerId?: string; // Alternative name from second implementation

  roundNumber?: number; // In the other implementation

  // Players and board
  players: {
    [playerId: string]: PlayerState;
  };
  board: BoardUnit[];

  // New properties
  gameBoard: GameBoard;
  playerPositions: Record<string, number>; // Player position on the track
  lastDiceRoll?: number;

  // Game tracking
  lastUpdated?: Date;
  gameLog?: string[];
  log?: string[];

  // Combat tracking
  defeatedUnits?: BoardCard[];
  lastRoundDefeatedUnits?: BoardCard[];

  // Phase tracking
  currentPhase?: GamePhase | string;
  previousPhase?: GamePhase | string;

  // Card tracking
  cardsPlayedThisTurn?: {
    [playerId: string]: number[];
  };
  playedCardIds?: number[]; // Computer AI played cards tracking

  // Method (optional)
  addToLog?: (message: string) => void;
}

// Type guard to check if a card is a BoardCard
export function isBoardCard(card: BoardCard): card is BoardCard {
  return "tempEffects" in card;
}
