// src/utils/boardGenerator.ts
import { BoardSpace, GameBoard, SpaceType } from "../models/boardSpaceModel";

// Define a type for the options
interface BoardOptions {
  spaceCount?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
}

/**
 * Generates a circular game board
 */
export function generateCircularBoard(options: BoardOptions = {}): GameBoard {
  // Options with defaults
  const spaceCount = options.spaceCount || 24;
  const radius = options.radius || 200;
  const centerX = options.centerX || 250;
  const centerY = options.centerY || 250;

  const spaces: BoardSpace[] = [];
  const connections: Record<number, number[]> = {};

  // Get all space types from the enum
  const spaceTypes = Object.values(SpaceType);

  // Create spaces around a circle
  for (let i = 0; i < spaceCount; i++) {
    // Calculate position on the circle
    const angle = (i / spaceCount) * 2 * Math.PI;
    const x = radius * Math.cos(angle) + centerX;
    const y = radius * Math.sin(angle) + centerY;

    // Pick a space type based on position
    const type = spaceTypes[i % spaceTypes.length];

    // Create the space
    spaces.push({
      id: i,
      type: type,
      owner: null,
      position: { x, y },
      unit: null,
      value: 5,
      level: 0,
    });

    // Connect to the next space in the circle
    connections[i] = [(i + 1) % spaceCount];
  }

  return { spaces, connections };
}
