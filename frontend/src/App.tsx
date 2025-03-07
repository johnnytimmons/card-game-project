import React, { useState, useEffect } from "react";
import { Card } from "./../../card-game-backend/src/models/cardModel";
import CardList from "./components/cardList";
import GameBoard from "./components/gameBoard"; // Import the GameBoard component
import FixedCardHand from "./components/cardHand"; // Import the new component
import GameInfo from './components/gameInfo';
import './App.css';
import './components/token.css';
import './components/gameBoard.css'

function App() {
  const [sampleCards, setSampleCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showGameBoard, setShowGameBoard] = useState<boolean>(false);
   
  const handleDrawCards = (numCards: number) => {
    setIsLoading(true);
    fetch(`http://localhost:5000/api/draw-cards?numCards=${numCards}`)
      .then((res) => res.json())
      .then((data) => {
        setSampleCards(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error: " + err.message);
        setError("Error drawing cards: " + err.message);
      })
      .finally(() => setIsLoading(false));
  };

   // Toggle function for showing/hiding the game board
   const toggleGameBoard = () => {
    setShowGameBoard(prev => !prev);
  };

  return (
    <div className="app-container">
      <h1>Card Game Frontend</h1>
      <div className="actions">
        <button 
          onClick={() => handleDrawCards(5)} 
          disabled={isLoading}
          className="draw-button"
        >
          {isLoading ? "Drawing..." : "Draw 5 Cards"}
        </button>
        <button 
          onClick={toggleGameBoard}
          className="toggle-board-button"
        >
          {showGameBoard ? "Hide Game Board" : "Show Game Board"}
        </button>
      </div>
         
      {error && <div className="error-message">{error}</div>}
      
      {isLoading && <div className="loading">Loading cards...</div>}

      {/* Game board */}
      {showGameBoard && <GameBoard />}
      
      {/* Fixed card hand at the bottom - always visible */}
      <FixedCardHand cards={sampleCards} />
    </div>
  );
}

export default App;