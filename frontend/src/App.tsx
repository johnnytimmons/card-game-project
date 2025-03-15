import React, { useState, useEffect } from "react";
import { Card } from "./../../card-game-backend/src/models/cardModel";
import CardList from "./components/cardList";
import GameBoard from "./components/gameBoard";
import FixedCardHand from "./components/cardHand";
import DeckSelectionModal from './components/deckSelectionModal';
import './App.css';
import './components/token.css';
import './components/gameBoard.css';


// Define an interface for the unit structure
interface DisplayUnit {
  cardId: number;
  position: { row: number; col: number };
  playerId: string;
  equippedUnit: {
    effectiveDamage: number;
    effectiveHealth: number;
  };
  baseUnit: {
    name: string;
    type: string;
    ability?: string;
  };
}

function App() {
  const [sampleCards, setSampleCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showGameBoard, setShowGameBoard] = useState<boolean>(false);
  const [player1Id, setPlayer1Id] = useState<string>("player1");
  const [player2Id, setPlayer2Id] = useState<string>("player2");
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameCreationError, setGameCreationError] = useState<string | null>(null);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("player1");
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<DisplayUnit | null>(null);
  const [decks, setDecks] = useState([]);

  // Define this computed value
  const placementMode = !!selectedCard;
  
   // New state for deck selection
   const [showDeckModal, setShowDeckModal] = useState<boolean>(false);
   const [selectedDeckId, setSelectedDeckId] = useState<string>("");
   
  
  // Function to handle card selection from hand---------------------------------------------------
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card === selectedCard ? null : card);
  };

  // FIXED fetchPlayerHand function that combines both previous versions
  const fetchPlayerHand = () => {
    if (!gameId || !currentPlayerId) {
      console.log('Cannot fetch hand: no game ID or player ID');
      return Promise.reject(new Error('No game ID or player ID'));
    }
    
    console.log('Fetching hand for player:', currentPlayerId, 'in game:', gameId);
    setIsLoading(true);
    
    return fetch(`http://localhost:5000/api/game/${gameId}/hand`, {
      headers: {
        'player-id': currentPlayerId
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch player hand');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received hand cards:', data);
        setHandCards(data || []);
        setSampleCards(data || []);
        setError(null);
        return data; // Return the data to support promise chaining
      })
      .catch(err => {
        console.error('Error fetching player hand:', err);
        setError('Error fetching hand: ' + err.message);
        throw err; // Re-throw to allow handling in promise chains
      })
      .finally(() => setIsLoading(false));
  };

  //function to fetch available decks-------------------------------------------------------------
  const fetchAvailableDecks = () => {
    console.log('Fetching available decks');
    setIsLoading(true);
    
    fetch('http://localhost:5000/api/game/decks')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch decks');
        }
        return response.json();
      })
      .then(data => {
        console.log('Available decks:', data);
        setDecks(data);
        setShowDeckModal(true);
      })
      .catch(err => {
        console.error('Error fetching decks:', err);
        setError('Error fetching decks: ' + err.message);
      })
      .finally(() => setIsLoading(false));
  };

  // Function to handle when a card is placed on the board-------------------------------------------
  const handleCardPlaced = (placementData: { 
    cardId: number, 
    position?: any, 
    targetPosition?: any,
    gameId: string,
    isGearEquip?: boolean
  }) => {
    // Remove the card from hand
    setHandCards(prev => prev.filter(card => card.id !== placementData.cardId));
    setSampleCards(prev => prev.filter(card => card.id !== placementData.cardId));
    
    // Clear selected card
    setSelectedCard(null);
  };
   
  //Function to draw cards ------------------------------------------------------------------------------
  const handleDrawCards = (numCards: number) => {
    setIsLoading(true);
    fetch(`http://localhost:5000/api/draw-cards?numCards=${numCards}`)
      .then((res) => res.json())
      .then((data) => {
        setSampleCards(data);
        setHandCards(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error: " + err.message);
        setError("Error drawing cards: " + err.message);
      })
      .finally(() => setIsLoading(false));
  };

   // Modified to show deck selection after creating the game---------------------------------
   const handleCreateGame = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/game/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player1Id,
        player2Id
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      return response.json();
    })
    .then(data => {
      console.log('Game created successfully:', data);
      setGameId(data.id);
      setCurrentPlayerId(player1Id);
      setError(null);
      setGameCreationError(null);
      setShowGameBoard(true);
      
      // After game creation, fetch available decks
      fetchAvailableDecks();
    })
    .catch(err => {
      console.error('Error creating game:', err);
      setGameCreationError('Error creating game: ' + err.message);
    })
    .finally(() => setIsLoading(false));
  };

  // Fetch cards when currentPlayerId changes ----------------------------------------------
  useEffect(() => {
    if (gameId && currentPlayerId) {
      fetchPlayerHand().catch(err => {
        console.error('Error in useEffect fetchPlayerHand:', err);
      });
    }
  }, [gameId, currentPlayerId]);

  // Handle deck selection--------------------------------------------------------------------
  const handleDeckSelect = (deckId) => {
    console.log('App received deck selection:', deckId);
    setSelectedDeckId(deckId);
    
    if (gameId && currentPlayerId) {
      console.log('Updating deck for player:', currentPlayerId, 'in game:', gameId, 'with deck:', deckId);
   
      // Add detailed gameId format logging
    console.log('Game ID format check:', {
      gameId,
      includesPrefix: gameId.startsWith('game_'),
      length: gameId.length
    });
      
    setIsLoading(true);

      // Log API request details
      const apiUrl = `http://localhost:5000/api/game/${gameId}/player/deck`;
      console.log('Sending deck update request to:', apiUrl);
      
    // Make API call to update the player's deck
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'player-id': currentPlayerId
      },
      body: JSON.stringify({
        deckId: deckId
      }),
    })
    .then(response => {
      console.log('Received response with status:', response.status);
      
      // Always read the raw response text first
      return response.text().then(text => {
        console.log('Raw response body:', text);
        
        if (!response.ok) {
          throw new Error(`Failed to update deck: ${response.status} ${response.statusText}`);
        }
        
        // Parse JSON only for successful responses
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          throw new Error('Invalid JSON response from server');
        }
      });
    })

      //---------------------------------------------------------------------------------------
      .then(data => {
        console.log('Deck update successful, response:', data);
        
        if (data && data.players && data.players[currentPlayerId]) {
          const playerState = data.players[currentPlayerId];
          console.log('Player state after deck update:', playerState);
          
          // Fetch the player's hand after updating the deck
          return fetchPlayerHand();
        } else {
          // Something went wrong with the response
          throw new Error('Invalid response format from deck update');
        }
      })
      .then(() => {
        // Now that we have the hand, show the game board
        setShowGameBoard(true);
        setError(null);
        // Close the deck modal after successful selection
        setShowDeckModal(false);
      })
      .catch(err => {
        console.error('Error in deck selection process:', err);
        setError('Error setting deck: ' + err.message);
      })
      .finally(() => setIsLoading(false));
    } else {
      console.log('Cannot update deck: no game ID or player ID');
    }
  };

  //Save Game ------------------------------------------------------------------------------
  const handleSaveGame = () => {
    if (!gameId) {
      setError("No active game to save");
      return;
    }
    
    setIsLoading(true);
    fetch('http://localhost:5000/api/game/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        filename: `game_${gameId}`
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save game');
      }
      return response.json();
    })
    .then(data => {
      setError(null);
      // Maybe show a success message here
    })
    .catch(err => {
      console.error('Error saving game:', err);
      setError('Error saving game: ' + err.message);
    })
    .finally(() => setIsLoading(false));
  };

  // End turn handler
  const handleEndTurn = () => {
    if (!gameId) {
      setError("No active game");
      return;
    }

    setIsLoading(true);
    fetch('http://localhost:5000/api/game/end-turn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'player-id': currentPlayerId
      },
      body: JSON.stringify({
        gameId
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to end turn');
      }
      return response.json();
    })
    .then(() => {
      // Toggle to the next player
      const nextPlayerId = currentPlayerId === player1Id ? player2Id : player1Id;
      setCurrentPlayerId(nextPlayerId);
         
      setError(null);
    })
    .catch(err => {
      console.error('Error ending turn:', err);
      setError('Error ending turn: ' + err.message);
    })
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="app-container">
      <h1 data-text="Kindred">Kindred</h1>
      <h2>Tactics</h2>
      
      {!gameId ? (
  <div>
    <div className="game-setup">
      <h2>Start New Game</h2>
      <div className="form-group">
        <label htmlFor="player1">Player 1 ID:</label>
        <input
          type="text"
          id="player1"
          value={player1Id}
          onChange={(e) => setPlayer1Id(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="player2">Player 2 ID:</label>
        <input
          type="text"
          id="player2"
          value={player2Id}
          onChange={(e) => setPlayer2Id(e.target.value)}
        />
      </div>
      <button 
        onClick={handleCreateGame}
        disabled={isLoading}
        className="create-game-button"
      >
        {isLoading ? "Creating..." : "Start New Game"}
      </button>
      {gameCreationError && <div className="error-message">{gameCreationError}</div>}
    </div>
  </div>
) : (
        <>
          {error && <div className="error-message">{error}</div>}
          {isLoading && <div className="loading">Loading...</div>}
          
          {/* Show deck selection modal if needed */}
          <DeckSelectionModal 
            isOpen={showDeckModal}
            onClose={() => setShowDeckModal(false)}
            onDeckSelect={handleDeckSelect}
            decks={decks}
          />
          
          {/* Three-column layout for the game */}
          <div className="game-layout">
            {/* Left sidebar */}
            <div className="game-sidebar">
              <h3>Player Info</h3>
              <div className="player-stats">
                <p>Player: {currentPlayerId}</p>
                <p>Health: 30</p>
                <p>Cards in Deck: {/* You would get this from your game state */}</p>
              </div>
              
              <h3>Game Log</h3>
              <div className="game-log">
                <div>Game started</div>
                <div>You drew a card</div>
                
                {/* Placement mode instruction in the sidebar */}
                {selectedCard && (
                  <div className="placement-instruction-log">
                    {selectedCard.type === 'Defense' || selectedCard.type === 'Weapon' || 
                    selectedCard.type === 'Movement' || selectedCard.type === 'Heal'
                      ? "Select unit to equip gear" 
                      : "Click on board to place unit"}
                  </div>
                )}
              </div>
              
              {/* Card detail panel */}
              {displayUnit && !placementMode && (
                <div className="card-detail-sidebar">
                  <h3>{displayUnit.baseUnit?.name}</h3>
                  <div className="card-type">{displayUnit.baseUnit?.type}</div>
                  
                  <div className="stat-display">
                    <div className="stat-item">
                      <span className="stat-label">ATK</span>
                      <span className="stat-value">{displayUnit.equippedUnit?.effectiveDamage}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">HP</span>
                      <span className="stat-value">{displayUnit.equippedUnit?.effectiveHealth}</span>
                    </div>
                  </div>
                    <h3>Abilities</h3>
                  {displayUnit.baseUnit?.ability && (
                    <div className="ability-section">
                      <p>{displayUnit.baseUnit.ability}</p>
                    </div>
                  )}
                  
                  {/* Only show action buttons if this is a clicked unit (not just hover) */}
                  {selectedUnit && selectedUnit.playerId === currentPlayerId && (
                    <div className="action-buttons">
                      <button className="action-button">Move</button>
                      <button className="action-button attack-button">Attack</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Center game board */}
            <div className="game-board-wrapper">
              <GameBoard 
                gameId={gameId}
                playerId={currentPlayerId}
                selectedCard={selectedCard}
                onCardPlaced={handleCardPlaced}
                onUnitSelect={setSelectedUnit}
                onUnitHover={setDisplayUnit}
              />
            </div>
            
            {/* Right sidebar */}
            <div className="game-info-panel">
              <h3>Opponent</h3>
              <div className="opponent-stats">
                <p>Player: {currentPlayerId === player1Id ? player2Id : player1Id}</p>
                <p>Health: 30</p>
                <p>Cards in Hand: {/* You would get this from your game state */}</p>
              </div>
              
              <h3>Actions</h3>
              <div className="game-controls">
                <div className="game-actions">
                  <button onClick={handleSaveGame} disabled={isLoading}>
                    Save Game
                  </button>
                  <button onClick={handleEndTurn} disabled={isLoading}>
                    End Turn
                  </button>
                </div>
              </div>
          
              <div className="game-info">
                <p>Current Player: {currentPlayerId}</p>
              </div>
            
              <div className="game-id"> Game ID: {gameId} </div>
            </div>
          </div>
          
          {/* Show the hand cards if a deck is selected */}
          {selectedDeckId && (
            <FixedCardHand 
              cards={handCards} 
              onCardSelect={handleCardSelect} 
              selectedCardId={selectedCard?.id}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;