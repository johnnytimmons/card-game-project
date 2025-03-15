import React from "react";
import { Card } from "../../../card-game-backend/src/models/cardModel";
import "./cardTypeLabels.css";
import "./hoverCard.css";

export const CardDisplay: React.FC<{ 
  card: Card, 
  isInHand?: boolean,
  onClick?: () => void,
  style?: React.CSSProperties
}> = ({ card, isInHand = false, onClick, style }) => {
  const getCardTypeCategory = (type: string): string => {
    // Unit types
    if (['Hero', 'Unit'].includes(type)) {
      return 'UNIT';
    }
    // Gear types
    else if (['Gear'].includes(type)) {
      return 'GEAR';
    }
    // Spell types
    else if (['Spell'].includes(type)) {
      return 'SPELL';
    }
    // Default
    return 'UNIT';
  };

  const cardTypeCategory = getCardTypeCategory(card.type);

  const hasAbility = 'abilities' in card && card.abilities;
  const hasDamage = 'damage' in card && typeof card.damage === 'number';
  const hasHealth = 'health' in card && typeof card.health === 'number';
  const hasDefense = 'defense' in card && typeof card.defense === 'number';

  // Simple function to display abilities
  const displayAbilities = () => {
    if (!card.abilities) return '';
    if (typeof card.abilities === 'string') return card.abilities;
    if (Array.isArray(card.abilities)) return card.abilities.join(', ');
    return '';
  };

  // Get header color based on card type
  const getHeaderColor = () => {
    switch(cardTypeCategory) {
      case 'UNIT': return '#ff5c8d';
      case 'GEAR': return '#63c7ff';
      case 'SPELL': return '#7b6ef6';
      default: return '#2979ff';
    }
  };

  // Use the CSS class structure from hoverCard.css
  return (
    <div 
      className={`card shadow ${isInHand ? 'in-hand' : ''}`}
      onClick={onClick}
      style={{
        ...style,
        '--card-header-color': getHeaderColor(),
      } as React.CSSProperties}
    >
      <div className="card-header">
        {card.name}
      </div>
      
      <div className="card-body">
        <dl className="contact-info">
          {/* Card type */}
          <div className="contact-item">
            <dt>Type:</dt>
            <dd>
              <span className={`card-type-label type-${cardTypeCategory.toLowerCase()}`}>
                {card.type}
              </span>
            </dd>
          </div>
          
          {/* Stats section */}
          {(hasDamage || hasHealth || hasDefense) && (
            <div className="contact-item">
              <dt>Stats:</dt>
              <dd className="card-stats">
                {hasDamage && (
                  <span className="stat">⚔️ {card.damage}</span>
                )}
                
                {hasHealth && (
                  <span className="stat">❤️ {card.health}</span>
                )}

                {hasDefense && (
                  <span className="stat">🛡️ {card.defense}</span>
                )}
              </dd>
            </div>
          )}
          
          {/* Ability section */}
          {hasAbility && (
            <div className="contact-item">
              <dt>Ability:</dt>
              <dd>{displayAbilities()}</dd>
            </div>
          )}
          
          {/* Origin section if needed */}
          {card.origin && (
            <div className="contact-item">
              <dt>Origin:</dt>
              <dd>{card.origin}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default CardDisplay;