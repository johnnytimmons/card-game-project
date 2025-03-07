import React from "react";
import { Card } from "../../../card-game-backend/src/models/cardModel";

// Updated props interface to include isInHand
export const CardDisplay: React.FC<{ card: Card, isInHand?: boolean }> = ({ card, isInHand = false }) => {
  // Type and property checks remain the same
  const isUnitType = card.type === 'Hero' || card.type === 'Unit' || 
                    card.type === 'Creature' || card.type === 'Automaton';
  const isGearType = card.type === 'Defense' || card.type === 'Heal';
  
  const hasAbility = 'ability' in card && card.ability;
  const hasDamage = 'damage' in card && typeof card.damage === 'number';
  const hasHealth = 'health' in card && typeof card.health === 'number';
  const hasDefense = 'defense' in card && typeof card.defense === 'number';

  // Return different layouts based on whether the card is in hand
  if (isInHand) {
    // Horizontal layout for cards in hand
    return (
<li className={`card-display ${isInHand ? 'hand-card' : ''}`}>
        {/* Left section: Name and type */}
        <div className="card-header">
          <span className="card-name">{card.name}</span>
          <span className="card-type">{card.type}</span>
        </div>
        
        {/* Icon section */}
        <div className="card-illustration">
          {isUnitType ? "⚔️" : isGearType ? "🛡️" : "🤖"}
        </div>
        
        {/* Stats section */}
        <div className="card-stats">
          {hasDamage && (
            <div className="stat-item">
              <span className="stat-icon">⚔️</span>
              <span className="card-damage">{card.damage}</span>
            </div>
          )}
          
          {hasHealth && (
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="card-health">{card.health}</span>
            </div>
          )}

          {hasDefense && (
            <div className="stat-item">
              <span className="stat-icon">🛡️</span>
              <span className="card-defense">{card.defense}</span>
            </div>
          )}
        </div>
        
        {/* Ability section */}
        {hasAbility && (
          <div className="card-ability-section">
            <span className="ability-label">Ability:</span>
            <span className="ability-text">{card.ability}</span>
          </div>
        )}
      </li>
    );
  }

  // Original vertical layout for cards on the board
  return (
    <li className="card-display">
      <div className="card-header">
        <span className="card-name">{card.name}</span>
        <span className="card-type">{card.type}</span>
      </div>
      
      <div style={{ display: "flex", height: "100%" }}>
        {/* Left side: Illustration */}
        <div className="card-illustration" style={{ flex: "0 30px", marginRight: "8px" }}>
          {isUnitType ? "⚔️" : isGearType ? "🛡️" : "🤖"}
        </div>
        
        {/* Right side: Stats and abilities */}
        <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Stats row */}
          <div className="card-stats" style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
            {hasDamage && (
              <div className="stat-item">
                <span className="stat-icon">⚔️</span>
                <span className="card-damage">{card.damage}</span>
              </div>
            )}
            
            {hasHealth && (
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <span className="card-health">{card.health}</span>
              </div>
            )}

            {hasDefense && (
              <div className="stat-item">
                <span className="stat-icon">🛡️</span>
                <span className="card-defense">{card.defense}</span>
              </div>
            )}
          </div>
          
          {/* Ability */}
          {hasAbility && (
            <div className="card-ability-section" style={{ fontSize: "11px" }}>
              <div className="ability-divider"></div>
              <div className="ability-container">
                <span className="ability-label">Ability:</span>
                <span className="ability-text">{card.ability}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default CardDisplay;