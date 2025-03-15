import React, { useState, ReactNode, useEffect } from 'react';
import './GameBoard.css';
import { 
  BoardUnit,
  GridCellProps
} from '../types/gameTypes';
import UnitToken from './token';

// GridCell component remains the same as before
const GridCell: React.FC<GridCellProps & { placementMode: boolean, onPlaceCard: Function }> = ({ 
  row, 
  col, 
  unit, 
  selectedUnit, 
  onCellClick, 
  onUnitSelect,
  onUnitHover,
  onUnitLeave,
  placementMode,
  onPlaceCard
}) => {
// Territory class logic
let territoryClass = '';

// Base territory assignment
if (row < 3) {
  territoryClass = 'opponent-territory';
} else if (row > 2) {
  territoryClass = 'player-territory';
}

// Apply special row designations
if (row === 2) {
  // Opponent frontline
  territoryClass += ' opponent-frontline';
} else if (row === 0) {
  // Opponent deployment
  territoryClass += ' opponent-deployment';
} else if (row === 3) {
  // Player frontline
  territoryClass += ' player-frontline';
} else if (row === 5) {
  // Player deployment
  territoryClass += ' player-deployment';
}

  // Handle cell click with placement logic
  const handleCellClick = () => {
    if (placementMode && !unit) {
      onPlaceCard(row, col);
    } else if (!unit) {
      onCellClick(row, col);
    }
  };

  // Mouse event handlers
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
      className={`grid-cell ${territoryClass} ${placementMode && !unit ? 'valid-placement' : ''}`}
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
      
      <span className="cell-coordinates">{row},{col}</span>
    </div>
  );
};

