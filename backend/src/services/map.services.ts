// Backend: map.service.ts
import {
  BoardSpaceDto,
  MapDto,
  TerrainType,
  CreateMapDto,
} from "../types/map.types";
import { allMaps } from "../data/mapDefinitions";

export class MapService {
  private maps: MapDto[] = [];

  constructor() {
    // Initialize with maps from the mapDefinitions file
    this.maps = allMaps;
  }

  // New method to directly return maps without HTTP requestF
  async findAll(): Promise<MapDto[]> {
    console.log("Backend: Returning all maps from in-memory store");
    return this.maps;
  }

  // Get map by ID directly from memory
  findById(mapId: string): MapDto | undefined {
    console.log(`Backend: Getting map ${mapId} from in-memory store`);
    return this.maps.find((map) => map.id === mapId);
  }

  // Modified generateMapSpaces method - now with square layout support
  async generateMapSpaces(mapId: string): Promise<BoardSpaceDto[]> {
    console.log(`Backend: Generating spaces for map ${mapId}`);
    const map = this.findById(mapId);
    if (!map) {
      throw new Error(`Map with ID ${mapId} not found`);
    }

    const { generationConfig } = map;
    const newSpaces: BoardSpaceDto[] = [];
    const connections: Record<number, number[]> = {};

    // Total spaces around the perimeter of the shape
    const totalSpaces = generationConfig.spacesPerSide * 4; // 4 sides
    const spacesPerSide = generationConfig.spacesPerSide;
    const cellSize = generationConfig.cellSize;
    const spacing = generationConfig.cellSpacing; // Use the spacing parameter

    // Calculate the total size including spacing
    const totalSizeWithSpacing =
      spacesPerSide * cellSize + (spacesPerSide - 1) * spacing - 30;
    const startX = generationConfig.startX;
    const startY = generationConfig.startY;

    // Function to calculate value based on terrain
    const calculateValue = (terrain: TerrainType): number => {
      switch (terrain) {
        case "command":
          return 15;
        case "resupply":
          return 10;
        case "city":
          return 8;
        case "forest":
          return 7;
        default:
          return 5;
      }
    };

    // Generate spaces in a square arrangement WITH SPACING
    for (let i = 0; i < totalSpaces; i++) {
      let x, y;
      const side = Math.floor(i / spacesPerSide);
      const posOnSide = i % spacesPerSide;

      // Calculate position WITH SPACING between cells
      switch (side) {
        case 0: // Top side (left to right)
          x = startX + posOnSide * (cellSize + spacing);
          y = startY;
          break;
        case 1: // Right side (top to bottom)
          x = startX + totalSizeWithSpacing;
          y = startY + posOnSide * (cellSize + spacing);
          break;
        case 2: // Bottom side (right to left)
          x = startX + totalSizeWithSpacing - posOnSide * (cellSize + spacing);
          y = startY + totalSizeWithSpacing;
          break;
        case 3: // Left side (bottom to top)
          x = startX;
          y = startY + totalSizeWithSpacing - posOnSide * (cellSize + spacing);
          break;
        default:
          x = 0;
          y = 0;
      }

      // Get terrain from the predefined configuration
      let terrain: TerrainType = "field"; // Default

      if (map.terrainConfig?.spaces) {
        const terrainConfig = map.terrainConfig.spaces.find(
          (config) => config.position === i
        );
        if (terrainConfig) {
          terrain = terrainConfig.terrain;
        }
      }

      // Add the space with determined terrain
      newSpaces.push({
        id: i,
        position: { x, y },
        terrain,
        owner: null,
        unit: null,
        value: calculateValue(terrain),
        level: 0,
      });

      // Create connections to the next space
      connections[i] = [(i + 1) % totalSpaces]; // Connect to next space
    }

    // Store connections
    if (map.connections === undefined) {
      map.connections = connections;
    }

    console.log(
      `Generated ${newSpaces.length} spaces in a square arrangement with spacing`
    );
    return newSpaces;
  }

  // Create a new map in memory
  async create(createMapDto: CreateMapDto): Promise<MapDto> {
    const newMap: MapDto = {
      ...createMapDto,
      difficulty: createMapDto.difficulty || "medium",
      description: createMapDto.description || "",
    };

    this.maps.push(newMap);
    return newMap;
  }

  // Keep your existing method
  getMapMetadata(mapId: string): MapDto | undefined {
    return this.findById(mapId);
  }
}

// Export a singleton instance
export const mapService = new MapService();
