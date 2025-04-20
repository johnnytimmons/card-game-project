import React, { useState } from "react";
import "./diceRoller.css"; // We'll create this next

interface DiceRollerProps {
  onRoll: (value: number) => void;
  onPhaseChange: () => void;
  disabled?: boolean;
  currentPhase: string;
  value: number | null;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
  onRoll,
  onPhaseChange,
  disabled = false,
  currentPhase,
  value,
}) => {
  const [rolling, setRolling] = useState(false);

  const handleButtonClick = () => {
    if (rolling || disabled) return;

    // Handle different actions based on the current phase
    switch (currentPhase) {
      case "DRAW":
      case "SELECTION":
      case "AFTER_MOVE":
        // Just advance to the next phase
        onPhaseChange();
        break;

      case "MOVE":
        // Roll the dice
        setRolling(true);

        // Simulate rolling animation
        let rollCount = 0;
        const maxRolls = 10;
        let rollingValue = 0;

        const rollInterval = setInterval(() => {
          rollingValue = Math.floor(Math.random() * 6) + 1; // 1-6

          rollCount++;
          if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            setRolling(false);

            // Call the parent component's handler with the final value
            onRoll(rollingValue);
          }
        }, 100);
        break;

      default:
        break;
    }
  };

  // Get button text based on current phase
  const getButtonText = () => {
    if (rolling) return value;

    switch (currentPhase) {
      case "DRAW":
        return "Draw Cards";
      case "MOVE":
        return "Roll Dice";
      case "AFTER_MOVE":
        return `Rolled: ${value}`;
      case "CLAIM":
        return "Claim Space";
      case "BATTLE":
        return "Start Battle";
      case "UPGRADE":
        return "Upgrade Space";
      case "END_TURN":
        return "End Turn";
      default:
        return "Next Phase";
    }
  };

  return (
    <div className="dice-roller">
      <button
        className={`dice-button ${rolling ? "rolling" : ""} phase-${currentPhase.toLowerCase()}`}
        onClick={handleButtonClick}
        disabled={disabled || rolling}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default DiceRoller;
