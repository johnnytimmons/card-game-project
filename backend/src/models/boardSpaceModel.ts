// src/models/boardSpaceModel.ts
// boardSpaceModel.ts
export enum SpaceType {
  BATTLEFIELD = "BATTLEFIELD",
  BUNKER = "BUNKER",
  RITUAL_SITE = "RITUAL_SITE",
  OUTPOST = "OUTPOST",
  // Include any other space types you had previously
}

export interface BoardSpace {
  id: number;
  type: SpaceType;
  owner: string | null;
  position: { x: number; y: number };
  unit: any | null; // You might want to use a more specific type
  value: number;
  level: number;
}

export interface GameBoard {
  spaces: BoardSpace[];
  connections: Record<number, number[]>;
}
