// src/types/gameTypes.ts
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
}

export interface BoardUnit {
  cardId: number;
  position: Position;
  playerId: string;
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
  onUnitHover?: (unit: BoardUnit) => void;
  onUnitLeave?: () => void;
}
 