// models/gameStateModel.ts
export interface PlayerState {
  id: string;
  // Only keep essential properties
  health: number;
  deploymentPoints: number;
}

export interface GameState {
  id: string;
  // Only track active player
  activePlayerId: string;
  // Keep track of players
  players: {
    [playerId: string]: PlayerState;
  };
  // Simple board spaces array
  board: BoardSpace[];
}

export interface BoardSpace {
  id: number;
  type: string;
  position: { x: number; y: number };
  owner: string | null;
  unitId: number | null;
}

export function createEmptyPlayerState(playerId: string): PlayerState {
  return {
    id: playerId,
    health: 20,
    deploymentPoints: 5, // Start with some points
  };
}

export function createNewGameState(
  player1Id: string,
  player2Id: string
): GameState {
  return {
    id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    activePlayerId: player1Id,
    players: {
      [player1Id]: createEmptyPlayerState(player1Id),
      [player2Id]: createEmptyPlayerState(player2Id),
    },
    board: [], // Will be populated by the gameBoard component
  };
}
