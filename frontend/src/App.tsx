import React, { useState, useEffect } from "react";
import { Card } from "./../../card-game-backend/src/models/cardModel";
import CardList from "./components/cardList";
import GameBoard from "./components/gameBoard"; // Import the GameBoard component
import './App.css';

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
      
      {isLoading ? (
        <div className="loading">Loading cards...</div>
      ) : (
        <CardList cards={sampleCards} />
      )}
    {/* Render the game board when showGameBoard is true */}
    {showGameBoard && <GameBoard />}
    </div>
  );
}

export default App;