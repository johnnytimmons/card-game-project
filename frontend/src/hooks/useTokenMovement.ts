import { useState } from "react";
import { BoardSpaceDto } from "../../../shared/types/map.types";
import { PlayerData } from "../../../shared/types/gameTypes"; // Import the shared type

interface MovementState {
  isAnimating: boolean;
  path: number[];
  currentPathIndex: number;
}
interface UseTokenMovementProps {
  spaces: BoardSpaceDto[];
  connections: Record<number, number[]>;
  players: PlayerData[]; // This is now the same PlayerData from shared types
  currentPlayerIndex: number;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerData[]>>;
  onMoveComplete: (finalSpaceId: number) => void;
}

export function useTokenMovement({
  spaces,
  connections,
  players,
  currentPlayerIndex,
  setPlayers,
  onMoveComplete,
}: UseTokenMovementProps) {
  const [movementState, setMovementState] = useState<MovementState>({
    isAnimating: false,
    path: [],
    currentPathIndex: 0,
  });

  // Creates a path of spaces to move through
  const createMovementPath = (
    startSpaceId: number,
    steps: number
  ): number[] => {
    const path: number[] = [startSpaceId];
    let currentId = startSpaceId;

    for (let i = 0; i < steps; i++) {
      // Find the next connected space
      const connectedSpaces = connections[currentId] || [];
      if (connectedSpaces.length > 0) {
        const nextId = connectedSpaces[0];
        path.push(nextId);
        currentId = nextId;
      }
    }

    console.log("Created movement path:", path);
    return path;
  };

  // Start token movement animation
  const startMovement = (startSpaceId: number, steps: number) => {
    if (startSpaceId === null) {
      console.error("Cannot move: Player has no position");
      return;
    }

    // Create the path
    const path = createMovementPath(startSpaceId, steps);

    if (path.length <= 1) {
      // No real movement to animate
      if (path.length === 1) {
        onMoveComplete(path[0]);
      }
      return;
    }

    // Set up initial state
    setMovementState({
      isAnimating: true,
      path,
      currentPathIndex: 0,
    });

    // Start the movement animation
    animateAlongPath(path);
  };

  // Animate the token movement along the path
  const animateAlongPath = (path: number[]) => {
    let step = 0;

    const intervalId = setInterval(() => {
      step++;

      // Update the movement state
      setMovementState((prev) => ({
        ...prev,
        currentPathIndex: step,
      }));

      // Update player position for current step
      setPlayers((prevPlayers) => {
        const newPlayers = [...prevPlayers];
        newPlayers[currentPlayerIndex] = {
          ...newPlayers[currentPlayerIndex],
          position: path[step],
        };
        return newPlayers;
      });

      // If we've reached the end of the path
      if (step >= path.length - 1) {
        clearInterval(intervalId);
        finishMovement(path[path.length - 1]);
      }
    }, 500); // Move to next space every 500ms
  };

  // Finish the movement animation
  const finishMovement = (finalSpaceId: number) => {
    setMovementState({
      isAnimating: false,
      path: [],
      currentPathIndex: 0,
    });

    // Notify parent component that movement is complete
    onMoveComplete(finalSpaceId);
  };

  return {
    movementState,
    startMovement,
  };
}
