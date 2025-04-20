// hooks/useDeploymentPoints.ts
import { useState, useCallback } from "react";
import { calculateTotalDP } from "../../../backend/src/utils/deploymentPoints/deploymentPointSystem";
import { calculateCombatDP } from "../../../backend/src/utils/deploymentPoints/combatPoints";
import { calculatePositionalDP } from "../../../backend/src/utils/deploymentPoints/positionPoints";
import { calculateTerritoryDP } from "../../../backend/src/utils/deploymentPoints/territoryPoints";
import { getCardDeploymentCost } from "../../../backend/src/utils/deploymentPoints/deploymentPointSystem";
import { Card } from "../../../backend/src/models/cardModel";

function useDeploymentPoints(gameId: string | null, playerId: string) {
  const [currentPlayerDP, setCurrentPlayerDP] = useState<number>(2);
  const [territoryDP, setTerritoryDP] = useState<number>(0);
  const [combatDP, setCombatDP] = useState<number>(0);
  const [positionDP, setPositionDP] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<string>("deployment");

  // Use the passed playerId instead of creating a new variable
  const currentPlayerId = playerId;

  const initializeDP = useCallback(() => {
    //start with base of 2 DP for a new game
    setCurrentPlayerDP(2);
    setTerritoryDP(0);
    setCombatDP(0);
    setPositionDP(0);
  }, []);

  const updateDeploymentPoints = useCallback(() => {
    if (!gameId) return;
    console.log(`n*** UPDATING DEPLOYMENT POINTS FOR ${playerId} ***`);
    // Fetch the current game state to pass to the calculation functions
    fetch(`http://localhost:5000/api/game/${gameId}`)
      .then((response) => response.json())
      .then((gameState) => {
        // Add additional logging
        console.log("CURRENT GAME STATE PHASE CHECK:", {
          currentPhase: gameState.currentPhase,
          roundNumber: gameState.roundNumber,
          playerTurn: gameState.playerTurn,
          lastUpdated: new Date(gameState.lastUpdated).toLocaleTimeString(),
        });
        // Ensure phase is never unknown - default to DEPLOYMENT if missing/unknown
        if (
          !gameState.currentPhase ||
          gameState.currentPhase.toUpperCase() === "UNKNOWN"
        ) {
          console.log(
            "Phase was undefined or UNKNOWN, defaulting to DEPLOYMENT"
          );
          gameState.currentPhase = "DEPLOYMENT";
        }
        // Prepare the simple game state with ALL necessary properties
        const simpleGameState = {
          roundNumber: gameState.roundNumber || 1,
          board: gameState.board,
          defeatedUnits: gameState.defeatedUnits || [],
          lastRoundDefeatedUnits: gameState.lastRoundDefeatedUnits || [],
          currentPhase: gameState.currentPhase,
          previousPhase: gameState.previousPhase,
          cardsPlayedThisTurn: gameState.cardsPlayedThisTurn,
        };

        //Calculate Component DP Values
        const territory = calculateTerritoryDP(
          playerId,
          gameState.board,
          gameState
        );
        const combat = calculateCombatDP(playerId, simpleGameState);
        const position = calculatePositionalDP(playerId, gameState.board);
        const total = territory + combat + position;

        //Update with calculated Values
        setTerritoryDP(territory);
        setCombatDP(combat);
        setPositionDP(position);
        setCurrentPlayerDP(total);

        console.log(`*** DP UPDATE COMPLETE: ${total} points available ***`);
      })
      .catch((error) => {
        console.error("Error calculating deployment points:", error);
        // Fall back to placeholders in case of error
        setTerritoryDP(0);
        setCombatDP(0);
        setPositionDP(0);
        setCurrentPlayerDP(2);
      });
  }, [gameId, playerId]);

  const resetDPForNewTurn = useCallback(() => {
    if (!gameId) return;

    // Centralized DP Calculation Method
    const calculateDPWithRules = (gameState: any): number => {
      // Ensure we have all necessary game state information
      const currentPhase = gameState.currentPhase || "DEPLOYMENT";

      // Prepare simplified game state for calculations
      const simpleGameState = {
        roundNumber: gameState.roundNumber,
        board: gameState.board,
        defeatedUnits: gameState.defeatedUnits || [],
        lastRoundDefeatedUnits: gameState.lastRoundDefeatedUnits || [],
        currentPhase: currentPhase,
        previousPhase: gameState.previousPhase,
        cardsPlayedThisTurn: gameState.cardsPlayedThisTurn,
      };

      // Calculate individual DP components
      const territoryDP = calculateTerritoryDP(
        currentPlayerId,
        gameState.board,
        simpleGameState
      );
      const combatDP = calculateCombatDP(currentPlayerId, simpleGameState);
      const positionDP = calculatePositionalDP(
        currentPlayerId,
        gameState.board
      );

      // Explicit DP Calculation Rules
      let totalDP = 0;
      switch (currentPhase.toUpperCase()) {
        case "DEPLOYMENT":
          // Base DP + component DPs only in deployment phase
          totalDP = 2 + territoryDP + combatDP + positionDP;
          console.log(`🟢 Deployment Phase: Base DP (2) + Component DPs`);
          break;
        case "EVOLUTION":
        case "ACTION":
        case "DEFENSE":
        case "BATTLE_RESOLUTION":
          // No base DP, only component DPs
          totalDP = territoryDP + combatDP + positionDP;
          console.log(`🔶 Non-Deployment Phase: Component DPs Only`);
          break;
        default:
          // Fallback to minimal DP
          totalDP = 0;
          console.warn(
            `❗ Unexpected Phase: ${currentPhase}, Defaulting to 0 DP`
          );
      }

      // Detailed logging of DP breakdown
      console.log(`💡 DP Calculation Breakdown:`, {
        phase: currentPhase,
        territoryDP,
        combatDP,
        positionDP,
        totalDP,
      });

      // Ensure DP never goes negative
      return Math.max(0, totalDP);
    };

    // Fetch game state and calculate DP
    fetch(`http://localhost:5000/api/game/${gameId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch game state");
        }
        return response.json();
      })
      .then((gameState) => {
        // Calculate DP using centralized method
        const calculatedDP = calculateDPWithRules(gameState);

        // Update all DP-related states
        setCurrentPlayerDP(calculatedDP);
        setTerritoryDP(
          calculateTerritoryDP(currentPlayerId, gameState.board, gameState)
        );
        setCombatDP(calculateCombatDP(currentPlayerId, gameState));
        setPositionDP(calculatePositionalDP(currentPlayerId, gameState.board));

        console.log(`✅ Synchronized DP: ${calculatedDP}`);
      })
      .catch((error) => {
        console.error("❌ DP Synchronization Failed:", error);

        // Fallback mechanism with minimal DP
        const fallbackDP = gamePhase === "DEPLOYMENT" ? 2 : 0;
        setCurrentPlayerDP(fallbackDP);
        setTerritoryDP(0);
        setCombatDP(0);
        setPositionDP(0);

        console.warn(`⚠️ Fallback DP Applied: ${fallbackDP}`);
      });
  }, [gameId, currentPlayerId, gamePhase]);

  const deductDPForCard = useCallback((card: Card) => {
    const cost = getCardDeploymentCost(card);
    console.log(`Deducting ${cost} DP for playing ${card.name}`);
    setCurrentPlayerDP((prev) => Math.max(0, prev - cost));
  }, []);

  // Add a method to sync DP with server
  const syncWithServerDP = useCallback(() => {
    if (!gameId) return;

    // Fetch the current game state to recalculate DP
    fetch(`http://localhost:5000/api/game/${gameId}`)
      .then((response) => response.json())
      .then((gameState) => {
        // Prepare the simple game state with ALL necessary properties
        const simpleGameState = {
          roundNumber: gameState.roundNumber || 1,
          board: gameState.board,
          defeatedUnits: gameState.defeatedUnits || [],
          lastRoundDefeatedUnits: gameState.lastRoundDefeatedUnits || [],
          currentPhase: gameState.currentPhase,
          previousPhase: gameState.previousPhase,
          cardsPlayedThisTurn: gameState.cardsPlayedThisTurn,
        };

        // Recalculate DP components
        const territory = calculateTerritoryDP(
          playerId,
          gameState.board,
          simpleGameState
        );
        const combat = calculateCombatDP(playerId, simpleGameState);
        const position = calculatePositionalDP(playerId, gameState.board);
        const total = territory + combat + position;

        // Update state with new DP values
        setTerritoryDP(territory);
        setCombatDP(combat);
        setPositionDP(position);
        setCurrentPlayerDP(total);

        console.log(
          `Synced DP with server: Total ${total} (Territory: ${territory}, Combat: ${combat}, Position: ${position})`
        );
      })
      .catch((error) => {
        console.error("Error syncing deployment points:", error);
        // Fallback to default DP if sync fails
        setCurrentPlayerDP(2);
        setTerritoryDP(0);
        setCombatDP(0);
        setPositionDP(0);
      });
  }, [gameId, playerId]);

  // Rest of the code remains the same as in your original implementation...

  return {
    currentPlayerDP,
    territoryDP,
    combatDP,
    positionDP,
    initializeDP,
    updateDeploymentPoints,
    resetDPForNewTurn,
    setCurrentPlayerDP,
    deductDPForCard,
    syncWithServerDP,
  };
}

export default useDeploymentPoints;
