import React, { useEffect } from "react";
import ReactDOM from 'react-dom';
import { Card } from "../../../card-game-backend/src/models/cardModel";
import "./cardTypeLabels.css";
import "./hoverCard.css";
import './cardModalOverlay.css';

interface CardModalProps {
  card: Card | null;
  position: { left: number; top: number };
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ 
  card, 
  position, 
  isVisible, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  if (!isVisible || !card) return null;
  
  // Determine card type category
  const getCardTypeCategory = (type: string): string => {
    if (['Hero', 'Unit'].includes(type)) {
      return 'unit';
    } else if (['Gear'].includes(type)) {
      return 'gear';
    } else if (['Spell'].includes(type)) {
      return 'spell';
    }
    return 'gear';
  };
  
  const cardTypeCategory = getCardTypeCategory(card.type);
  
  // Create the modal content with improved event handling
  const modalContent = (
    <div 
      className="card-modal-overlay" 
      style={{
        left: `${position.left}px`,
        top: `${position.top - 110}px`, // Position it above the card
        cursor: 'grab' // Add grab cursor
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`card-banner ${cardTypeCategory}`}>
        <span className="card-type-text">{card.type}</span>
        {card.origin && <span className="card-origin">{card.origin}</span>}
      </div>
      
      <h3 className="card-name-display">{card.name}</h3>
      
      <div className="card-art-container">
        <div className={`card-art-placeholder ${cardTypeCategory}`}>
          <span className="card-type-icon">
            {cardTypeCategory === 'unit' ? '⚔️' : 
             cardTypeCategory === 'gear' ? '🛡️' : 
             cardTypeCategory === 'spell' ? '✨' : '📜'}
          </span>
        </div>
      </div>
      
      {/* Stats display */}
      {(card.damage !== undefined || card.health !== undefined || card.defense !== undefined) && (
        <div className="card-stats-container">
          {card.damage !== undefined && (
            <div className="card-stat damage">
              <span className="stat-icon">⚔️</span>
              <span className="stat-value">{card.damage}</span>
            </div>
          )}
          
          {card.health !== undefined && (
            <div className="card-stat health">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{card.health}</span>
            </div>
          )}
          
          {card.defense !== undefined && (
            <div className="card-stat defense">
              <span className="stat-icon">🛡️</span>
              <span className="stat-value">{card.defense}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Power display */}
      {card.power && (
        <div className="card-power-display">
          <span className="power-label">Power:</span>
          <span className="power-value">{card.power}</span>
        </div>
      )}
      
      {/* Abilities section */}
      {card.abilities && (
        <div className="card-abilities-section">
          <div className="section-header">Abilities</div>
          {typeof card.abilities === 'string' ? (
            <p className="card-ability-text">{card.abilities}</p>
          ) : (
            <ul className="card-abilities-list">
              {(Array.isArray(card.abilities) ? card.abilities : [card.abilities]).map((ability: string, idx: number) => (
                <li key={idx} className="card-ability-item">{ability}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Description/flavor text */}
      {card.description && (
        <div className="card-description">
          <p>{card.description}</p>
        </div>
      )}
    </div>
  );
  
  // Use React Portal to render this outside the normal document flow
  return ReactDOM.createPortal(
    modalContent,
    document.body 
  );
};

export default CardModal;