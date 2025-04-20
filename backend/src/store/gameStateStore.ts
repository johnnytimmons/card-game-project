// store/gameStateStore.ts
import { GameState, PlayerState, Position } from "../models/gameStateTypes";
import { BoardCard, Card, GearCard } from "../models/cardModel";
import { BoardSpace, SpaceType } from "../models/boardSpaceModel";
import { BoardUnit } from "../models/BoardUnit";
import { findCardById, getDeckById } from "../data/card-registry";

// In-memory store for game states
const gameStates = new Map<string, GameState>();

// Calculate the toll based on space value and level
function calculateToll(space: BoardSpace): number {
  const baseValue = space.value * 5;
  const levelMultiplier = 1 + space.level * 0.5;
  return Math.floor(baseValue * levelMultiplier);
}

// Simplified battle system for Culdcept-style gameplay
function executeCuldceptCombat(
  attackingCard: Card,
  defendingUnit: BoardUnit,
  space: BoardSpace
): {
  attackerWins: boolean;
  tollAmount: number;
  combatLog: string[];
} {
  const combatLog: string[] = [];

  // Get unit stats
  const attackerPower = attackingCard.damage || 0;
  const defenderPower = defendingUnit.damage || 0;

  // Check for terrain bonuses (example logic)
  let defenderBonus = 0;
  if (space.type === "BATTLEFIELD" && defendingUnit.origin === "military") {
    defenderBonus = 2;
    combatLog.push(`${defendingUnit.name} gets +2 from Battlefield terrain!`);
  } else if (
    space.type === "RITUAL_SITE" &&
    defendingUnit.origin === "occult"
  ) {
    defenderBonus = 3;
    combatLog.push(`${defendingUnit.name} gets +3 from Ritual Site power!`);
  }

  const defenderEffectivePower = defenderPower + defenderBonus;

  // Log the battle
  combatLog.push(`Battle for ${space.type} (Level ${space.level}):`);
  combatLog.push(
    `${attackingCard.name} (${attackerPower}) vs ${defendingUnit.name} (${defenderEffectivePower})`
  );

  // Simple battle resolution: higher power wins, defender wins ties
  const attackerWins = attackerPower > defenderEffectivePower;

  // Calculate toll if attacker loses
  const tollAmount = calculateToll(space);

  if (attackerWins) {
    combatLog.push(
      `${attackingCard.name} won the battle and claims the territory!`
    );
  } else {
    combatLog.push(`${defendingUnit.name} defended the territory!`);
    combatLog.push(`${tollAmount} DP toll must be paid.`);
  }

  return {
    attackerWins,
    tollAmount,
    combatLog,
  };
}

