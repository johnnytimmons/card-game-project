import React, { useState, useRef, useEffect } from "react"; // Missing import
import CardDisplay from "./cardDisplay";
import { getCardDeploymentCost } from "../../../backend/src/utils/deploymentPoints/deploymentPointSystem";

import "./cards.css";

interface FixedCardHandProps {
  cards: any[];
  onCardSelect: (card: any, isPlaceable: boolean) => void;
  selectedCardId?: number;
  isVisible?: boolean;
  onClose?: () => void;
  playerId: string;
  availableDP?: number;
  gamePhase?: string;
  friendlyUnitsOnBoard?: number;
  enemyUnitsOnBoard?: number;
  disabled?: boolean; // Add this prop
}

const FixedCardHand: React.FC<FixedCardHandProps> = ({
  cards,
  onCardSelect = () => {},
  selectedCardId,
  isVisible = true,
  // onClose,
  // playerId,
  availableDP = 0,
  gamePhase = "DEPLOYMENT",
  friendlyUnitsOnBoard = 0,
  enemyUnitsOnBoard = 0,
  disabled = false, // Default to not disabled
}) => {
  // State for tracking hover and modal
  const [activeCard, setActiveCard] = useState<any>(null);
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 });

  // Use refs to track hover states reliably
  const isHoveringCardRef = useRef(false);
  const isHoveringModalRef = useRef(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // If component is not visible, don't render anything
  if (!isVisible) return null;

  // Add this function inside the component
  const renderDPCostBadge = (card: any) => {
    const cost = getCardDeploymentCost(card);
    const affordable = cost <= availableDP;

    return (
      <div
        className={`dp-cost-badge ${affordable ? "affordable" : "too-expensive"}`}
      >
        {cost}
      </div>
    );
  };

  // Function to check if a card is placeable on the board
  const isCardPlaceable = (card: any): boolean => {
    const cost = getCardDeploymentCost(card);

    // First check - enough deployment points?
    if (cost > availableDP) {
      return false;
    }

    // In Culdcept-style games, creature cards can only be placed on unclaimed land
    // or to replace your own creatures on land you already own
    const unitTypes = ["Unit", "Hero", "Creature", "Automaton", "Vehicle"];

    const isUnitType =
      unitTypes.includes(card.type) ||
      card.usageTypes?.some((type: string) => unitTypes.includes(type));

    // Unit cards can be played when the player lands on an unclaimed space
    if (isUnitType) {
      return (
        gamePhase.toUpperCase() === "DEPLOYMENT" ||
        gamePhase.toUpperCase() === "CLAIM"
      );
    }

    // Gear and spell logic can remain similar
    if (card.type === "Gear" || card.usageTypes?.includes("Gear")) {
      return friendlyUnitsOnBoard > 0;
    }

    if (card.type === "Spell" || card.usageTypes?.includes("Spell")) {
      return true; // Simplify for now - spells can be played during appropriate phases
    }

    return false;
  };

  // Remove everything between here and the useEffect hook

  // Effect to manage hover state and cleanup timeouts
  useEffect(() => {
    return () => {
      // Clean up any existing timeouts on unmount
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Effect to manage hover state and cleanup timeouts
  useEffect(() => {
    return () => {
      // Clean up any existing timeouts on unmount
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Update card hover status
  const handleCardMouseEnter = (card: any, event: React.MouseEvent) => {
    if (selectedCardId !== undefined && selectedCardId !== null) {
      return;
    }

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    isHoveringCardRef.current = true;

    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - 150,
    });

    setActiveCard(card);
    // Add console log for debugging
    console.log("Card hover:", card.name, "Selected card:", selectedCardId);
  };

  const handleCardMouseLeave = () => {
    isHoveringCardRef.current = false;

    // Schedule a check to see if we should hide the modal
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCardRef.current && !isHoveringModalRef.current) {
        setActiveCard(null);
      }
    }, 120); // Longer delay to allow for transition to modal
  };
  // Handle card selection with type validation
  const handleCardClick = (card: any) => {
    if (disabled) return; // Don't do anything if disabled

    // Hide any visible modal
    setActiveCard(null);

    // THIS IS THE IMPORTANT PART - actually select the card
    const placeable = isCardPlaceable(card);
    onCardSelect(card, placeable);
  };

  const [modalDisabled, setModalDisabled] = useState(false);

  // Handle modal click with same validation
  const handleModalClick = () => {
    if (activeCard) {
      // Store card in temporary variable before clearing state
      const cardToSelect = activeCard;

      // Immediately hide the modal
      setActiveCard(null);

      // Process the card selection with a slight delay to ensure modal is gone
      setTimeout(() => {
        const placeable = isCardPlaceable(cardToSelect);
        onCardSelect(cardToSelect, placeable);
      }, 10);
    }
  };
  // Update modal hover status
  const handleModalMouseEnter = () => {
    // Clear any pending timeouts when entering the modal
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    isHoveringModalRef.current = true;
  };

  const handleModalMouseLeave = () => {
    isHoveringModalRef.current = false;

    // Use timeout to ensure we're not just briefly leaving the modal
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCardRef.current && !isHoveringModalRef.current) {
        setActiveCard(null);
      }
    }, 100);
  };

  // If modal is not visible, don't render anything
  if (!isVisible) return null;

  return (
    <>
      <div className={`card-hand ${disabled ? "disabled-hand" : ""}`}>
        {cards.map((card, index) => (
          <div
            key={card.cardId}
            className={`card-wrapper 
              ${selectedCardId === card.cardId ? "selected-card" : ""} 
              ${isCardPlaceable(card) ? "placeable" : "non-placeable"}
              ${getCardDeploymentCost(card) > availableDP ? "not-enough-dp" : ""}
              ${disabled ? "disabled" : ""}`}
            onClick={() => handleCardClick(card)}
            onMouseEnter={(e) => handleCardMouseEnter(card, e)}
            onMouseLeave={handleCardMouseLeave}
            style={{
              zIndex: index + 1,
            }}
          >
            {renderDPCostBadge(card)}
            <CardDisplay
              card={card}
              isInHand={true}
              onClick={() => {
                handleCardClick(card);
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default FixedCardHand;
