import React from "react";
import { Card } from "../../../card-game-backend/src/models/cardModel";

export const CardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  const isUnitType = card.type === 'Hero' || card.type === 'Unit' || 
                    card.type === 'Creature' || card.type === 'Automaton';
  const isGearType = card.type === 'Defense' || card.type === 'Heal';
  
  const hasAbility = 'ability' in card && card.ability;
  const hasDamage = 'damage' in card && typeof card.damage === 'number';
  const hasHealth = 'health' in card && typeof card.health === 'number';
  const hasDefense = 'defense' in card && typeof card.defense == 'number';

  return (
    <li className="card-display">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span className="card-name">{card.name}</span>
        <span className="card-type" style={{ marginLeft: "8px" }}>{card.type}</span>
      </div>
      
      <div style={{ display: "flex", height: "100%" }}>
        {/* Left side: Illustration */}
        <div className="card-illustration" style={{ flex: "0 30px", marginRight: "8px" }}>
          {isUnitType ? "⚔️" : "🤖"}
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