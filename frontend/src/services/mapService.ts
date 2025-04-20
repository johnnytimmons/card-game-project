import { MapDto, TerrainType } from "../../../shared/types/map.types";
import { BoardSpaceDto } from "../../../shared/types/map.types";

export class MapService {
  private cachedMaps: MapDto[] = [];
  private mapCache: Map<string, BoardSpaceDto[]> = new Map();

  async fetchAvailableMaps(): Promise<MapDto[]> {
    try {
      const response = await fetch("http://localhost:3001/api/maps");
      if (!response.ok) {
        throw new Error("Failed to fetch maps");
      }
      this.cachedMaps = await response.json();
      return this.cachedMaps;
    } catch (error) {
      console.error("Error fetching maps:", error);
      return [];
    }
  }

  async getMapById(mapId: string): Promise<BoardSpaceDto[]> {
    // Check cache first
    if (this.mapCache.has(mapId)) {
      return this.mapCache.get(mapId)!;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/maps/${mapId}/generate`
      );
      if (!response.ok) {
        throw new Error(`Failed to generate map ${mapId}`);
      }
      const generatedSpaces = await response.json();

      // Cache the generated map
      this.mapCache.set(mapId, generatedSpaces);

      return generatedSpaces;
    } catch (error) {
      console.error("Error generating map:", error);
      return [];
    }
  }

  // Utility method to get map metadata without regenerating
  getMapMetadata(mapId: string): MapDto | undefined {
    return this.cachedMaps.find((map) => map.id === mapId);
  }

  // Generate map spaces client-side as a fallback
  generateMapSpaces(mapId: string): BoardSpaceDto[] {
    console.log(`Generating spaces for map ${mapId}`);
    const map = this.getMapMetadata(mapId);
    if (!map) {
      throw new Error(`Map with ID ${mapId} not found`);
    }

    // Get the predefined map configuration
    const { generationConfig, terrainConfig } = map;
    const newSpaces: BoardSpaceDto[] = [];
    const connections: Record<number, number[]> = {};

    // Use the same circular positioning logic
    const totalSpaces = generationConfig.spacesPerSide * 4; // Total spaces on the board

    // Define the center and radius of our circle
    const centerX =
      generationConfig.startX +
      (generationConfig.spacesPerSide * generationConfig.cellSize) / 2;
    const centerY =
      generationConfig.startY +
      (generationConfig.spacesPerSide * generationConfig.cellSize) / 2;
    const radius =
      (generationConfig.spacesPerSide * generationConfig.cellSize) / 2;

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

    // Generate spaces around the circle using predefined terrains
    for (let i = 0; i < totalSpaces; i++) {
      // Calculate position on the circle
      const angle = (i / totalSpaces) * 2 * Math.PI; // Angle in radians
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Determine if this is a corner (we'll say every 6th space)
      const isCorner = i % (totalSpaces / 4) === 0;

      // Get the terrain from the predefined configuration
      const terrainAssignment = terrainConfig?.spaces.find(
        (space) => space.position === i
      );

      // Use the predefined terrain or fallback to a default
      const terrain = terrainAssignment ? terrainAssignment.terrain : "field";

      // Add the space
      newSpaces.push({
        id: i,
        position: { x, y },
        terrain,
        isCorner,
        owner: null,
        unit: null,
        value: calculateValue(terrain),
        level: 0,
      });

      // Create connections to the next space in the circle
      connections[i] = [(i + 1) % totalSpaces]; // Connect to next space
    }

    // Store connections if not already defined
    if (!map.connections) {
      map.connections = connections;
    }

    console.log(
      `Generated ${newSpaces.length} spaces in a circular arrangement`
    );
    return newSpaces;
  }
}

// Create a singleton instance
export const mapService = new MapService();
