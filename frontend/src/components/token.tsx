import React from 'react';

interface UnitTokenProps {
  unit: any; // You can replace 'any' with a more specific type
  isSelected: boolean;
  onSelect: (unit: any) => void;
  onMouseEnter;
  onMouseLeave;
}

const UnitToken: React.FC<UnitTokenProps> = ({ unit, isSelected, onSelect, onMouseEnter, onMouseLeave }) => {

     // Determine unit icon based on type
  const getUnitIcon = () => {
    const type = unit.cardDetails?.type || unit.baseUnit?.type;

    switch(type) {
      case 'Hero':
        // Different icons based on the specific hero
        if (name.includes('Whiskers')) return '🐱'; // Cat hero
        if (name.includes('Barkley')) return '🐕'; // Dog hero
        if (name.includes('Swift')) return '🐭'; // Mouse hero
        return '🎖️'; // Default hero (medal)
        case 'Creature':
        if (name.includes('Bruno')) return '🐻'; // Bear
        if (name.includes('Lapin')) return '🐇'; // Rabbit
        return '🦊'; // Default creature (fox)
        case 'Unit':
        if (name.includes('Owl')) return '🦉'; // Owl unit
        if (name.includes('Bristle')) return '🦡'; // Badger unit
        if (name.includes('Redcoat')) return '🦊'; // Fox unit
        return '🦔'; // Default unit (hedgehog)
        case 'Vehicle':
          if (name.includes('Truck')) return '🚚'; // Farm truck
          if (name.includes('Bicycle')) return '🚲'; // Bicycle
          if (name.includes('Glider')) return '🪂'; // Glider/parachute
          return '🚜'; // Default vehicle (tractor)
          default: 
          return '🔫'; // Default for any other type (gun for resistance)
      }
    };

      // Get damage and health values
  const damage = unit.equippedUnit?.effectiveDamage || unit.baseUnit?.damage || '?';
  const health = unit.equippedUnit?.effectiveHealth || unit.baseUnit?.health || '?';
  const name = unit.cardDetails?.name || unit.baseUnit?.name || 'Unit';
  const ability = unit.cardDetails?.ability || unit.baseUnit?.ability || '';

  return (
    <div 
      className={`unit-token ${unit.playerId === 'player1' ? 'player-unit' : 'opponent-unit'} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(unit)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="token-icon">{getUnitIcon()}</div>
      <div className="token-stats">
        <span>{damage}⚔️</span>
        <span>{health}❤️</span>
      </div>
    </div>
  );
};

// Add export default at the end of the file
export default UnitToken;