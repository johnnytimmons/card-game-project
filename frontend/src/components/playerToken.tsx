import React from "react";
import "./playerToken.css";

// Define the player data interface
export interface PlayerData {
  id: string;
  name: string;
  color: string;
  deploymentPoints: number;
  ownedCells: number[];
  position: number | null;
}

interface PlayerTokenProps {
  player: PlayerData;
  position: { x: number; y: number };
  isMoving?: boolean;
  onClick?: () => void;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  position,
  isMoving = false,
  onClick,
}) => {
  return (
    <div
      className={`player-token ${isMoving ? "moving" : ""}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: player.color,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    >
      <div className="player-initials">{player.name.slice(0, 2)}</div>
    </div>
  );
};

export default PlayerToken;
