import { useState, useCallback } from "react";

function useDeckSelection(
  gameId: string | null,
  currentPlayerId: string,
  onDeckSelected: () => void,
  fetchPlayerHand: () => Promise<any> // Define the parameter with correct type
) {
  const [decks, setDecks] = useState([]);
  const [showDeckModal, setShowDeckModal] = useState<boolean>(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableDecks = useCallback(() => {
    if (!gameId) return;

    console.log("Fetching available decks");
    setIsLoading(true);

    fetch("http://localhost:5000/api/game/decks")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch decks");
        return response.json();
      })
      .then((data) => {
        console.log("Available decks:", data);
        setDecks(data);
        setShowDeckModal(true);
      })
      .catch((err) => {
        console.error("Error fetching decks:", err);
        setError("Error fetching decks: " + err.message);
      })
      .finally(() => setIsLoading(false));
  }, [gameId]);

  const handleDeckSelect = useCallback(
    (deckId: string) => {
      console.log("🎲 Attempting to select deck:", deckId);
      console.log("Current state before selection:", {
        gameId,
        currentPlayerId,
        selectedDeckId,
        showDeckModal,
      });

      // Set selected deck ID immediately
      setSelectedDeckId(deckId);

      if (!gameId || !currentPlayerId) {
        console.error("Cannot update deck: no game ID or player ID");
        setError("Cannot update deck: missing game or player ID");
        return;
      }

      setIsLoading(true);
      const apiUrl = `http://localhost:5000/api/game/${gameId}/player/deck`;

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "player-id": currentPlayerId,
        },
        body: JSON.stringify({ deckId }),
      })
        .then((response) => {
          return response.text().then((text) => {
            if (!response.ok) {
              throw new Error(`Failed to update deck: ${response.status}`);
            }
            try {
              return JSON.parse(text);
            } catch (e) {
              throw new Error("Invalid JSON response from server");
            }
          });
        })
        .then((data) => {
          console.log("🎲 Deck selection response:", data);

          if (data && data.players && data.players[currentPlayerId]) {
            // Close the deck modal after successful selection
            setShowDeckModal(false);
            setError(null);
            onDeckSelected();

            // Now we'll call fetchPlayerHand as a separate step
            // Make sure it's properly defined before calling
            if (typeof fetchPlayerHand === "function") {
              console.log("🎮 Deck selected, about to fetch player hand");
              return fetchPlayerHand()
                .then((cards) => {
                  console.log("🎮 Player hand fetched successfully:", cards);
                  console.log("Final state after deck selection:", {
                    gameId,
                    currentPlayerId,
                    selectedDeckId: deckId,
                    showDeckModal: false,
                  });
                  return cards;
                })
                .catch((err) => {
                  console.error("🎮 Error fetching player hand:", err);
                  throw err; // Re-throw to trigger catch block
                });
            } else {
              console.warn("fetchPlayerHand is not a function");
              throw new Error("Invalid hand fetch function");
            }
          } else {
            throw new Error("Invalid response format from deck update");
          }
        })

        .finally(() => setIsLoading(false));
    },
    [
      gameId,
      currentPlayerId,
      onDeckSelected,
      fetchPlayerHand,
      selectedDeckId,
      showDeckModal,
    ]
  );

  return {
    decks,
    showDeckModal,
    selectedDeckId,
    isLoading,
    error,
    fetchAvailableDecks,
    handleDeckSelect,
    setShowDeckModal,
  };
}
export default useDeckSelection;
