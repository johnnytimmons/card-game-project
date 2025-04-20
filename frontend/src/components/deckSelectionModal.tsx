import React, { useState, useEffect, useRef, useCallback } from "react";
import "./DeckSelectionModal.css";

interface DeckType {
  id: string;
  name: string;
  description: string;
}

interface DeckSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckSelect: (deckId: string) => void;
  decks?: DeckType[];
}

const DeckSelectionModal: React.FC<DeckSelectionModalProps> = ({
  isOpen,
  onClose,
  onDeckSelect,
  decks: providedDecks = [],
}) => {
  const [deckOptions, setDeckOptions] = useState<DeckType[]>([]); // Renamed state variable
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const fetchedRef = useRef(false);

  // First check if decks were provided as props, otherwise fetch them
  useEffect(() => {
    if (isOpen) {
      if (providedDecks.length > 0) {
        // Use decks from props
        setDeckOptions(providedDecks);
        if (providedDecks.length > 0 && !selectedDeckId) {
          setSelectedDeckId(providedDecks[0].id);
        }
        setLoading(false);
      } else if (!fetchedRef.current) {
        // Only fetch if we haven't already
        fetchedRef.current = true;
        setLoading(true);

        fetch("http://localhost:5000/api/game/decks")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch deck types");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Fetched decks:", data);
            setDeckOptions(data);
            if (data.length > 0 && !selectedDeckId) {
              setSelectedDeckId(data[0].id);
            }
            setError(null);
          })
          .catch((err) => {
            console.error("Error fetching decks:", err);
            setError("Failed to load deck options. Please try again.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [isOpen, providedDecks, selectedDeckId]);

  // Reset fetch ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      fetchedRef.current = false;
    }
  }, [isOpen]);

  // Handle selecting a deck
  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
  };

  const handleConfirm = () => {
    if (selectedDeckId) {
      console.log("Deck selected:", selectedDeckId);
      onDeckSelect(selectedDeckId);
      onClose();
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="deck-selection-modal">
        <div className="modal-header">
          <h2>Choose Your Deck</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading">Loading available decks...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="deck-list">
              {deckOptions.map(
                (
                  deck // Use deckOptions here instead of decks
                ) => (
                  <div
                    key={deck.id}
                    className={`deck-option ${selectedDeckId === deck.id ? "selected" : ""}`}
                    onClick={() => handleDeckSelect(deck.id)}
                  >
                    <h3>{deck.name}</h3>
                    <p>{deck.description}</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={!selectedDeckId || loading}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckSelectionModal;
