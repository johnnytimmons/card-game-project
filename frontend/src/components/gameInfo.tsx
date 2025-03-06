import React from 'react';

const GameInfo: React.FC = () => {
  return (
    <div className="game-info">
      {/* Turn information */}
      <div className="game-info-section">
        <div className="turn-info">Your Turn</div>
        <div className="player-stats">
          <div>Player Health: 20</div>
          <div>Cards in Deck: 25</div>
        </div>
      </div>
      
      {/* Game log */}
      <div className="game-info-section">
        <h3>Game Log</h3>
        <div className="game-log">
          <div>You drew Darrowe</div>
          <div>You played Shield</div>
          <div>Opponent played Bear</div>
          <div>Bear attacked Sentinel</div>
          <div>Sentinel was destroyed</div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="game-info-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button className="action-button">End Turn</button>
          <button className="action-button">Play Card</button>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;