import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, PlayerState, Maze, Position, GameConfig, MoveRecord } from '../types';
import { generateMaze, isValidMove, getNewPosition, isAtGoal } from '../utils/mazeAlgorithms';
import { getNextMove, initializeOpenAI, isOpenAIInitialized, calculateDistance } from '../services/openai';
import { gameLogger } from '../services/gameLogger';

// Debug prompts: used when ?debug=true in URL
const DEBUG_PROMPT_1 = `Always turn right. If you can't turn right, continue straight.
If, after turning right you can't continue straight, turn right again.`;

const DEBUG_PROMPT_2 = `Move towards the goal by choosing the direction that minimizes distance.
Prioritize: DOWN, RIGHT, UP, LEFT when distances are equal.
Never revisit a position unless all other moves are blocked.
If stuck in a loop, try the least recently used direction.`;

const createInitialPlayerState = (id: 1 | 2): PlayerState => ({
  id,
  name: `Player ${id}`,
  prompt: '',
  position: { row: 0, col: 0 },
  moves: 0,
  invalidMoves: 0,
  moveHistory: [],
  bestDistance: Infinity,
  status: 'waiting',
});

const initialGameState: GameState = {
  status: 'idle',
  maze: null,
  player1: createInitialPlayerState(1),
  player2: createInitialPlayerState(2),
  winner: null,
  moveDelay: 0,
  maxMoves: 300,
  globalStartTime: null,
  globalEndTime: null,
};

