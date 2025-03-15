import React, { useState, useRef, useEffect } from 'react'; // Missing import
import CardDisplay from './cardDisplay';
import CardModal from './cardModal';
import './cards.css';

interface FixedCardHandProps {
  cards: any[];
  onCardSelect: (card: any) => void;
  selectedCardId?: number;
  isVisible?: boolean; // Control visibility of the modal
  onClose?: () => void; // Optional callback for closing the modal
}

const FixedCardHand: React.FC<FixedCardHandProps> = ({
  cards,
  onCardSelect = () => {},
  selectedCardId,
  isVisible = true,
  onClose
}) => {
  // State for tracking hover and modal
  const [activeCard, setActiveCard] = useState<any>(null);
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 });
  
  // Use refs to track hover states reliably
  const isHoveringCardRef = useRef(false);
  const isHoveringModalRef = useRef(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    isHoveringCardRef.current = true;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({
      left: rect.left + rect.width / 2,
      top: rect.top
    });
    
    setActiveCard(card);
  };
  
  const handleCardMouseLeave = () => {
    isHoveringCardRef.current = false;
    
    // Schedule a check to see if we should hide the modal
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCardRef.current && !isHoveringModalRef.current) {
        setActiveCard(null);
      }
    }, 150); // Longer delay to allow for transition to modal
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
    // to return to the card
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCardRef.current && !isHoveringModalRef.current) {
        setActiveCard(null);
      }
    }, 100);
  };
  
  // Handle card selection
  const handleCardClick = (card: any) => {
    onCardSelect(card);
  };
  
  // If modal is not visible, don't render anything
  if (!isVisible) return null;
  
  return (
    <>
      <div className="card-hand">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card-wrapper ${selectedCardId === card.id ? 'selected-card' : ''}`}
            onClick={() => handleCardClick(card)}
            onMouseEnter={(e) => handleCardMouseEnter(card, e)}
            onMouseLeave={handleCardMouseLeave}
            style={{
              zIndex: index + 1
            }}
          >
            <CardDisplay
              card={card}
              isInHand={true}
            />
          </div>
        ))}
      </div>
      
      <CardModal 
        card={activeCard} 
        position={modalPosition} 
        isVisible={activeCard !== null}
        onMouseEnter={handleModalMouseEnter}
        onMouseLeave={handleModalMouseLeave}
      />
    </>
  );
};

export default FixedCardHand;