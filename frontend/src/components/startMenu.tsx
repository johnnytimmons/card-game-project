// StartMenu.tsx
import React, { useState } from "react";
import { allMaps, mapsByLevel } from "../../../backend/src/data/mapDefinitions";

const StartMenu: React.FC<{
  onStartGame: (mapId: string) => void;
}> = ({ onStartGame }) => {
  const [showScenarios, setShowScenarios] = useState(false);

  // Start campaign automatically uses level 1 map
  const handleStartCampaign = () => {
    onStartGame(mapsByLevel.level1.id);
  };

  // Show scenario selection
  const handlePickScenario = () => {
    setShowScenarios(true);
  };

  // Go back to main menu
  const handleBackToMenu = () => {
    setShowScenarios(false);
  };

  // Render scenario selection screen
  if (showScenarios) {
    return (
      <div className="scenario-selection">
        <h1>Choose a Scenario</h1>
        <div className="scenarios-list">
          {allMaps.map((map) => (
            <div
              key={map.id}
              className="scenario-card"
              onClick={() => onStartGame(map.id)}
            >
              <h2>{map.name}</h2>
              <p>{map.description}</p>
              <div className="difficulty">
                <span>Difficulty: </span>
                <span className={`difficulty-${map.difficulty}`}>
                  {map.difficulty.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button className="back-button" onClick={handleBackToMenu}>
          Back to Main Menu
        </button>
      </div>
    );
  }

  // Render main menu
  return (
    <div className="start-menu">
      <h1>WW2 Card Game</h1>
      <div className="menu-options">
        <button className="campaign-button" onClick={handleStartCampaign}>
          Play Campaign
        </button>
        <button className="scenario-button" onClick={handlePickScenario}>
          Pick Scenario
        </button>
      </div>
    </div>
  );
};

export default StartMenu;