// Get initial API key from localStorage
function getInitialApiKey(): string {
  const storedKey = localStorage.getItem('vmaze_api_key');
  if (storedKey && storedKey.startsWith('sk-') && storedKey.length > 20) {
    return storedKey;
  }
  return '';
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [config, setConfig] = useState<GameConfig>(() => ({
    mazeRows: 10,
    mazeCols: 10,
    moveDelay: 0,
    maxMoves: 300,
    apiKey: getInitialApiKey(),
    model: 'gpt-5.2',
  }));

  // Refs to track current values for async operations
  const gameStateRef = useRef(gameState);
  const configRef = useRef(config);
  const abortRef = useRef(false);
  const winnerRef = useRef<1 | 2 | null>(null);

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Initialize OpenAI client with the API key
  useEffect(() => {
    const key = getInitialApiKey();
    if (key) {
      initializeOpenAI(key);
    }
  }, []);

  // Debug mode: auto-fill prompts when ?debug=true in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setGameState(prev => ({
        ...prev,
        player1: { ...prev.player1, prompt: DEBUG_PROMPT_1 },
        player2: { ...prev.player2, prompt: DEBUG_PROMPT_2 },
      }));
    }
  }, []);

  // Generate new maze
  const generateNewMaze = useCallback(() => {
    const currentConfig = configRef.current;
    const maze = generateMaze(currentConfig.mazeRows, currentConfig.mazeCols);
    const startRecord: MoveRecord = { position: { ...maze.start }, direction: null };
    
    setGameState(prev => ({
      ...prev,
      status: 'ready',
      maze,
      player1: {
        ...prev.player1,
        position: { ...maze.start },
        moves: 0,
        invalidMoves: 0,
        moveHistory: [startRecord],
        bestDistance: Infinity,
        status: 'waiting',
        errorMessage: undefined,
      },
      player2: {
        ...prev.player2,
        position: { ...maze.start },
        moves: 0,
        invalidMoves: 0,
        moveHistory: [startRecord],
        bestDistance: Infinity,
        status: 'waiting',
        errorMessage: undefined,
      },
      winner: null,
      globalStartTime: null,
      globalEndTime: null,
    }));
  }, []);

  // Update player prompt
  const updatePlayerPrompt = useCallback((playerId: 1 | 2, prompt: string) => {
    setGameState(prev => ({
      ...prev,
      [playerId === 1 ? 'player1' : 'player2']: {
        ...prev[playerId === 1 ? 'player1' : 'player2'],
        prompt,
      },
    }));
  }, []);

  // Update player name
  const updatePlayerName = useCallback((playerId: 1 | 2, name: string) => {
    setGameState(prev => ({
      ...prev,
      [playerId === 1 ? 'player1' : 'player2']: {
        ...prev[playerId === 1 ? 'player1' : 'player2'],
        name,
      },
    }));
  }, []);

  // Update config
  const updateConfig = useCallback((newConfig: Partial<GameConfig>) => {
    if (newConfig.apiKey !== undefined) {
      setConfig(prev => ({ ...prev, apiKey: newConfig.apiKey! }));
      if (newConfig.apiKey) {
        initializeOpenAI(newConfig.apiKey);
        localStorage.setItem('vmaze_api_key', newConfig.apiKey);
      } else {
        localStorage.removeItem('vmaze_api_key');
      }
    }
    
    if (newConfig.mazeRows !== undefined || newConfig.mazeCols !== undefined) {
      setConfig(prev => ({
        ...prev,
        mazeRows: newConfig.mazeRows ?? prev.mazeRows,
        mazeCols: newConfig.mazeCols ?? prev.mazeCols,
      }));
    }

    if (newConfig.model !== undefined) {
      setConfig(prev => ({ ...prev, model: newConfig.model! }));
    }
    
    if (newConfig.moveDelay !== undefined) {
      setConfig(prev => ({ ...prev, moveDelay: newConfig.moveDelay! }));
      setGameState(prev => ({ ...prev, moveDelay: newConfig.moveDelay! }));
    }
    
    if (newConfig.maxMoves !== undefined) {
      setConfig(prev => ({ ...prev, maxMoves: newConfig.maxMoves! }));
      setGameState(prev => ({ ...prev, maxMoves: newConfig.maxMoves! }));
    }
  }, []);

  // Run a single player's bot
  const runPlayerBot = async (
    playerId: 1 | 2,
    maze: Maze,
    initialPosition: Position,
    prompt: string,
    moveDelay: number,
    maxMoves: number,
    model: string
  ): Promise<void> => {
    let currentPosition = { ...initialPosition };
    let moves = 0;
    let invalidMoves = 0;
    const moveHistory: MoveRecord[] = [{ position: { ...initialPosition }, direction: null }];
    
    // Track best (closest) distance to goal
    let bestDistance = calculateDistance(initialPosition, maze.goal);

    while (!isAtGoal(currentPosition, maze.goal) && moves < maxMoves && !abortRef.current && !winnerRef.current) {
      try {
        // Get next move from AI with full history
        const direction = await getNextMove(maze, currentPosition, prompt, moveHistory, model as any, playerId, moves + 1);
        
        // Check if move is valid
        if (isValidMove(maze, currentPosition, direction)) {
          // Update the last record with the direction taken
          if (moveHistory.length > 0) {
            moveHistory[moveHistory.length - 1].direction = direction;
          }
          
          currentPosition = getNewPosition(currentPosition, direction);
          moveHistory.push({ position: { ...currentPosition }, direction: null });
          moves++;
          
          // Update best distance if this position is closer
          const currentDistance = calculateDistance(currentPosition, maze.goal);
          if (currentDistance < bestDistance) {
            bestDistance = currentDistance;
          }
        } else {
          invalidMoves++;
          moves++; // Count invalid attempts too
        }
        
        // Update state
        setGameState(prev => ({
          ...prev,
          [playerId === 1 ? 'player1' : 'player2']: {
            ...prev[playerId === 1 ? 'player1' : 'player2'],
            position: { ...currentPosition },
            moves,
            invalidMoves,
            moveHistory: [...moveHistory],
            bestDistance,
          },
        }));
        
        // Delay for visibility
        await new Promise(resolve => setTimeout(resolve, moveDelay));
        
      } catch (error) {
        // Handle error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Player ${playerId} error:`, errorMessage);
        setGameState(prev => ({
          ...prev,
          [playerId === 1 ? 'player1' : 'player2']: {
            ...prev[playerId === 1 ? 'player1' : 'player2'],
            status: 'error',
            errorMessage,
          },
        }));
        return;
      }
    }
    
    // Check if this player reached the goal
    const reachedGoal = isAtGoal(currentPosition, maze.goal);
    
    // If this player reached the goal first, declare them the winner immediately
    if (reachedGoal && !winnerRef.current) {
      winnerRef.current = playerId;
      abortRef.current = true; // Stop the other player
      
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        globalEndTime: Date.now(),
        winner: playerId,
        [playerId === 1 ? 'player1' : 'player2']: {
          ...prev[playerId === 1 ? 'player1' : 'player2'],
          status: 'finished',
        },
        // Mark the other player as stopped
        [playerId === 1 ? 'player2' : 'player1']: {
          ...prev[playerId === 1 ? 'player2' : 'player1'],
          status: 'stopped',
        },
      }));
      return;
    }
    
    // If stopped because other player won, don't update status
    if (winnerRef.current) {
      return;
    }
    
    // Mark player as finished (reached goal) or stopped (didn't reach goal)
    const finalStatus = reachedGoal ? 'finished' : 'stopped';
    const finalErrorMessage = !reachedGoal && moves >= maxMoves ? 'Max moves reached' : undefined;
    
    setGameState(prev => ({
      ...prev,
      [playerId === 1 ? 'player1' : 'player2']: {
        ...prev[playerId === 1 ? 'player1' : 'player2'],
        status: finalStatus,
        errorMessage: finalErrorMessage,
      },
    }));
  };

  // Start the game
  const startGame = useCallback(async () => {
    // Use refs to get current values
    const currentGameState = gameStateRef.current;
    const currentConfig = configRef.current;
    
    console.log('Starting game...', { 
      hasMaze: !!currentGameState.maze, 
      prompt1: currentGameState.player1.prompt,
      prompt2: currentGameState.player2.prompt,
      apiInitialized: isOpenAIInitialized()
    });

    if (!currentGameState.maze) {
      console.error('No maze generated');
      return;
    }
    
    if (!isOpenAIInitialized()) {
      console.error('OpenAI not initialized');
      return;
    }
    
    abortRef.current = false;
    winnerRef.current = null;
    
    // Start logging
    gameLogger.startGame();
    
    // Get values we need for the game
    const maze = currentGameState.maze;
    const startPos = { ...maze.start };
    const startRecord: MoveRecord = { position: startPos, direction: null };
    const globalStartTime = Date.now();
    const player1Prompt = currentGameState.player1.prompt;
    const player2Prompt = currentGameState.player2.prompt;
    const moveDelay = currentConfig.moveDelay;
    const maxMoves = currentConfig.maxMoves;
    const initialBestDistance = calculateDistance(startPos, maze.goal);
    
    // Set initial playing state
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      winner: null,
      globalStartTime,
      globalEndTime: null,
      player1: {
        ...prev.player1,
        position: startPos,
        moves: 0,
        invalidMoves: 0,
        moveHistory: [startRecord],
        bestDistance: initialBestDistance,
        status: 'playing',
        errorMessage: undefined,
      },
      player2: {
        ...prev.player2,
        position: startPos,
        moves: 0,
        invalidMoves: 0,
        moveHistory: [startRecord],
        bestDistance: initialBestDistance,
        status: 'playing',
        errorMessage: undefined,
      },
    }));
    
    try {
      // Run both bots in parallel
      const model = currentConfig.model;
      await Promise.all([
        runPlayerBot(1, maze, startPos, player1Prompt, moveDelay, maxMoves, model),
        runPlayerBot(2, maze, startPos, player2Prompt, moveDelay, maxMoves, model),
      ]);
    } catch (error) {
      console.error('Game error:', error);
    }
    
    // If a winner was already declared (player reached goal), don't override
    if (winnerRef.current) {
      return;
    }
    
    // If the game was aborted (restart/clear), don't override the new state
    if (abortRef.current) {
      return;
    }
    
    // Neither player reached the goal - determine winner by best distance
    setGameState(prev => {
      const p1 = prev.player1;
      const p2 = prev.player2;
      
      let winner: 1 | 2 | 'tie' | null = null;
      
      // Winner is whoever got closest to the goal at any point
      const p1BestDistance = p1.bestDistance;
      const p2BestDistance = p2.bestDistance;
      
      if (p1BestDistance < p2BestDistance) {
        winner = 1;
      } else if (p2BestDistance < p1BestDistance) {
        winner = 2;
      } else {
        // Same best distance - compare by fewer moves used
        if (p1.moves < p2.moves) {
          winner = 1;
        } else if (p2.moves < p1.moves) {
          winner = 2;
        } else {
          winner = 'tie';
        }
      }
      
      return {
        ...prev,
        status: 'finished',
        globalEndTime: Date.now(),
        winner,
      };
    });
  }, []);

  // Stop the game
  const stopGame = useCallback(() => {
    abortRef.current = true;
    winnerRef.current = null;
    setGameState(prev => ({
      ...prev,
      status: 'finished',
      globalEndTime: Date.now(),
    }));
  }, []);

  // Restart game - keeps prompts and player names, generates new maze
  const restartGame = useCallback(() => {
    abortRef.current = true;
    winnerRef.current = null;
    const currentConfig = configRef.current;
    const maze = generateMaze(currentConfig.mazeRows, currentConfig.mazeCols);
    const startRecord: MoveRecord = { position: { ...maze.start }, direction: null };
    
    setGameState(prev => ({
      ...prev,
      status: 'ready',
      maze,
      player1: {
        ...prev.player1,
        position: { ...maze.start },
        moves: 0,
        invalidMoves: 0,
        moveHistory: [startRecord],
        bestDistance: Infinity,
        status: 'waiting',
        errorMessage: undefined,
      },
      player2: {
        ...prev.player2,
        position: { ...maze.start },
        moves: 0,
        invalidMoves: 0,
        moveHistory: [startRecord],
        bestDistance: Infinity,
        status: 'waiting',
        errorMessage: undefined,
      },
      winner: null,
      globalStartTime: null,
      globalEndTime: null,
    }));
  }, []);

  // Clear all - resets everything including prompts and names
  const clearAll = useCallback(() => {
    abortRef.current = true;
    winnerRef.current = null;
    const currentConfig = configRef.current;
    setGameState({
      ...initialGameState,
      moveDelay: currentConfig.moveDelay,
      maxMoves: currentConfig.maxMoves,
    });
  }, []);

  // Download game logs
  const downloadLogs = useCallback(() => {
    const currentGameState = gameStateRef.current;
    gameLogger.downloadLogs(currentGameState.player1.name, currentGameState.player2.name);
  }, []);

  // Check if logs are available
  const hasLogs = useCallback(() => {
    return gameLogger.hasLogs();
  }, []);

  return {
    gameState,
    config,
    generateNewMaze,
    updatePlayerPrompt,
    updatePlayerName,
    updateConfig,
    startGame,
    stopGame,
    restartGame,
    clearAll,
    downloadLogs,
    hasLogs,
  };
}
