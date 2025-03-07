import React, { useState } from 'react';
import CardDisplay from './cardDisplay';
import './cards.css';

const FixedCardHand = ({ cards }) => {
    
    return (
        <div className="card-hand-container">
          {/* Header */}
          <div className="card-hand">
            {cards.map(card => (
              <CardDisplay 
                key={card.id} 
                card={card} 
                isInHand={true} // This line is crucial!
              />
            ))}
          </div>
        </div>
      );
    };
  
  export default FixedCardHand;