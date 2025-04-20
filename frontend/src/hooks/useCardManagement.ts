import { useState, useCallback, useEffect } from "react";
import { Card } from "../../../backend/src/models/cardModel";
import { GamePhase } from "../../../backend/src/types/gameTypes";
import {
  getCardDeploymentCost,
  canDeployCard,
} from "../../../backend/src/utils/deploymentPoints/deploymentPointSystem";

function useCardManagement(
  gameId: string | null,
  currentPlayerId: string,
  currentPlayerDP: number,
  gamePhase: GamePhase
) {
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardIsPlaceable, setCardIsPlaceable] = useState<boolean>(false);
  const [cardUsageOptions, setCardUsageOptions] = useState<string[]>([]);
  const [selectedCardMode, setSelectedCardMode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if a card is a gear card
  const isGearCard = useCallback((card: Card, mode?: string): boolean => {
    if (mode === "Gear") return true;
    if (mode && mode !== "Gear") return false;
    if (card.type === "Gear") return true;
    if (card.usageTypes && Array.isArray(card.usageTypes)) {
      if (card.usageTypes.length === 1 && card.usageTypes.includes("Gear")) {
        return true;
      }
    }
    return false;
  }, []);

  // Function to check if a card is placeable on the board
  const isCardPlaceable = useCallback((card: Card, mode?: string): boolean => {
    if (mode === "Unit" || mode === "Creature") return true;
    if (mode && mode !== "Unit" && mode !== "Creature") return false;

    const placeableTypes = [
      "Unit",
      "BoardCard",
      "Hero",
      "Creature",
      "Automaton",
      "Vehicle",
    ];

    if (placeableTypes.includes(card.type)) return true;

    if (card.usageTypes && Array.isArray(card.usageTypes)) {
      return card.usageTypes.some(
        (type) => type === "Unit" || placeableTypes.includes(type)
      );
    }

    return false;
  }, []);

  // Function to check if a card can be cast as a spell
  const isSpellCard = useCallback((card: Card, mode?: string): boolean => {
    if (mode === "Spell") return true;
    if (mode && mode !== "Spell") return false;
    if (card.type === "Spell") return true;
    if (card.usageTypes && Array.isArray(card.usageTypes)) {
      return card.usageTypes.includes("Spell");
    }
    return false;
  }, []);

  // Function to handle multi-purpose cards with different usage types
  const getCardUsageOptions = useCallback((card: Card): string[] => {
    if (
      !card.usageTypes ||
      !Array.isArray(card.usageTypes) ||
      card.usageTypes.length <= 1
    ) {
      return [];
    }
    return card.usageTypes;
  }, []);

  // Function to fetch player's hand cards
  const fetchPlayerHand = useCallback(async () => {
    if (!gameId || !currentPlayerId) {
      console.log("⚠️ Cannot fetch hand: no game ID or player ID");
      throw new Error("No game ID or player ID");
    }
    // Important: Use the correct player ID for fetching
    const playerIdToFetch =
      currentPlayerId === "Computer" ? "Computer" : currentPlayerId;

    console.log(
      `🔍 FETCHING HAND for player: ${playerIdToFetch} in game: ${gameId}`
    );
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/game/${gameId}/hand`,
        {
          headers: { "player-id": playerIdToFetch },
        }
      );
      console.log("📊 Hand fetch response status:", response.status);
      if (!response.ok) {
        console.error("❌ Hand fetch response not OK:", response.status);
        throw new Error("Failed to fetch player hand");
      }

      const data = await response.json();
      console.log("✅ Received hand cards:", data);
      console.log("📋 Card count:", data.length);

      setHandCards(data || []);
      setError(null);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameId, currentPlayerId]);

  useEffect(() => {
    console.log("🃏 handCards state updated:", {
      length: handCards.length,
      cards: handCards,
    });
  }, [handCards]);

  // Function to handle card selection from hand
  const handleCardSelect = useCallback(
    (card: Card | null, isPlaceable: boolean = false) => {
      if (!card) {
        setSelectedCard(null);
        setCardIsPlaceable(false);
        setCardUsageOptions([]);
        setSelectedCardMode(null);
        return;
      }

      if (card.cardId === selectedCard?.cardId) {
        // Same card clicked again - deselect it
        setSelectedCard(null);
        setCardIsPlaceable(false);
        setCardUsageOptions([]);
        setSelectedCardMode(null);
        return;
      }

      // Check if player has enough DP to play this card
      const dpCost = getCardDeploymentCost(card);
      if (dpCost > currentPlayerDP) {
        setError(
          `Not enough DP to play ${card.name || "this card"}. Cost: ${dpCost} DP, Available: ${currentPlayerDP} DP`
        );
        setTimeout(() => setError(null), 3000);
        return;
      }

      // First, clear previous card selection state
      setSelectedCardMode(null);

      // Set the selected card regardless of type
      setSelectedCard(card);

      // Check if this is a multi-purpose card
      const usageOptions = getCardUsageOptions(card);
      setCardUsageOptions(usageOptions);

      // If it has multiple usage options, wait for user selection before determining mode
      if (usageOptions.length > 1) {
        setCardIsPlaceable(false);
        return;
      }

      // For single-purpose cards, automatically determine the mode
      if (isGearCard(card) || isSpellCard(card)) {
        setCardIsPlaceable(false); // Not placeable on board directly
      } else {
      }
    },
    [
      selectedCard,
      currentPlayerDP,
      gamePhase,
      isGearCard,
      isSpellCard,
      isCardPlaceable,
      getCardUsageOptions,
    ]
  );

  // Function to handle card mode selection
  const handleCardModeSelect = useCallback(
    (mode: string) => {
      if (!selectedCard) return;

      setSelectedCardMode(mode);
      setCardUsageOptions([]);
    },
    [selectedCard, gamePhase]
  );

  // Function to handle when a card is placed on the board
  const handleCardPlaced = useCallback(
    (placementData: {
      cardId: number;
      position?: any;
      targetPosition?: any;
      gameId: string;
      isGearEquip?: boolean;
      dpCost?: number; // Add this parameter
    }) => {
      // Log the placement
      console.log("Card placement data:", placementData);

      // Remove the card from hand
      setHandCards((prev) =>
        prev.filter((card) => card.cardId !== placementData.cardId)
      );

      // Clear selection-related state
      setSelectedCard(null);
      setCardIsPlaceable(false);
      setSelectedCardMode(null);
      setCardUsageOptions([]);
    },
    [
      setHandCards,
      setSelectedCard,
      setCardIsPlaceable,
      setSelectedCardMode,
      setCardUsageOptions,
    ]
  );

  return {
    handCards,
    setHandCards,
    selectedCard,
    setSelectedCard,
    cardIsPlaceable,
    setCardIsPlaceable,
    cardUsageOptions,
    setCardUsageOptions,
    selectedCardMode,
    setSelectedCardMode,
    isLoading,
    error,
    isGearCard,
    isCardPlaceable,
    isSpellCard,
    getCardUsageOptions,
    fetchPlayerHand,
    handleCardSelect,
    handleCardModeSelect,
    handleCardPlaced,
  };
}

export default useCardManagement;