// Export the gameStateStore object with adjusted methods for Culdcept-style gameplay
export const gameStateStore = {
  // Method 1: Get a game by ID (unchanged)
  getGame: (gameId: string): GameState | undefined => {
    return gameStates.get(gameId);
  },

  // Method 2: Update an existing game (unchanged)
  updateGame: (gameId: string, updates: Partial<GameState>): GameState => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

    // Create updated game state with new timestamp
    const updatedGameState = {
      ...gameState,
      ...updates,
      lastUpdated: new Date(),
    };

    // Store the updated state
    gameStates.set(gameId, updatedGameState);

    return updatedGameState;
  },

  // Method 3: Handle Culdcept-style combat when landing on an opponent's space
  executeCombat: (
    gameId: string,
    attackingCardId: number,
    spaceId: number,
    attackingPlayerId: string
  ) => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { success: false, message: "Game not found" };
    }

    // Find the space
    const space = gameState.gameBoard.spaces.find((s) => s.id === spaceId);
    if (!space) {
      return { success: false, message: "Space not found" };
    }

    // Verify the space has an owner and unit
    if (!space.owner || !space.unit) {
      return { success: false, message: "No opponent unit on this space" };
    }

    // Find the attacking card in player's hand
    const attackingCard = findCardById(attackingCardId);
    if (!attackingCard) {
      return { success: false, message: "Attacking card not found" };
    }

    // Execute combat
    const combatResult = executeCuldceptCombat(
      attackingCard,
      space.unit,
      space
    );

    // Update game state based on combat result
    if (combatResult.attackerWins) {
      // Attacker wins - claim the territory
      const updatedSpaces = gameState.gameBoard.spaces.map((s) => {
        if (s.id === spaceId) {
          return {
            ...s,
            owner: attackingPlayerId,
            unit: {
              ...s.unit,
              cardId: attackingCardId,
              playerId: attackingPlayerId,
              name: attackingCard.name,
              damage: attackingCard.damage || 0,
              currentHealth: attackingCard.health || 1,
            },
          };
        }
        return s;
      });

      // Update game state
      gameState.gameBoard.spaces = updatedSpaces;

      // Remove card from player's hand
      const playerState = gameState.players[attackingPlayerId];
      if (playerState) {
        playerState.handCardIds = playerState.handCardIds.filter(
          (id) => id !== attackingCardId
        );
      }
    } else {
      // Defender wins - player pays toll
      const playerState = gameState.players[attackingPlayerId];
      if (playerState) {
        playerState.deploymentPoints = Math.max(
          0,
          (playerState.deploymentPoints || 0) - combatResult.tollAmount
        );
      }

      // Add DP to defending player
      const defendingPlayerId = space.owner;
      const defenderState = gameState.players[defendingPlayerId];
      if (defenderState) {
        defenderState.deploymentPoints =
          (defenderState.deploymentPoints || 0) + combatResult.tollAmount;
      }
    }

    // Update game log
    if (!gameState.gameLog) gameState.gameLog = [];
    gameState.gameLog.push(...combatResult.combatLog);

    // Update last updated timestamp
    gameState.lastUpdated = new Date();

    // Save the updated state
    gameStates.set(gameId, gameState);

    return {
      success: true,
      attackerWins: combatResult.attackerWins,
      tollAmount: combatResult.tollAmount,
      combatLog: combatResult.combatLog,
    };
  },

  // Method 4: Create a new game with circular board
  createGame: (
    player1Id: string,
    player2Id: string,
    useSharedDeck: boolean = true,
    firstPlayerId: string = player1Id
  ): GameState => {
    // Generate a unique game ID
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create initial player states
    const player1State: PlayerState = {
      handCardIds: [],
      deckCardIds: [],
      health: 20,
      deploymentPoints: 2,
      territoryDP: 0,
      combatDP: 0,
      positionDP: 0,
      defeatedUnits: [],
      currentDP: 0,
    };

    const player2State: PlayerState = {
      handCardIds: [],
      deckCardIds: [],
      health: 20,
      deploymentPoints: 2,
      territoryDP: 0,
      combatDP: 0,
      positionDP: 0,
      defeatedUnits: [],
      currentDP: 0,
    };

    // Create circular board (24 spaces)
    const spaceTypes: SpaceType[] = [
      SpaceType.BATTLEFIELD,
      SpaceType.BUNKER,
      SpaceType.RITUAL_SITE,
      SpaceType.OUTPOST,
    ];
    const spaces: BoardSpace[] = [];

    // Generate circular board positions
    const totalSpaces = 24;
    const radius = 200;
    const centerX = 250;
    const centerY = 250;

    for (let i = 0; i < totalSpaces; i++) {
      // Calculate position on the circle
      const angle = (i / totalSpaces) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Create the space
      spaces.push({
        id: i,
        type: spaceTypes[i % spaceTypes.length],
        owner: null,
        position: { x, y },
        unit: null,
        value: Math.floor(Math.random() * 5) + 1, // Random value 1-5
        level: 0,
      });
    }

    // Create connections (each space connects to the next in sequence)
    const connections: Record<number, number[]> = {};
    for (let i = 0; i < totalSpaces; i++) {
      connections[i] = [(i + 1) % totalSpaces]; // Connect to next space in circle
    }

    // Initialize player positions
    const playerPositions = {
      [player1Id]: 0, // Player 1 starts at position 0
      [player2Id]: 12, // Player 2 starts at opposite side (halfway around)
    };

    // Create the initial game state
    const gameState: GameState = {
      id: gameId,
      playerTurn: firstPlayerId || player1Id,
      players: {
        [player1Id]: player1State,
        [player2Id]: player2State,
      },
      board: [],
      gameBoard: {
        spaces,
        connections,
      },
      playerPositions,
      roundNumber: 1,
      lastUpdated: new Date(),
      gameLog: [`Game created. Players: ${player1Id} vs ${player2Id}`],
      currentPhase: "ROLL_MOVE",
      lastDiceRoll: undefined, // Changed from null to undefined
    };

    // Set up decks
    if (useSharedDeck) {
      const sharedDeck = getDeckById("standard");
      if (sharedDeck && sharedDeck.cards) {
        // Get card IDs from the deck
        const shuffledDeck = [...sharedDeck.cards].sort(
          () => Math.random() - 0.5
        );

        // Distribute cards (half to each player)
        const halfIndex = Math.floor(shuffledDeck.length / 2);
        player1State.deckCardIds = shuffledDeck.slice(0, halfIndex);
        player2State.deckCardIds = shuffledDeck.slice(halfIndex);

        // Draw initial hands (5 cards each)
        for (let i = 0; i < 5; i++) {
          if (player1State.deckCardIds.length > 0) {
            const card = player1State.deckCardIds.shift();
            if (card) player1State.handCardIds.push(card);
          }

          if (player2State.deckCardIds.length > 0) {
            const card = player2State.deckCardIds.shift();
            if (card) player2State.handCardIds.push(card);
          }
        }
      }
    } else {
      if (!gameState.gameLog) {
        gameState.gameLog = [];
      }
      gameState.gameLog.push("Using separate decks is not yet implemented.");
    }

    // Store the game state
    gameStates.set(gameId, gameState);

    return gameState;
  },

  // Method 5: Draw cards (unchanged)
  drawCardsFromDeck: (
    gameId: string,
    playerId: string,
    numCards: number = 1
  ): GameState | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return undefined;
    }

    const playerState = gameState.players[playerId];
    if (!playerState) {
      return undefined;
    }

    // Determine how many cards we can actually draw
    const cardsToDrawCount = Math.min(numCards, playerState.deckCardIds.length);

    if (cardsToDrawCount === 0) {
      if (!gameState.gameLog) {
        gameState.gameLog = [];
      }

      gameState.gameLog.push(
        `Player ${playerId} attempted to draw but has no cards left!`
      );
      gameStates.set(gameId, {
        ...gameState,
        lastUpdated: new Date(),
      });
      return gameState;
    }

    // Get the cards to draw
    const drawnCards = playerState.deckCardIds.slice(0, cardsToDrawCount);

    // Update player's hand and deck
    const updatedPlayerState = {
      ...playerState,
      handCardIds: [...playerState.handCardIds, ...drawnCards],
      deckCardIds: playerState.deckCardIds.slice(cardsToDrawCount),
    };

    // Update game state
    const updatedGameState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: updatedPlayerState,
      },
      gameLog: [
        ...(gameState.gameLog || []),
        `Player ${playerId} drew ${drawnCards.length} card(s)`,
      ],
      lastUpdated: new Date(),
    };

    // Save the updated state
    gameStates.set(gameId, updatedGameState);

    return updatedGameState;
  },

  // Method 6: Get player hand (unchanged)
  getPlayerHandWithDetails: (
    gameId: string,
    playerId: string
  ): Card[] | undefined => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return undefined;
    }

    const playerState = gameState.players[playerId];
    if (!playerState) {
      return undefined;
    }

    // Get detailed info for each card in hand
    const handWithDetails = playerState.handCardIds
      .map((cardId) => findCardById(cardId))
      .filter((card): card is Card => card !== undefined);

    return handWithDetails;
  },

  // Method 7: Move player on the board
  movePlayer: (
    gameId: string,
    playerId: string,
    diceRoll: number
  ): {
    success: boolean;
    newPosition?: number;
    spaceInfo?: BoardSpace;
    landedOnUnowned?: boolean;
  } => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { success: false };
    }

    // Check that it's this player's turn
    if (gameState.playerTurn !== playerId) {
      return { success: false };
    }

    // Get current player position
    const currentPos = gameState.playerPositions?.[playerId] || 0;

    // Calculate new position
    const totalSpaces = gameState.gameBoard.spaces.length;
    const newPosition = (currentPos + diceRoll) % totalSpaces;

    // Update player position
    if (!gameState.playerPositions) {
      gameState.playerPositions = {};
    }

    gameState.playerPositions[playerId] = newPosition;

    // Set last dice roll
    gameState.lastDiceRoll = diceRoll;

    // Update game log
    if (!gameState.gameLog) {
      gameState.gameLog = [];
    }
    gameState.gameLog.push(
      `Player ${playerId} rolled ${diceRoll} and moved to space ${newPosition}`
    );

    // Check what kind of space the player landed on
    const space = gameState.gameBoard.spaces[newPosition];
    let nextPhase = "END_TURN";

    if (!space.owner) {
      // Empty space - player can claim it
      nextPhase = "CLAIM";
      gameState.gameLog.push(`Player landed on unclaimed ${space.type}`);
    } else if (space.owner !== playerId) {
      // Enemy territory - battle or pay toll
      nextPhase = "BATTLE";
      gameState.gameLog.push(`Player landed on opponent's ${space.type}`);
    } else {
      // Own territory - can upgrade
      nextPhase = "UPGRADE";
      gameState.gameLog.push(`Player landed on their own ${space.type}`);
    }

    // Update game phase
    gameState.currentPhase = nextPhase;
    gameState.lastUpdated = new Date();

    // Save game state
    gameStates.set(gameId, gameState);

    return {
      success: true,
      newPosition,
      spaceInfo: space,
    };
  },

  // Method 8: Claim an empty space with a card
  claimSpace: (
    gameId: string,
    playerId: string,
    spaceId: number,
    cardId: number
  ): {
    success: boolean;
    message?: string;
    unit?: BoardUnit;
  } => {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { success: false, message: "Game not found" };
    }

    // Check it's player's turn
    if (gameState.playerTurn !== playerId) {
      return { success: false, message: "Not your turn" };
    }

    // Find the space
    const spaceIndex = gameState.gameBoard.spaces.findIndex(
      (s) => s.id === spaceId
    );
    if (spaceIndex === -1) {
      return { success: false, message: "Space not found" };
    }

    const space = gameState.gameBoard.spaces[spaceIndex];

    // Check that player is on this space
    if (gameState.playerPositions[playerId] !== spaceId) {
      return {
        success: false,
        message: "You can only claim the space you're on",
      };
    }

    // Verify space is unclaimed
    if (space.owner) {
      return { success: false, message: "Space is already claimed" };
    }

    // Find the card in player's hand
    const playerState = gameState.players[playerId];
    if (!playerState.handCardIds.includes(cardId)) {
      return { success: false, message: "Card not found in your hand" };
    }

    // Get card details
    const card = findCardById(cardId);
    if (!card) {
      return { success: false, message: "Card not found in database" };
    }

    // Check player has enough DP
    const cost = card.dpCost || 1;
    if ((playerState.deploymentPoints || 0) < cost) {
      return { success: false, message: "Not enough DP" };
    }

    // Create unit for the space
    const newUnit = {
      cardId: card.cardId,
      playerId,
      name: card.name,
      damage: card.damage || 0,
      currentHealth: card.health || 1,
      origin: card.origin || "human",
      type: card.type,
      abilities: card.abilities,
    };

    // Update the space
    const updatedSpaces = [...gameState.gameBoard.spaces];
    updatedSpaces[spaceIndex] = {
      ...space,
      owner: playerId,
      unit: newUnit,
    };

    // Update game state
    gameState.gameBoard.spaces = updatedSpaces;

    // Remove card from hand and deduct DP
    playerState.handCardIds = playerState.handCardIds.filter(
      (id) => id !== cardId
    );
    playerState.deploymentPoints = (playerState.deploymentPoints || 0) - cost;

    // Update game log
    if (!gameState.gameLog) gameState.gameLog = [];
    gameState.gameLog.push(
      `Player ${playerId} claimed ${space.type} with ${card.name}`
    );

    // Update phase to end turn
    gameState.currentPhase = "END_TURN";
    gameState.lastUpdated = new Date();

    // Save game state
    gameStates.set(gameId, gameState);

    return {
      success: true,
      message: "Space claimed successfully",
    };
  },
};
