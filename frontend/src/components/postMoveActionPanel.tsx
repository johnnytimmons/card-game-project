import React from "react";
import { BoardSpaceDto } from "../../../shared/types/map.types";
import { PlayerData } from "../../../shared/types/gameTypes";

interface PostMoveActionPanelProps {
  space: BoardSpaceDto | null;
  players: PlayerData[];
  currentPlayerIndex: number;
  onClaim: () => void;
  onSkip: () => void;
}

const PostMoveActionPanel: React.FC<PostMoveActionPanelProps> = ({
  space,
  players,
  currentPlayerIndex,
  onClaim,
  onSkip,
}) => {
  if (!space) return null;

  const isUnoccupied = !space.owner;
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div
      style={{
        position: "absolute",
        bottom: "120px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.8)",
        padding: "15px",
        borderRadius: "8px",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minWidth: "300px",
        color: "white",
        textAlign: "center",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>
        {isUnoccupied
          ? "You've landed on an unoccupied space!"
          : `This space is occupied by ${space.owner}`}
      </h3>

      {isUnoccupied ? (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={onClaim}
            style={{
              padding: "8px 15px",
              background: "#43b883",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Claim Territory
          </button>
          <button
            onClick={onSkip}
            style={{
              padding: "8px 15px",
              background: "#e25555",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        </div>
      ) : (
        <div>
          <p>
            {space.owner === currentPlayer.id
              ? "This is your territory. You can upgrade it later."
              : "You must pay a toll or battle for this territory."}
          </p>
          <button
            onClick={onSkip}
            style={{
              padding: "8px 15px",
              background: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default PostMoveActionPanel;
