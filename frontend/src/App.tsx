import React, { useState } from "react";
import StartMenu from "./components/startMenu";
import GameBoard from "./components/gameBoard";
import "./App.css";

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  // Start game with the selected map
  const handleStartGame = (mapId: string) => {
    setSelectedMapId(mapId);
    setGameStarted(true);
  };

  // Return to main menu
  const handleReturnToMenu = () => {
    setGameStarted(false);
    setSelectedMapId(null);
  };

  // Show either the start menu or the game board
  return (
    <div className="app">
      {!gameStarted ? (
        <StartMenu onStartGame={handleStartGame} />
      ) : (
        <div className="game-container">
          <GameBoard
            mapId={selectedMapId || ""}
            onReturnToMenu={handleReturnToMenu}
          />
        </div>
      )}
    </div>
  );
};

export default App;
