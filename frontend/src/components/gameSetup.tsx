// components/gameSetup.tsx
import React from "react";

interface GameSetupProps {
  player1Id: string;
  setPlayer1Id: (id: string) => void;
  player2Id: string;
  isLoading: boolean;
  gameCreationError: string | null;
  onCreateGame: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({
  player1Id,
  setPlayer1Id,
  player2Id,
  isLoading,
  gameCreationError,
  onCreateGame,
}) => {
  return (
    <div className="game-setup">
      <h2>Start New Game</h2>
      <div className="form-group">
        <label htmlFor="player1">Player 1 ID:</label>
        <input
          type="text"
          id="player1"
          value={player1Id}
          onChange={(e) => setPlayer1Id(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="player2">Player 2 ID:</label>
        <input type="text" id="player2" value={player2Id} disabled={true} />
      </div>
      <button
        onClick={onCreateGame}
        disabled={isLoading}
        className="create-game-button"
      >
        {isLoading ? "Creating..." : "Start New Game"}
      </button>
      {gameCreationError && (
        <div className="error-message">{gameCreationError}</div>
      )}
    </div>
  );
};

export default GameSetup;
