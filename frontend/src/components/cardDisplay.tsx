import React from "react";
import { Card } from "../../../card-game-backend/src/models/cardModel";

// First, let's create a separate component for displaying cards
export const CardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  // Check card type directly instead of using the imported type guards
  const isUnitType = card.type === 'Hero' || card.type === 'Unit' || 
                    card.type === 'Creature' || card.type === 'Automaton' || 
                    card.type === 'Vehicle';
                    
  const isGearType = card.type === 'Defense' || card.type === 'Heal' ||
                    card.type === 'Weapon' || card.type === 'Movement' || 
                    card.type === 'Stealth' || card.type === 'Enhancement';
  
  // Check for specific attributes
  const hasAbility = 'ability' in card && card.ability;
  const hasDamage = 'damage' in card && typeof card.damage === 'number';
  const hasHealth = 'health' in card && typeof card.health === 'number';

  return (
    <li className="card-display">
        {/* Card Header Section */}
        <div className="card-header">
            <span className="card-name">{card.name}</span>
            <span className="card-type">{card.type}</span>
        </div>
        
        {/* Card Illustration Area - Just a placeholder for now */}
        <div className="card-illustration">
            {isUnitType ? "⚔️" : "🛡️"}
        </div>
        
        {/* Card Stats Section */}
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
        </div>
        
        {/* Card Ability Section - Only shown if there's an ability */}
        {hasAbility && (
            <div className="card-ability-section">
                <div className="ability-divider"></div>
                <div className="ability-container">
                    <span className="ability-label">Ability:</span>
                    <span className="ability-text">{card.ability}</span>
                </div>
            </div>
        )}
    </li>
  );
};

export default CardDisplay;