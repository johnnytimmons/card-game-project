// hooks/useTurnManagement.ts
import { useState, useCallback } from "react";
import { GamePhase } from "../../../backend/src/models/gamePhases";

function useTurnManagement(
  gameId: string | null,
  player1Id: string,
  player2Id: string,
  resetDPForNewTurn: () => void,
  fetchPlayerHand: () => Promise<any>
) {
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(player1Id);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.DEPLOYMENT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getPhaseDisplayName = useCallback((phase: GamePhase) => {
    return (
      phase.charAt(0).toUpperCase() + phase.slice(1).replace(/([A-Z])/g, " $1")
    );
  }, []);
  const handleTurnChange = useCallback(
    (newPlayerId: string) => {
      // Validate the new player ID
      if (newPlayerId !== player1Id && newPlayerId !== player2Id) {
        console.warn(`Invalid player ID: ${newPlayerId}`);
        return;
      }

      console.log(`Turn management: Updating current player to ${newPlayerId}`);
      setCurrentPlayerId(newPlayerId);

      // If it's switching to the human player's turn, refresh their hand and DP
      if (newPlayerId === player1Id) {
        resetDPForNewTurn();
        fetchPlayerHand().catch((err) => {
          console.error("Failed to refresh hand after turn change:", err);
        });
      }
    },
    [player1Id, player2Id, resetDPForNewTurn, fetchPlayerHand]
  );
  const handleEndTurn = useCallback(() => {
    if (!gameId) {
      setError("No active game");
      return;
    }

    setIsLoading(true);
    console.log(`Player ${currentPlayerId} is ending their turn`);

    // Call the end turn endpoint WITHOUT advancing the phase
    fetch("http://localhost:5000/api/game/end-turn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "player-id": currentPlayerId,
      },
      body: JSON.stringify({
        gameId,
        advancePhase: false, // Explicitly tell the backend not to change phase
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to end turn");
        return response.json();
      })
      .then((data) => {
        console.log("Turn ended, next player:", data.playerTurn);
        console.log("Phase unchanged:", data.currentPhase);
        // Update local state
        setCurrentPlayerId(data.playerTurn);

        // If it's the human player's turn, reset DP
        if (data.playerTurn === player1Id) {
          resetDPForNewTurn();
          fetchPlayerHand();
        }

        setError(null);
      })
      .catch((err) => {
        console.error("Error ending turn:", err);
        setError("Error ending turn: " + err.message);
      })
      .finally(() => setIsLoading(false));
  }, [gameId, currentPlayerId, player1Id, resetDPForNewTurn, fetchPlayerHand]);

  const handleAdvancePhase = useCallback(() => {
    if (!gameId) {
      setError("No active game");
      return;
    }

    setIsLoading(true);
    console.log(
      `Player ${currentPlayerId} is advancing from ${gamePhase} phase`
    );

    // Call the endpoint to advance the phase
    fetch("http://localhost:5000/api/game/advance-phase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "player-id": currentPlayerId,
      },
      body: JSON.stringify({ gameId }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Failed to advance phase: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Phase advanced response:", data);
        console.log("New phase from server:", data.currentPhase);

        // Explicitly update local phase state
        setGamePhase(data.currentPhase);

        // Explicitly trigger a DP recalculation
        resetDPForNewTurn();

        // Refresh the player's hand
        fetchPlayerHand();

        setError(null);
      })
      .catch((err) => {
        console.error("Error advancing phase:", err);
        setError("Error advancing phase: " + err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [gameId, currentPlayerId, gamePhase, resetDPForNewTurn, fetchPlayerHand]);
  return {
    currentPlayerId,
    setCurrentPlayerId,
    gamePhase,
    setGamePhase,
    isLoading,
    error,
    getPhaseDisplayName,
    handleEndTurn,
    handleTurnChange,
    handleAdvancePhase,
  };
}
export default useTurnManagement;
