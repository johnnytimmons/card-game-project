import { useState, useRef, useEffect } from "react";

function useGameCreation(onGameCreated?: (gameId: string) => void) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [player1Id, setPlayer1Id] = useState<string>("player1");
  const [player2Id] = useState<string>("Computer");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameCreationError, setGameCreationError] = useState<string | null>(
    null
  );
  // Add a ref to track game ID changes
  const gameIdRef = useRef<string | null>(null);
  useEffect(() => {
    console.log("🔍 GameID tracking:", {
      stateGameId: gameId,
      refGameId: gameIdRef.current,
      stackTrace: new Error().stack,
    });
  }, [gameId]);
  const handleCreateGame = () => {
    setIsLoading(true);
    fetch("http://localhost:5000/api/game/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player1Id, player2Id }),
    })
      .then((response) => {
        console.log("Game creation response status:", response.status);
        if (!response.ok) throw new Error("Failed to create game");
        return response.json();
      })
      .then((data) => {
        console.log("Game created successfully:", data);

        // Set gameId and update ref
        const newGameId = data.id;
        setGameId(newGameId);
        gameIdRef.current = newGameId;
        setGameCreationError(null);

        console.log("🎲 Calling onGameCreated callback with:", newGameId);
        if (onGameCreated) {
          onGameCreated(newGameId);
        }
      })
      .catch((err) => {
        console.error("Error creating game:", err);
        setGameCreationError("Error creating game: " + err.message);
        // Ensure gameId is null on error
        setGameId(null);
        gameIdRef.current = null;
      })
      .finally(() => setIsLoading(false));
  };

  return {
    gameId,
    setGameId,
    player1Id,
    setPlayer1Id,
    player2Id,
    isLoading,
    gameCreationError,
    handleCreateGame,
  };
}
export default useGameCreation;