const GameBoard: React.FC<{ 
  selectedCard: any | null, 
  onCardPlaced: Function,
  gameId?: string,
  playerId?: string,
  onUnitSelect?: Function,
  onUnitHover?: Function
}> = ({ selectedCard, onCardPlaced, gameId, playerId, onUnitSelect, onUnitHover }) => {
  // State
  const [selectedUnit, setSelectedUnit] = useState<BoardUnit | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<BoardUnit | null>(null);
  const [boardUnits, setBoardUnits] = useState<BoardUnit[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Determine if we're in placement mode
  const placementMode = !!selectedCard;
  
  // Load board units from API when component mounts or gameId changes
  useEffect(() => {
    if (gameId) {
      setIsLoading(true);
     // Fetch board state from the backend
     fetch(`http://localhost:5000/api/game/${gameId}/board`)
     .then(response => {
       if (!response.ok) {
         throw new Error('Failed to fetch board state');
       }
       return response.json();
        })
        .then(data => {
          // Transform the data if needed to match the BoardUnit type
          const transformedUnits = data.map((boardCard: any) => ({
            cardId: boardCard.cardId,
            position: boardCard.position,
            playerId: boardCard.playerId,
            equippedUnit: boardCard.equippedUnit,
            baseUnit: {
              name: boardCard.cardDetails?.name || 'Unknown',
              type: boardCard.cardDetails?.type || 'Unknown',
              ability: boardCard.cardDetails?.ability
            }
          }));
          
          setBoardUnits(transformedUnits);
          setErrorMessage(null);
        })
        .catch(error => {
          console.error('Error loading board units:', error);
          setErrorMessage(`Failed to load the game board: ${error.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [gameId]);
  
  // Update body class when placement mode changes
  useEffect(() => {
    if (placementMode) {
      document.body.classList.add('placement-mode');
    } else {
      document.body.classList.remove('placement-mode');
    }
    
    return () => {
      document.body.classList.remove('placement-mode');
    };
  }, [placementMode]);

  // Handle selecting a unit
  const handleUnitSelect = (unit: BoardUnit) => {
    if (!placementMode) {
      setSelectedUnit(prevSelected => {
        const newSelected = prevSelected && 
          prevSelected.position.row === unit.position.row && 
          prevSelected.position.col === unit.position.col
            ? null  // Deselect if clicking the same unit
            : unit;  // Select the new unit
        
        // Call the parent's onUnitSelect if provided
        if (onUnitSelect) {
          onUnitSelect(newSelected);
        }
        
        return newSelected;
      });
    }
  };
  
  // Update the hover handler to pass the unit up to the parent
  const handleUnitHover = (unit: BoardUnit) => {
    setHoveredUnit(unit);
    if (onUnitHover) {
      onUnitHover(unit);
    }
  };
  
  // Handle clicking an empty cell - could be used for movement
  const handleCellClick = (row: number, col: number) => {
    // If a unit is selected, this could be a movement command
    if (selectedUnit && gameId && playerId) {
      console.log(`Moving unit from ${selectedUnit.position.row},${selectedUnit.position.col} to ${row},${col}`);
    }
  };
  
  // Handle attacking with selected unit
  const handleAttack = (targetUnit: BoardUnit) => {
    if (!selectedUnit || !gameId || !playerId) return;
    
    // Call the attack API endpoint in your backend
    fetch('http://localhost:5000/api/game/attack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'player-id': playerId
      },
      body: JSON.stringify({
        gameId: gameId,
        attackerPosition: selectedUnit.position,
        targetPosition: targetUnit.position
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.result && data.result.success) {
        // Update the board with the new state
        // You may need to re-fetch the board or extract it from the response
        fetch(`http://localhost:5000/api/${gameId}/board`)
          .then(response => response.json())
          .then(boardData => {
            const transformedUnits = boardData.map((boardCard: any) => ({
              cardId: boardCard.cardId,
              position: boardCard.position,
              playerId: boardCard.playerId,
              equippedUnit: boardCard.equippedUnit,
              baseUnit: {
                name: boardCard.cardDetails?.name || 'Unknown',
                type: boardCard.cardDetails?.type || 'Unknown',
                ability: boardCard.cardDetails?.ability
              }
            }));
            
            setBoardUnits(transformedUnits);
          });
          
        console.log('Combat result:', data.result.message);
        // You could display the combat log/results here
      } else {
        setErrorMessage(data.result ? data.result.message : 'Attack failed');
      }
      
      // Clear the selected unit after attack
      setSelectedUnit(null);
    })
    .catch(err => {
      console.error('Error attacking unit:', err);
      setErrorMessage('Failed to attack: ' + err.message);
    });
  };
  
  // Handle placing a card on a cell
  const handlePlaceCard = (row: number, col: number) => {
    if (!selectedCard || !gameId || !playerId) return;
    
    // Check if cell is valid for placement
    // For now using a simple rule - only in player territory
    const isValidPlacement = row >= 4; 
    
    if (isValidPlacement) {
      // Create temporary unit for immediate visual feedback
      const tempUnit: BoardUnit = {
        cardId: selectedCard.id,
        position: { row, col },
        playerId: playerId,
        equippedUnit: {
          effectiveDamage: selectedCard.damage || 0,
          effectiveHealth: selectedCard.health || 0
        },
        baseUnit: {
          name: selectedCard.name,
          type: selectedCard.type,
          ability: selectedCard.ability
        }
      };
      
      // Update local state for immediate feedback
      setBoardUnits([...boardUnits, tempUnit]);
      
      // Call the API to place the card on the backend
      fetch('http://localhost:5000/api/game/place-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'player-id': playerId
        },
        body: JSON.stringify({
          gameId: gameId,
          cardId: selectedCard.id,
          position: { row, col }
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to place card on server');
        }
        return res.json();
      })
      .then(updatedGameState => {
        // Call the callback to inform the parent component
        onCardPlaced({
          cardId: selectedCard.id,
          position: { row, col },
          gameId: gameId
        });
        
        setErrorMessage(null);
      })
      .catch(err => {
        console.error('Error placing card:', err);
        setErrorMessage('Failed to place card: ' + err.message);
        
        // Remove the temporary unit if the backend call failed
        setBoardUnits(boardUnits.filter(unit => 
          !(unit.position.row === row && unit.position.col === col)
        ));
      });
    } else {
      setErrorMessage('Invalid placement location');
    }
  };
  
  // Handle equipping gear to a unit
  const handleEquipGear = (targetUnit: BoardUnit) => {
    if (!selectedCard || !gameId || !playerId || selectedCard.type !== 'Gear') return;
    
    fetch('http://localhost:5000/api/equip-gear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'player-id': playerId
      },
      body: JSON.stringify({
        gameId: gameId,
        gearCardId: selectedCard.id,
        targetPosition: targetUnit.position
      })
    })
    .then(res => res.json())
    .then(data => {
      // Refresh board state
      fetch(`http://localhost:5000/api/${gameId}/board`)
        .then(response => response.json())
        .then(boardData => {
          const transformedUnits = boardData.map((boardCard: any) => ({
            cardId: boardCard.cardId,
            position: boardCard.position,
            playerId: boardCard.playerId,
            equippedUnit: boardCard.equippedUnit,
            baseUnit: {
              name: boardCard.cardDetails?.name || 'Unknown',
              type: boardCard.cardDetails?.type || 'Unknown',
              ability: boardCard.cardDetails?.ability
            }
          }));
          
          setBoardUnits(transformedUnits);
        });
        
      // Call the callback to inform the parent component
      onCardPlaced({
        cardId: selectedCard.id,
        targetPosition: targetUnit.position,
        gameId: gameId,
        isGearEquip: true
      });
    })
    .catch(err => {
      console.error('Error equipping gear:', err);
      setErrorMessage('Failed to equip gear: ' + err.message);
    });
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
            onUnitHover={handleUnitHover}
            onUnitLeave={() => setHoveredUnit(null)}
            placementMode={placementMode}
            onPlaceCard={handlePlaceCard}
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
  
  return (
    <div className={`game-area ${placementMode ? 'placement-mode' : ''}`}>
      {isLoading && <div className="loading-overlay">Loading board...</div>}
      
      {errorMessage && (
        <div className="error-message board-error">
          {errorMessage}
        </div>
      )}
      
      <div className="game-board-container">
        <div className="game-board">
          {renderGrid()}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;