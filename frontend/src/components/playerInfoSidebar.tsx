// components/playerInfoSidebar.tsx
import React from "react";

interface PlayerInfoSidebarProps {
  player1Id: string;
  currentPlayerId: string;
  currentPlayerDP: number;
  territoryDP: number;
  positionDP: number;
  combatDP: number;
  isEquipMode: boolean;
  placementMode: boolean;
  onSaveGame: () => void;
  isLoading: boolean;
  gamePhase: string;
  dpAnimation?: boolean;
}

const PlayerInfoSidebar: React.FC<PlayerInfoSidebarProps> = ({
  player1Id,
  currentPlayerId,
  currentPlayerDP,
  territoryDP,
  positionDP,
  combatDP,
  isEquipMode,
  placementMode,
  onSaveGame,
  isLoading,
  gamePhase,
  dpAnimation = false,
}) => {
  return (
    <div className="game-sidebar">
      <h3>Player Info</h3>
      <div className="player-stats">
        <p>Player: {player1Id}</p>
        <p>Health: 30</p>
        {/* Always show player DP */}
        <div className="deployment-points">
          <h4>
            Deployment Points:{" "}
            {currentPlayerId === player1Id ? currentPlayerDP : "..."}
          </h4>
          <div className="dp-breakdown">
            <div className="dp-category">
              <span className="dp-label">Territory:</span>
              <span className="dp-value">
                {currentPlayerId === player1Id ? territoryDP : "..."}
              </span>
            </div>
            <div className="dp-category">
              <span className="dp-label">Position:</span>
              <span className="dp-value">
                {currentPlayerId === player1Id ? positionDP : "..."}
              </span>
            </div>
            <div className="dp-category">
              <span className="dp-label">Combat:</span>
              <span className="dp-value">
                {currentPlayerId === player1Id ? combatDP : "..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add turn indicator here */}
      {currentPlayerId === player1Id ? (
        <div className="your-turn-indicator">Your Turn</div>
      ) : (
        <div className="waiting-indicator">Computer's Turn</div>
      )}

      <div className="game-log">
        <h3>Actions</h3>
      </div>

      <div className="game-info">
        <div className="game-actions">
          <button
            className="save-game-button"
            onClick={onSaveGame}
            disabled={isLoading}
          >
            Save Game
          </button>
        </div>
        {/* Show current mode */}
        {isEquipMode && <p className="mode-indicator">Mode: Equipping</p>}
        {placementMode && <p className="mode-indicator">Mode: Placement</p>}
      </div>
      {gamePhase === "ACTION" && (
        <div
          className="phase-notice"
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "rgba(255, 193, 7, 0.2)",
            border: "1px solid rgba(255, 193, 7, 0.5)",
            borderRadius: "8px",
            color: "#856404",
            fontWeight: "bold",
          }}
        >
          Testing mode: Game development stops at ACTION phase
        </div>
      )}
    </div>
  );
};

export default PlayerInfoSidebar;
