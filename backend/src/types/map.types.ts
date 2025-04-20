export type TerrainType =
  | "trench"
  | "field"
  | "forest"
  | "city"
  | "mountains"
  | "no-mans-land"
  | "resupply"
  | "command";

export interface MapGenerationConfig {
  spacesPerSide: number;
  cellSize: number;
  cellSpacing: number;
  startX: number;
  startY: number;
}

export interface BoardSpaceDto {
  id: number;
  position: { x: number; y: number };
  terrain: TerrainType;
  isCorner?: boolean;
  // Add these gameplay properties
  owner: string | null;
  unit: any | null;
  value: number;
  level: number;
}

// Add connections to your MapDto
export interface MapDto {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  generationConfig: MapGenerationConfig;
  // Add connections property
  connections?: Record<number, number[]>;
  terrainRules?: {
    cornerTerrains?: TerrainType[];
    sideTerrains?: {
      top?: TerrainType[];
      right?: TerrainType[];
      bottom?: TerrainType[];
      left?: TerrainType[];
    };
  };
  metadata?: {
    author?: string;
    createdAt?: Date;
    tags?: string[];
  };
  terrainConfig?: {
    spaces: {
      position: number;
      terrain: TerrainType;
    }[];
  };
}

export interface CreateMapDto {
  id: string;
  name: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  generationConfig: MapGenerationConfig;
}

// Utility function to get terrain symbol
export const getTerrainSymbol = (terrain: TerrainType): string => {
  switch (terrain) {
    case "trench":
      return "⚓";
    case "field":
      return "🌾";
    case "forest":
      return "🌲";
    case "city":
      return "🏚️";
    case "mountains":
      return "⛰️";
    case "no-mans-land":
      return "💣";
    case "resupply":
      return "📦";
    case "command":
      return "⚔️";
    default:
      return "❓";
  }
};
