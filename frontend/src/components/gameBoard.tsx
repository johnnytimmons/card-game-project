import React, { useState, ReactNode } from 'react';
import './GameBoard.css';
import { 
  BoardUnit,
  GridCellProps
} from '../types/gameTypes';
import UnitToken from './token';

// Component for a single cell in the grid with proper types
const GridCell: React.FC<GridCellProps> = ({ 
  row, 
  col, 
  unit, 
  selectedUnit, 
  onCellClick, 
  onUnitSelect,
  onUnitHover,
  onUnitLeave
}) => {
  // Determine which territory this cell belongs to
  let territoryClass = '';
  if (row < 2) {
    territoryClass = 'opponent-territory';
  } else if (row > 3) {
    territoryClass = 'player-territory';
  } else {
    territoryClass = 'frontline';
  }

  // Handle cell click - if empty, call onCellClick
  const handleCellClick = () => {
    if (!unit) {
      onCellClick(row, col);
    }
  };

  // Handle mouse events for hover functionality
  const handleMouseEnter = () => {
    if (unit && onUnitHover) {
      onUnitHover(unit);
    }
  };
  
  const handleMouseLeave = () => {
    if (onUnitLeave) {
      onUnitLeave();
    }
  };

  // Check if this unit is the currently selected one
  const isSelected = selectedUnit && 
                     unit && 
                     selectedUnit.position.row === unit.position.row && 
                     selectedUnit.position.col === unit.position.col;

  return (
    <div 
      className={`grid-cell ${territoryClass}`}
      onClick={handleCellClick}
      data-row={row}
      data-col={col}
    >
      {unit && 
        <UnitToken 
          unit={unit} 
          isSelected={isSelected || false}
          onSelect={() => onUnitSelect(unit)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      }
      
      {/* Optional: keep coordinates for debugging */}
      <span className="cell-coordinates">{row},{col}</span>
    </div>
  );
};

const GameBoard: React.FC = () => {
  // State for selected and hovered units
  const [selectedUnit, setSelectedUnit] = useState<BoardUnit | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<BoardUnit | null>(null);
  
  // This would be populated from your game state in a real implementation
  const [boardUnits, setBoardUnits] = useState<BoardUnit[]>([
    // Example units - in your real code, this would come from your game state
    {
      cardId: 1,
      position: { row: 4, col: 2 },
      playerId: 'player1',
      equippedUnit: {
        effectiveDamage: 30,
        effectiveHealth: 30
      },
      baseUnit: {
        name: 'Darrowe',
        type: 'Hero',
        ability: 'Inspire'
      }
    },
    {
      cardId: 3,
      position: { row: 1, col: 3 },
      playerId: 'player2',
      equippedUnit: {
        effectiveDamage: 25,
        effectiveHealth: 40
      },
      baseUnit: {
        name: 'Bear',
        type: 'Creature',
      }
    }
  ]);

  // Handle selecting a unit
  const handleUnitSelect = (unit: BoardUnit) => {
    setSelectedUnit(unit);
  };
  
  // Handle clicking an empty cell - for movement, etc.
  const handleCellClick = (row: number, col: number) => {
    console.log(`Cell clicked: ${row}, ${col}`);
    // Add your movement or action logic here
  };
  
  // Find a unit at a specific position
  const findUnitAt = (row: number, col: number): BoardUnit | undefined => {
    return boardUnits.find(unit => 
      unit.position.row === row && unit.position.col === col
    );
  };

  // Render the grid
  const renderGrid = () => {
    const grid: ReactNode[] = [];
    
    // For a 6x5 grid
    for (let row = 0; row < 6; row++) {
      const rowCells: ReactNode[] = [];
      
      for (let col = 0; col < 5; col++) {
        const unit = findUnitAt(row, col);
        
        rowCells.push(
          <GridCell 
            key={`${row}-${col}`} 
            row={row} 
            col={col} 
            unit={unit}
            selectedUnit={selectedUnit}
            onUnitSelect={handleUnitSelect}
            onCellClick={handleCellClick}
            onUnitHover={setHoveredUnit}
            onUnitLeave={() => setHoveredUnit(null)}
          />
        );
      }
      
      grid.push(
        <div key={`row-${row}`} className="grid-row">
          {rowCells}
        </div>
      );
    }
    
    return grid;
  };

  // Determine which unit to display in the panel
  const displayUnit = selectedUnit || hoveredUnit;
  
  // Handler for closing the panel
  const handleClosePanel = () => {
    setSelectedUnit(null);
  };

  return (
    <div className="game-area">
      <div className="game-board-container">
        <div className="game-board">
          {renderGrid()}
        </div>
      </div>
      
      {/* Card detail panel - shows when a unit is selected or hovered */}
      {displayUnit && (
        <div className={`card-detail-panel ${selectedUnit ? 'click-panel' : 'hover-panel'}`}>
          <button 
            className="close-panel-button" 
            onClick={handleClosePanel}
            aria-label="Close panel"
          >
            ✕
          </button>
          
          <h3>{displayUnit.baseUnit?.name}</h3>
          <div className="card-type">{displayUnit.baseUnit?.type}</div>
          
          <div className="stat-display">
            <div className="stat-item">
              <span className="stat-label">Attack:</span>
              <span className="stat-value">{displayUnit.equippedUnit?.effectiveDamage}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Health:</span>
              <span className="stat-value">{displayUnit.equippedUnit?.effectiveHealth}</span>
            </div>
          </div>
          
          {displayUnit.baseUnit?.ability && (
            <div className="ability-section">
              <h4>Ability:</h4>
              <p>{displayUnit.baseUnit.ability}</p>
            </div>
          )}
          
          {/* Only show action buttons if this is a clicked unit (not just hover) */}
          {selectedUnit && (
            <div className="action-buttons">
              <button className="action-button">Move</button>
               {/* New ability button - disabled if unit has no ability */}
    <button 
      className="action-button ability-button"
      disabled={!selectedUnit.baseUnit?.ability}
      title={selectedUnit.baseUnit?.ability || "This unit has no ability"}
    >
      Use Ability
    </button>
              <button className="action-button">Attack</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
  
export default GameBoard;