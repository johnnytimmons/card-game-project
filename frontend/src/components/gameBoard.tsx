import React from 'react';
import './GameBoard.css';

// Component for a single cell in the grid
const GridCell: React.FC<{ 
    row: number;
    col: number;
  }> = ({ row, col }) => {

     // Determine which territory this cell belongs to
  let territoryClass = '';
  if (row < 2) {
    territoryClass = 'opponent-territory';
  } else if (row > 3) {
    territoryClass = 'player-territory';
  } else {
    territoryClass = 'frontline';
  }

  return (
    <div 
      className={`grid-cell ${territoryClass}`}
      data-row={row}
      data-col={col}
    >
      {/* Small indicator showing cell coordinates */}
      <span className="cell-coordinates">{row},{col}</span>
    </div>
  );
};

// Main GameBoard component
const GameBoard: React.FC = () => {
    // Create the 6x5 grid
    const renderGrid = () => {
      const grid = [];
      
      // Loop through rows (0-5)
      for (let row = 0; row < 6; row++) {
        const rowCells = [];
        
        // Loop through columns (0-4)
        for (let col = 0; col < 5; col++) {
          rowCells.push(
            <GridCell 
              key={`${row}-${col}`} 
              row={row} 
              col={col} 
            />
          );
        }
        
        // Add the row to the grid
        grid.push(
          <div key={`row-${row}`} className="grid-row">
            {rowCells}
          </div>
        );
      }
      
      return grid;
    };
    
    return (
      <div className="game-board-container">
        <div className="game-board">
          {renderGrid()}
        </div>
      </div>
    );
  };
  
  export default GameBoard;