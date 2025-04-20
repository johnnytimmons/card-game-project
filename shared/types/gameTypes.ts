// src/types/gameTypes.ts

import { BoardSpaceDto } from "./map.types";
import { EvolutionInfo } from "../../backend/src/models/cardModel";

// Define interfaces for our data structures
export interface Position {
  row: number;
  col: number;
}

export interface EquippedUnit {
  effectiveDamage: number;
  effectiveHealth: number;
}

export interface BaseUnit {
  name: string;
  type: string;
  ability?: string;
  damage: number;
  health: number;
}

export interface BoardUnit {
  name: string;
  cardId: number;
  position: Position;
  playerId: string;
  evolution?: EvolutionInfo;
  equippedUnit: EquippedUnit;
  baseUnit: BaseUnit;
}

// Define prop interfaces for our components
export interface UnitTokenProps {
  unit: BoardUnit;
  isSelected: boolean;
  onSelect: (unit: BoardUnit) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface GridCellProps {
  row: number;
  col: number;
  unit: BoardUnit | undefined;
  selectedUnit: BoardUnit | null;
  onCellClick: (row: number, col: number) => void;
  onUnitSelect: (unit: BoardUnit) => void;
  onUnitHover?: (unit: BoardUnit, event?: React.MouseEvent) => void;
  onUnitLeave?: () => void;
  placementMode: boolean;
  isEquipMode: boolean;
  onPlaceCard: Function;
  onEquipGear: Function;
  cardIsPlaceable: boolean;
  currentPlayerId: string;
  currentPlayerDP: number; // Add this
  onAttack?: (unit: BoardUnit) => void;
  isValidPlacement?: boolean;
  isValidEquipTarget?: boolean;
}

// Player-related types
export interface PlayerData {
  id: string;
  name: string;
  color: string;
  deploymentPoints: number;
  ownedCells: number[];
  position: number | null;
}

// Movement animation state
export interface MovementState {
  isAnimating: boolean;
  path: number[];
  currentPathIndex: number;
}

// Game phases from your existing file
export enum GamePhase {
  ROLL_MOVE = "ROLL_MOVE", // Player rolls dice and moves
  CLAIM = "CLAIM", // Player can claim empty land
  BATTLE = "BATTLE", // Player fights for occupied land
  PAY_TOLL = "PAY_TOLL", // Player pays toll for opponent's land
  END_TURN = "END_TURN", // Player ends their turn

  // Additional phases from our implementation
  DRAW = "DRAW", // Draw cards, collect resources
  MOVE = "MOVE", // Player chooses to move
  MOVING = "MOVING", // Animation of movement in progress
  AFTER_MOVE = "AFTER_MOVE", // After movement is complete
  UPGRADE = "UPGRADE", // Upgrade owned property
}

// Turn state from your existing file
export interface TurnState {
  currentPhase: GamePhase;
  activePlayer: string;
  defensePlayer: string;
  roundNumber: number;
  declaredAttacks: Array<{
    attackerId: number;
    targetId: number;
    resolved: boolean;
  }>;
}

// Game state interface for clearer typing
export interface GameState {
  currentPhase: GamePhase;
  players: PlayerData[];
  currentPlayerIndex: number;
  turnNumber: number;
  diceValue: number | null;
  selectedSpace: BoardSpaceDto | null;
}
