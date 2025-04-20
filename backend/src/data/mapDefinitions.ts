// src/data/mapDefinitions.ts
import { MapDto, TerrainType } from "../types/map.types";

// Square map with 5 spaces per side
export const squareMapConfig: MapDto = {
  id: "square-layout",
  name: "Square Map Layout",
  description: "Basic square layout with varied terrain",
  difficulty: "easy",
  generationConfig: {
    spacesPerSide: 4, // 5 spaces per side, 16 spaces total
    cellSize: 145,
    cellSpacing: -30,
    startX: 100,
    startY: 100,
  },
  terrainConfig: {
    spaces: [
      // Top side: Center is Command
      { position: 0, terrain: "trench" },
      { position: 1, terrain: "trench" },
      { position: 2, terrain: "command" },
      { position: 3, terrain: "trench" },

      // Right side: Top corner is command, bottom corner is resupply, middle 3 are forest
      { position: 4, terrain: "trench" },
      { position: 5, terrain: "forest" },
      { position: 6, terrain: "forest" },
      { position: 7, terrain: "forest" },

      // Bottom side: All trenches
      { position: 8, terrain: "resupply" },
      { position: 9, terrain: "trench" },
      { position: 10, terrain: "trench" },
      { position: 11, terrain: "trench" },

      // Left side: Top corner is resupply, bottom corner is command, middle 3 are mountains
      { position: 12, terrain: "resupply" },
      { position: 13, terrain: "mountains" },
      { position: 14, terrain: "mountains" },
      { position: 15, terrain: "mountains" },
    ],
  },
};

// Add the WW2 map as well
export const ww2MapConfig: MapDto = {
  id: "ww2-european-theater",
  name: "WW2 European Theater",
  description: "A map based on the European Theater of WWII",
  difficulty: "medium",
  generationConfig: {
    spacesPerSide: 6, // 24 spaces total
    cellSize: 145,
    cellSpacing: -30,
    startX: 100,
    startY: 100,
  },
  terrainConfig: {
    spaces: [
      // Strategic locations (corners) - every 6th space
      { position: 0, terrain: "command" }, // HQ, London
      { position: 6, terrain: "resupply" }, // Supply Center, Moscow
      { position: 12, terrain: "command" }, // HQ, Berlin
      { position: 18, terrain: "resupply" }, // Supply Center, Rome

      // Western Europe
      { position: 1, terrain: "city" }, // Paris
      { position: 2, terrain: "field" }, // Normandy
      { position: 3, terrain: "forest" }, // Ardennes
      { position: 4, terrain: "mountains" }, // Alps
      { position: 5, terrain: "city" }, // Rome

      // Eastern Europe
      { position: 7, terrain: "field" }, // Ukraine
      { position: 8, terrain: "field" }, // Stalingrad
      { position: 9, terrain: "mountains" }, // Caucasus
      { position: 10, terrain: "forest" }, // Romanian Forest
      { position: 11, terrain: "city" }, // Warsaw

      // Southern Front
      { position: 13, terrain: "city" }, // Vienna
      { position: 14, terrain: "mountains" }, // Balkans
      { position: 15, terrain: "trench" }, // Mediterranean Coast
      { position: 16, terrain: "field" }, // North Africa
      { position: 17, terrain: "no-mans-land" }, // El Alamein

      // Northern Front
      { position: 19, terrain: "forest" }, // Scandinavian Forest
      { position: 20, terrain: "trench" }, // North Sea
      { position: 21, terrain: "city" }, // Rotterdam
      { position: 22, terrain: "field" }, // Belgian Countryside
      { position: 23, terrain: "no-mans-land" }, // Dunkirk
    ],
  },
};

// Export a collection of maps by level and difficulty
export const mapsByLevel = {
  // Early game levels
  level1: squareMapConfig,
  level2: ww2MapConfig,

  // Add more level maps as needed
  // level3: anotherMapConfig,
  // level4: yetAnotherMapConfig,
};

// Export all available maps as an array for selection
export const allMaps: MapDto[] = [
  squareMapConfig,
  ww2MapConfig,
  // Add any additional maps here
];
