// Cell in the maze grid
export interface Cell {
  row: number;
  col: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

// Position in the maze
export interface Position {
  row: number;
  col: number;
}

// Direction for movement
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Move record with position and direction taken
export interface MoveRecord {
  position: Position;
  direction: Direction | null;
}

// Maze structure
export interface Maze {
  grid: Cell[][];
  rows: number;
  cols: number;
  start: Position;
  goal: Position;
}

// Player state during the game
export interface PlayerState {
  id: 1 | 2;
  name: string;
  prompt: string;
  position: Position;
  moves: number;
  invalidMoves: number;
  moveHistory: MoveRecord[];
  bestDistance: number; // Closest distance to goal ever reached
  status: 'waiting' | 'playing' | 'finished' | 'stopped' | 'error';
  errorMessage?: string;
}

// Available AI models
export type AIModel = 'gpt-4.1' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-5' | 'gpt-5.2';

// Game state
export interface GameState {
  status: 'idle' | 'ready' | 'playing' | 'finished';
  maze: Maze | null;
  player1: PlayerState;
  player2: PlayerState;
  winner: 1 | 2 | 'tie' | null;
  moveDelay: number;
  maxMoves: number;
  globalStartTime: number | null;
  globalEndTime: number | null;
}

// Game configuration
export interface GameConfig {
  mazeRows: number;
  mazeCols: number;
  moveDelay: number;
  maxMoves: number;
  apiKey: string;
  model: AIModel;
}
