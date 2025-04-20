import React from "react";
import { MovementState } from "../../../shared/types/gameTypes";
import { BoardSpaceDto } from "../../../shared/types/map.types";

interface MovementPathProps {
  movementState: MovementState;
  spaces: BoardSpaceDto[];
}

const MovementPath: React.FC<MovementPathProps> = ({
  movementState,
  spaces,
}) => {
  const { isAnimating, path, currentPathIndex } = movementState;

  if (!isAnimating || path.length <= 1) {
    return null;
  }

  return (
    <>
      {path.map((spaceId, index) => {
        // Only show path spaces we've passed through and the next space
        if (index <= currentPathIndex + 1 && index > 0) {
          const space = spaces.find((s) => s.id === spaceId);
          if (space) {
            return (
              <div
                key={`path-${index}`}
                className="movement-path-indicator"
                style={{
                  position: "absolute",
                  left: `${space.position.x}px`,
                  top: `${space.position.y}px`,
                  width: "20px",
                  height: "20px",
                  background:
                    index === currentPathIndex + 1
                      ? "rgba(255, 204, 0, 0.8)"
                      : "rgba(255, 204, 0, 0.4)",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 50,
                  transition: "all 0.3s ease",
                }}
              />
            );
          }
        }
        return null;
      })}
    </>
  );
};

export default MovementPath;
