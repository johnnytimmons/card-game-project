import React, { useState, useEffect, useRef } from "react";
import "./gameBoard.css";
import { mapService } from "../services/mapService";
import {
  BoardSpaceDto,
  MapDto,
  TerrainType,
} from "../../../shared/types/map.types";
import DiceRoller from "./diceRoller";
import PlayerToken from "./playerToken";
import MovementPath from "./movementPath";
import { PlayerData, GamePhase } from "../../../shared/types/gameTypes";
import PostMoveActionPanel from "./postMoveActionPanel";

// Test Movement Panel Component - outside main component
const TestMovementPanel: React.FC<{
  onRollTest: (
    steps: number,
    direction: "clockwise" | "counterclockwise"
  ) => void;
}> = ({ onRollTest }) => {
  const [showDirections, setShowDirections] = useState(false);
  const [rolledValue, setRolledValue] = useState<number | null>(null);

  // Function to simulate rolling a dice
  const handleRollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setRolledValue(roll);
    setShowDirections(true);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "120px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "15px",
        borderRadius: "8px",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minWidth: "200px",
      }}
    >
      <h3 style={{ color: "white", margin: "0 0 10px 0" }}>Test Movement</h3>

      {!showDirections ? (
        <button
          onClick={handleRollDice}
          style={{
            padding: "8px 15px",
            background: "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Roll Dice
        </button>
      ) : (
        <>
          <div style={{ color: "white", textAlign: "center", margin: "5px 0" }}>
            Rolled: {rolledValue}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <button
              onClick={() => {
                if (rolledValue !== null) {
                  onRollTest(rolledValue, "clockwise");
                }
                setShowDirections(false);
                setRolledValue(null);
              }}
              style={{
                padding: "8px 15px",
                background: "#43b883",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Clockwise
            </button>
            <button
              onClick={() => {
                if (rolledValue !== null) {
                  onRollTest(rolledValue, "counterclockwise");
                }
                setShowDirections(false);
                setRolledValue(null);
              }}
              style={{
                padding: "8px 15px",
                background: "#e25555",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Counter
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Utility function to get terrain symbols
export const getTerrainSymbol = (terrain: TerrainType): string => {
  switch (terrain) {
    case "trench":
      return "⚓";
    case "field":
      return "🌾";
    case "forest":
      return "🌲";
    case "city":
      return "🏚️";
    case "mountains":
      return "⛰️";
    case "no-mans-land":
      return "💣";
    case "resupply":
      return "📦";
    case "command":
      return "⚔️";
    default:
      return "❓";
  }
};

interface GameBoardProps {
  mapId: string;
  onReturnToMenu: () => void;
}

// Main GameBoard component
const GameBoard: React.FC<GameBoardProps> = ({ mapId, onReturnToMenu }) => {
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>("DRAW");
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [turnNumber, setTurnNumber] = useState(1);
  const [spaces, setSpaces] = useState<BoardSpaceDto[]>([]);
  const [connections, setConnections] = useState<Record<number, number[]>>({});
  const [availableMaps, setAvailableMaps] = useState<MapDto[]>([]);
  const [currentMap, setCurrentMap] = useState<MapDto | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<BoardSpaceDto | null>(
    null
  );
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("player1");
  const [boardDimensions, setBoardDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [players, setPlayers] = useState<PlayerData[]>([
    {
      id: "player1",
      name: "Player 1",
      color: "#4a90e2",
      deploymentPoints: 20,
      ownedCells: [],
      position: null,
    },
    {
      id: "player2",
      name: "Computer",
      color: "#e25555",
      deploymentPoints: 20,
      ownedCells: [],
      position: null,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showPostMoveActions, setShowPostMoveActions] = useState(false);
  const [currentLandedSpace, setCurrentLandedSpace] =
    useState<BoardSpaceDto | null>(null);

  // Movement state
  const [movementState, setMovementState] = useState({
    isAnimating: false,
    path: [] as number[],
    currentPathIndex: 0,
  });

  // Handler for when movement is complete
  function handleMoveComplete(finalSpaceId: number) {
    // Find the space we landed on
    const landedSpace = spaces.find((s) => s.id === finalSpaceId);
    if (landedSpace) {
      setSelectedSpace(landedSpace);
      setCurrentLandedSpace(landedSpace);
      setShowPostMoveActions(true);
    }

    // Update the game phase
    setCurrentPhase("AFTER_MOVE");
    console.log(`Player completed movement to space ${finalSpaceId}`);
  }

  // Add this effect to your GameBoard component
  useEffect(() => {
    // This effect runs whenever the spaces array changes (which happens when a map loads)
    if (spaces.length > 0) {
      centerBoardInViewport();
    }
  }, [spaces]); // Execute when spaces are loaded

  // Add this function to center the board
  const centerBoardInViewport = () => {
    if (spaces.length === 0) return;

    // Get viewport dimensions
    const viewportWidth =
      boardContainerRef.current?.clientWidth || window.innerWidth;
    const viewportHeight =
      boardContainerRef.current?.clientHeight || window.innerHeight;

    // Calculate board dimensions
    setBoardDimensions({
      width: viewportWidth * 0.5, // 50% of viewport width
      height: viewportHeight * 0.9, // 90% of viewport height
    });

    // Reset the viewport offset
    setViewportOffset({ x: 0, y: 0 });

    console.log(
      `Setting board dimensions: ${viewportWidth * 0.5}x${viewportHeight * 0.9}`
    );
    console.log(`Resetting viewport offset to (0,0)`);
  };
  const createNewGame = async () => {
    try {
      setIsLoading(true);
      console.log("Creating new game with map:", mapId);

      const response = await fetch("http://localhost:5000/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1Id: "player1",
          player2Id: "Computer",
          mapId: mapId, // Pass the map ID to use for the game
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create game: ${response.status}`);
      }

      const data = await response.json();

      if (data.id) {
        setGameId(data.id);
        console.log(`New game created with ID: ${data.id}`);
      } else {
        console.error("Created game but no ID returned");
      }
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Call this when component mounts
  useEffect(() => {
    createNewGame();
  }, []);

  // Call this in your initialization
  useEffect(() => {
    // Create a new game if no game ID exists
    if (!gameId) {
      createNewGame();
    }
  }, []);
  useEffect(() => {
    if (spaces.length > 0) {
      centerBoardInViewport();
      findCommandSpace(); // Find Command space and set player position
    }
  }, [spaces]);

  useEffect(() => {
    const handleResize = () => {
      // Recalculate board dimensions on window resize
      if (currentMap?.generationConfig) {
        setBoardDimensions({
          width: Math.max(window.innerWidth * 0.8, 1000),
          height: Math.max(window.innerHeight * 0.8, 800),
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentMap]);

  // Fetch available maps on component mount
  useEffect(() => {
    const initializeMap = async () => {
      setIsLoading(true); // Start loading
      console.log("Initializing map with ID:", mapId);

      if (mapId) {
        try {
          // First, get the map layout
          const spaces = await mapService.getMapById(mapId);
          setSpaces(spaces);

          // Set this map as current
          const mapMetadata = mapService.getMapMetadata(mapId);
          setCurrentMap(mapMetadata || null);

          // Create a new game with this map
          await createNewGame();

          // Setup connections for the board
          let boardConnections = mapMetadata?.connections || {};

          // If connections object is empty, generate circular connections
          if (Object.keys(boardConnections).length === 0) {
            boardConnections = {};
            spaces.forEach((space, index) => {
              // For clockwise movement - connect to next space
              const nextIndex = (index + 1) % spaces.length;
              // For counterclockwise movement - connect to previous space
              const prevIndex = (index - 1 + spaces.length) % spaces.length;

              // Each space has two connections - next and previous
              boardConnections[space.id] = [
                spaces[nextIndex].id,
                spaces[prevIndex].id,
              ];

              console.log(
                `Creating connections for space ${space.id}: clockwise=${spaces[nextIndex].id}, counterclockwise=${spaces[prevIndex].id}`
              );
            });
          }

          // Set the connections
          setConnections(boardConnections);

          // Everything is loaded
          setIsLoading(false);
        } catch (error) {
          console.error("Error loading map:", error);
          setIsLoading(false); // Make sure to end loading even if there's an error
        }
      } else {
        setIsLoading(false); // No map ID, so nothing to load
      }
    };

    initializeMap();
  }, [mapId]); // This will reload whenever mapId changes

  const handleSkipClaim = () => {
    setShowPostMoveActions(false);
    setCurrentLandedSpace(null);
    setCurrentPhase("END_TURN");
    console.log("Player skipped claiming the space");
  };

  const handleDiceRoll = (value: number) => {
    console.log(`Dice rolled: ${value}`);
    setDiceValue(value);

    // Move to moving phase
    setCurrentPhase("MOVING");

    // Get the current player
    const currentPlayer = players[currentPlayerIndex];

    // Start movement animation if player has a position
    if (currentPlayer.position !== null) {
      // Create a movement path
      const path = createDirectionalPath(
        currentPlayer.position,
        value,
        "clockwise"
      );

      // Start the animation
      setMovementState({
        isAnimating: true,
        path,
        currentPathIndex: 0,
      });

      // Animate along the path
      animateAlongPath(path);
    } else {
      console.error("Player has no position to start movement from");
      // Fallback to after move phase if player has no position
      setCurrentPhase("AFTER_MOVE");
    }
  };

  // Test movement handler
  const handleTestRoll = (
    steps: number,
    direction: "clockwise" | "counterclockwise"
  ) => {
    console.log(`Testing movement in ${direction} direction`);
    console.log(`Rolled: ${steps} steps`);

    const currentPlayer = players[currentPlayerIndex];

    if (currentPlayer.position === null) {
      // If player has no position yet, place them at the first space
      if (spaces.length > 0) {
        setPlayers((prevPlayers) => {
          const newPlayers = [...prevPlayers];
          newPlayers[currentPlayerIndex] = {
            ...newPlayers[currentPlayerIndex],
            position: spaces[0].id,
          };
          return newPlayers;
        });
        console.log(`Placed player at starting position`);
        return;
      }
    }

    // Create path based on direction
    const path = createDirectionalPath(
      currentPlayer.position!,
      steps,
      direction
    );

    // Start the animation
    setMovementState({
      isAnimating: true,
      path,
      currentPathIndex: 0,
    });

    // Animate along the path
    animateAlongPath(path);
  };

  // Create a path based on direction of movement
  const createDirectionalPath = (
    startSpaceId: number,
    steps: number,
    direction: "clockwise" | "counterclockwise"
  ): number[] => {
    const path: number[] = [startSpaceId];
    let currentId = startSpaceId;

    for (let i = 0; i < steps; i++) {
      // Find the connected spaces
      const connectedSpaces = connections[currentId] || [];

      if (connectedSpaces.length === 0) break;

      let nextId: number;

      // Index 0 is clockwise, index 1 is counterclockwise
      if (direction === "clockwise") {
        nextId = connectedSpaces[0];
      } else {
        // Check if we have a counterclockwise connection
        if (connectedSpaces.length > 1) {
          nextId = connectedSpaces[1];
        } else {
          // Fallback if there's no counterclockwise connection defined
          nextId = connectedSpaces[0];
          console.warn(
            `No counterclockwise connection for space ${currentId}, using clockwise instead`
          );
        }
      }

      path.push(nextId);
      currentId = nextId;
    }

    console.log(`Created ${direction} path:`, path);
    return path;
  };

  // Animate along the path
  const animateAlongPath = (path: number[]) => {
    // Start with 0 to include the initial position in animation
    let step = 0;

    // Function to update position
    const advanceStep = () => {
      // Update the movement state (for path visualization)
      setMovementState((prev) => ({
        ...prev,
        currentPathIndex: step,
      }));

      // Update player position
      setPlayers((prevPlayers) => {
        const newPlayers = [...prevPlayers];
        newPlayers[currentPlayerIndex] = {
          ...newPlayers[currentPlayerIndex],
          position: path[step],
        };
        return newPlayers;
      });

      // Move to next step
      step++;

      // If we've reached the end of the path
      if (step >= path.length) {
        clearInterval(intervalId);

        // Complete the movement
        setMovementState({
          isAnimating: false,
          path: [],
          currentPathIndex: 0,
        });

        // Notify movement completion with the final position
        handleMoveComplete(path[path.length - 1]);
        return;
      }
    };

    // Show initial position
    advanceStep();

    // Set interval to animate through the rest of the path
    const intervalId = setInterval(advanceStep, 500);
  };

  // Add a function to handle player token click
  const handlePlayerTokenClick = (playerId: string) => {
    console.log(`Clicked on player: ${playerId}`);
    // You can show player details, stats, etc.
  };

  const handleClaimSpace = async () => {
    if (!currentLandedSpace || !gameId) {
      console.error("Cannot claim space: No game ID or space selected");
      return;
    }

    const currentPlayer = players[currentPlayerIndex];
    console.log(
      `Attempting to claim space ${currentLandedSpace.id} in game ${gameId}`
    );
    try {
      // Before making the API call
      console.log(
        `API URL: http://localhost:5000/api/game/${gameId}/claim-space`
      );
      console.log(
        "Request body:",
        JSON.stringify({
          spaceId: currentLandedSpace.id,
        })
      );
      // Use the actual game ID, not the map ID
      const response = await fetch(
        `http://localhost:5000/api/game/${gameId}/claim-space`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "player-id": currentPlayer.id,
          },
          body: JSON.stringify({
            spaceId: currentLandedSpace.id,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        // Update local state only after successful backend update
        setSpaces((prevSpaces) => {
          return prevSpaces.map((space) => {
            if (space.id === currentLandedSpace.id) {
              return {
                ...space,
                owner: currentPlayer.id,
              };
            }
            return space;
          });
        });

        // Update the player's owned cells locally
        setPlayers((prevPlayers) => {
          const newPlayers = [...prevPlayers];
          const playerIndex = newPlayers.findIndex(
            (p) => p.id === currentPlayer.id
          );

          if (playerIndex !== -1) {
            if (
              !newPlayers[playerIndex].ownedCells.includes(
                currentLandedSpace.id
              )
            ) {
              newPlayers[playerIndex].ownedCells = [
                ...newPlayers[playerIndex].ownedCells,
                currentLandedSpace.id,
              ];
            }
          }

          return newPlayers;
        });

        console.log(
          `Player ${currentPlayer.id} claimed space ${currentLandedSpace.id}`
        );
      } else {
        console.error("Failed to claim space:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error claiming space:", error);

      // Add better error handling
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error(
          "Server connection error - make sure your backend is running on port 5000"
        );
      }
    } finally {
      setShowPostMoveActions(false);
      setCurrentLandedSpace(null);
      setCurrentPhase("END_TURN");
    }
  };

  const claimSpace = (spaceId: number) => {
    const currentPlayer = players[currentPlayerIndex];

    // Update the space owner
    setSpaces((prevSpaces) => {
      return prevSpaces.map((space) => {
        if (space.id === spaceId) {
          // If space is already owned by this player, level it up instead
          if (space.owner === currentPlayer.id) {
            return {
              ...space,
              level: (space.level || 0) + 1,
            };
          }
          // Otherwise claim it
          return {
            ...space,
            owner: currentPlayer.id,
          };
        }
        return space;
      });
    });

    // Add the space to the player's owned cells
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const playerIndex = newPlayers.findIndex(
        (p) => p.id === currentPlayer.id
      );

      if (playerIndex !== -1) {
        // Add space to owned cells if not already there
        if (!newPlayers[playerIndex].ownedCells.includes(spaceId)) {
          newPlayers[playerIndex].ownedCells = [
            ...newPlayers[playerIndex].ownedCells,
            spaceId,
          ];
        }
      }

      return newPlayers;
    });

    console.log(`Player ${currentPlayer.id} claimed space ${spaceId}`);
  };

  // Add this function to calculate and award DP at turn start
  const calculateDeploymentPoints = () => {
    // Get the current player
    const currentPlayer = players[currentPlayerIndex];

    // Calculate DP from owned spaces
    let dpFromSpaces = 0;
    currentPlayer.ownedCells.forEach((spaceId) => {
      const space = spaces.find((s) => s.id === spaceId);
      if (space) {
        // Base value + bonus for level
        dpFromSpaces += space.value * (1 + (space.level || 0) * 0.5);
      }
    });

    // Add base DP (e.g., 2 DP per turn)
    const baseDp = 2;
    const totalDp = baseDp + dpFromSpaces;

    // Update player's DP
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const playerIndex = newPlayers.findIndex(
        (p) => p.id === currentPlayer.id
      );

      if (playerIndex !== -1) {
        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          deploymentPoints: newPlayers[playerIndex].deploymentPoints + totalDp,
        };
      }

      return newPlayers;
    });

    console.log(
      `Player ${currentPlayer.id} earned ${totalDp} DP (${baseDp} base + ${dpFromSpaces} from spaces)`
    );
  };

  const handlePhaseChange = () => {
    switch (currentPhase) {
      case "DRAW":
        calculateDeploymentPoints();
        // Move to movement phase
        setCurrentPhase("MOVE");
        break;

      case "AFTER_MOVE":
        // Check the space the player landed on
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.position !== null) {
          const landedSpace = spaces.find(
            (s) => s.id === currentPlayer.position
          );

          if (landedSpace) {
            if (!landedSpace.owner) {
              // Empty space - go to claim phase
              setCurrentPhase("CLAIM");
            } else if (landedSpace.owner !== currentPlayer.id) {
              // Opponent's space - go to battle phase
              setCurrentPhase("BATTLE");
            } else {
              // Own space - go to upgrade phase
              setCurrentPhase("UPGRADE");
            }
          }
        }
        break;

      case "CLAIM":
        // Player chooses to claim the space or not
        if (currentPlayerIndex === 0 && players[0].position !== null) {
          claimSpace(players[0].position);
        }
        setCurrentPhase("END_TURN");
        break;

      case "BATTLE":
        // Battle logic would go here
        // For now, just move to end turn
        setCurrentPhase("END_TURN");
        break;

      case "UPGRADE":
        // Upgrade logic would go here
        // For now, just move to end turn
        setCurrentPhase("END_TURN");
        break;

      case "END_TURN":
        // End turn, switch to next player
        setCurrentPhase("DRAW");
        setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        setDiceValue(null);
        break;
      default:
        break;
    }
  };

  // This function finds the Command space to place the player initially
  const findCommandSpace = () => {
    const commandSpace = spaces.find((space) => space.terrain === "command");
    if (commandSpace) {
      // Update the current player's position
      setPlayers((prevPlayers) => {
        const newPlayers = [...prevPlayers];
        newPlayers[currentPlayerIndex] = {
          ...newPlayers[currentPlayerIndex],
          position: commandSpace.id,
        };
        return newPlayers;
      });
      console.log(`Player starting at Command space: ${commandSpace.id}`);
    } else {
      // Fallback to the first space if no Command space exists
      if (spaces.length > 0) {
        setPlayers((prevPlayers) => {
          const newPlayers = [...prevPlayers];
          newPlayers[currentPlayerIndex] = {
            ...newPlayers[currentPlayerIndex],
            position: spaces[0].id,
          };
          return newPlayers;
        });
        console.log(
          `No Command space found, starting at first space: ${spaces[0].id}`
        );
      }
    }
  };

  // Change map - simplified without overriding positions
  const changeMap = async (mapId?: string) => {
    try {
      // If no mapId provided, cycle to next map
      if (!mapId && currentMap) {
        const currentIndex = availableMaps.findIndex(
          (m) => m.id === currentMap.id
        );
        const nextIndex = (currentIndex + 1) % availableMaps.length;
        mapId = availableMaps[nextIndex].id;
      }

      // Fetch map spaces - use these positions directly as they come from backend
      const mapSpaces = await mapService.getMapById(mapId!);
      const mapMetadata = mapService.getMapMetadata(mapId!);

      // Set connections from the map or generate them if needed
      let boardConnections = mapMetadata?.connections || {};

      // If no connections exist, create default ones (each space connects to the next)
      if (Object.keys(boardConnections).length === 0) {
        boardConnections = {};
        mapSpaces.forEach((space, index) => {
          // Connect to the next space in the square (and wrap around)
          boardConnections[space.id] = [(index + 1) % mapSpaces.length];
        });
      }

      // Update spaces and current map
      setSpaces(mapSpaces);
      setConnections(boardConnections);
      setCurrentMap(availableMaps.find((m) => m.id === mapId) || null);

      // Set board dimensions based on map config
      if (mapMetadata?.generationConfig) {
        const { spacesPerSide, cellSize, cellSpacing } =
          mapMetadata.generationConfig;
        const totalSize =
          spacesPerSide * cellSize + (spacesPerSide - 1) * cellSpacing + 100; // Add some margin

        setBoardDimensions({
          width: totalSize,
          height: totalSize,
        });
      }
    } catch (error) {
      console.error("Error changing map:", error);
    }
  };

  // Handle space click - enhanced to include claiming territory
  const handleSpaceClick = (space: BoardSpaceDto) => {
    console.log(
      `Clicked space: ${space.id}, terrain: ${space.terrain}, ${space.isCorner ? "corner" : "side"}`
    );

    // If space is already selected, deselect it
    if (selectedSpace?.id === space.id) {
      setSelectedSpace(null);
    } else {
      // Select this space only
      setSelectedSpace(space);
    }

    // No automatic claiming of spaces when clicked
  };

  // Show connected spaces when a space is selected
  const highlightConnectedSpaces = (spaceId: number): number[] => {
    // Get the connected spaces from the connections object
    const connectedSpaces = connections[spaceId] || [];
    console.log(`Space ${spaceId} is connected to:`, connectedSpaces);
    return connectedSpaces;
  };

  // Handle right mouse down to start dragging
  const handleRightMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 2) return; // Only right mouse button

    e.preventDefault(); // Prevent context menu
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move during right-click dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMousePosition.x;
    const dy = e.clientY - lastMousePosition.y;

    setViewportOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 2) {
      setIsDragging(false);
    }
  };

  // Prevent context menu on right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {isLoading ? (
        <div
          className="loading-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
            background: "#242424",
            color: "white",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div>
            <h2>Loading Game...</h2>
            <p>Initializing board and connections</p>
          </div>
        </div>
      ) : (
        <div
          ref={boardContainerRef}
          className="game-board-container"
          onContextMenu={handleContextMenu}
          onMouseDown={handleRightMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Current player indicator */}
          <div
            className="player-turn-indicator"
            style={{
              background:
                currentPlayerId === "player1"
                  ? "rgba(74, 144, 226, 0.8)"
                  : "rgba(226, 85, 85, 0.8)",
            }}
          >
            {currentPlayerId === "player1" ? "Your Turn" : "Opponent's Turn"}
          </div>

          {/* DP indicator */}
          <div
            className="player-dp-indicator"
            style={{
              position: "absolute",
              top: "60px", // Position it below the turn indicator
              right: "10px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#fff",
              padding: "8px 15px",
              borderRadius: "8px",
              fontWeight: "bold",
              zIndex: 100,
            }}
          >
            {players[currentPlayerIndex].deploymentPoints} DP
          </div>

          {/* Add test panel */}
          <TestMovementPanel onRollTest={handleTestRoll} />

          {/* Return to menu button */}
          <button
            className="return-button"
            onClick={onReturnToMenu}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 100,
            }}
          >
            Return to Menu
          </button>

          {/* Dice roller and phase info */}
          <div
            style={{
              position: "absolute",
              top: "240px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              background: "rgba(0, 0, 0, 0.7)",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <div className="phase-indicator">
              Phase: {currentPhase.replace("_", " ")}
            </div>

            <DiceRoller
              onRoll={handleDiceRoll}
              onPhaseChange={handlePhaseChange}
              disabled={false} // You can add conditions here if needed
              currentPhase={currentPhase}
              value={diceValue}
            />
          </div>

          {/* Game board */}
          <div
            className="game-board"
            style={{
              width: `${boardDimensions.width}px`,
              height: `${boardDimensions.height}px`,
              transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px)`,
            }}
          >
            {/* Render spaces */}
            {spaces.map((space) => {
              const isConnected = selectedSpace
                ? highlightConnectedSpaces(selectedSpace.id).includes(space.id)
                : false;

              return (
                <div
                  key={space.id}
                  className={`
                      board-space 
                      ${selectedSpace?.id === space.id ? "selected" : ""} 
                      ${isConnected ? "connected" : ""}
                      terrain-${space.terrain} 
                      ${space.isCorner ? "corner-cell" : ""}
                      ${space.owner ? `owned-by-${space.owner}` : ""}
                    `}
                  style={{
                    left: `${space.position.x}px`,
                    top: `${space.position.y}px`,
                    width: `110px`, // Slightly smaller for better spacing
                    height: `110px`,
                    transform: "translate(-50%, -50%)", // Center the space on its position
                  }}
                  onClick={() => handleSpaceClick(space)}
                >
                  <div className="space-content">
                    <span className="terrain-symbol">
                      {getTerrainSymbol(space.terrain)}
                    </span>
                    <span className="space-id">{space.id}</span>

                    {/* Show space value and level */}
                    <div className="space-stats">
                      <span className="space-value">Value: {space.value}</span>
                      {space.level > 0 && (
                        <span className="space-level">
                          Level: {space.level}
                        </span>
                      )}
                    </div>

                    {/* Show owner if space is owned */}
                    {space.owner && (
                      <div className="space-owner">{space.owner}</div>
                    )}

                    {/* Show unit if present */}
                    {space.unit && (
                      <div className="space-unit">
                        {space.unit.name || "Unit"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Render player tokens */}
            {players.map((player) => {
              if (player.position !== null) {
                const space = spaces.find((s) => s.id === player.position);
                if (space) {
                  return (
                    <PlayerToken
                      key={player.id}
                      player={player}
                      position={space.position}
                      isMoving={
                        movementState.isAnimating &&
                        players[currentPlayerIndex].id === player.id
                      }
                      onClick={() => handlePlayerTokenClick(player.id)}
                    />
                  );
                }
              }
              return null;
            })}

            {/* Render movement path indicators */}
            <MovementPath movementState={movementState} spaces={spaces} />
          </div>
          {/* Add inside your return statement, right before the closing div */}
          {showPostMoveActions && (
            <PostMoveActionPanel
              space={currentLandedSpace}
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              onClaim={handleClaimSpace}
              onSkip={handleSkipClaim}
            />
          )}
        </div>
      )}
    </>
  );
};
export default GameBoard;
