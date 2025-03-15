import React, { useState } from 'react';
import "./saveGameButton.css"

interface SaveGameButtonProps {
    gameId: string;
    playerId: string;
  }

  //--------------------------------------------------------------------------

  const SaveGameButton: React.FC<SaveGameButtonProps> = ({ gameId, playerId }) => {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
  
    const saveGame = async () => {
      // Don't allow multiple save requests at once
      if (saving) return;
      
      // Reset message state
      setMessage('');
      setShowMessage(false);
      setSaving(true);
      
      try {
        // Generate a default filename
        const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = new Date().toISOString().slice(11, 19).replace(/:/g, '-'); // HH-MM-SS
        const filename = `${dateStr}-${timeStr}-game-${gameId.slice(0, 6)}`;
        
        console.log(`Attempting to save game ${gameId} as "${filename}"...`);
        
        // Make the API call to save the game
        const response = await fetch('http://localhost:5000/api/game/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'player-id': playerId
          },
          body: JSON.stringify({
            gameId,
            filename
          })
        });

        const data = await response.json();
      
      if (response.ok) {
        setMessage(`Game saved successfully as "${filename}"`);
        console.log("Save game success:", data);
      } else {
        setMessage(`Failed to save game: ${data.error}`);
        console.error("Save game error:", data.error);
      }
    } catch (error) {
      setMessage(`Error saving game: ${error.message}`);
      console.error("Save game error:", error);
    } finally {
      setSaving(false);
      setShowMessage(true);
      
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }
  };

  //---------------------------------------------------------------------------------------------
  return (
    <div className="save-game-container">
      <button 
        className="save-button" 
        onClick={saveGame} 
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Game"}
      </button>
      
      {showMessage && (
        <div className={`save-message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )};
      </div>
  );
};

export default SaveGameButton;