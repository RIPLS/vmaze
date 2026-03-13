import type { GameConfig } from '../types';
import { GlobalTimer } from './GlobalTimer';

const MAX_MOVES_OPTIONS = [100, 200, 300, 400, 500, 750, 1000];

interface GameControlsProps {
  config: GameConfig;
  onConfigChange: (config: Partial<GameConfig>) => void;
  onGenerateMaze: () => void;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onClearAll: () => void;
  gameStatus: 'idle' | 'ready' | 'playing' | 'finished';
  hasApiKey: boolean;
  globalStartTime: number | null;
  globalEndTime: number | null;
}

export function GameControls({
  config,
  onConfigChange,
  onGenerateMaze,
  onStart,
  onStop,
  onRestart,
  onClearAll,
  gameStatus,
  hasApiKey,
  globalStartTime,
  globalEndTime,
}: GameControlsProps) {
  const isPlaying = gameStatus === 'playing';
  const canStart = gameStatus === 'ready' && hasApiKey;
  const canRestart = gameStatus === 'finished' || gameStatus === 'ready';

  return (
    <div className="game-controls">
      <div className="controls-row">
        <div className="control-group">
          <label htmlFor="maze-size">Maze Size:</label>
          <select
            id="maze-size"
            value={`${config.mazeRows}x${config.mazeCols}`}
            onChange={(e) => {
              const [rows, cols] = e.target.value.split('x').map(Number);
              onConfigChange({ mazeRows: rows, mazeCols: cols });
            }}
            disabled={isPlaying}
          >
            <option value="8x8">8 x 8 (Easy)</option>
            <option value="10x10">10 x 10 (Medium)</option>
            <option value="12x12">12 x 12 (Hard)</option>
            <option value="15x15">15 x 15 (Expert)</option>
            <option value="20x20">20 x 20 (Extreme)</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="move-delay">Move Delay: {config.moveDelay}ms</label>
          <input
            id="move-delay"
            type="range"
            min="0"
            max="500"
            step="50"
            value={config.moveDelay}
            onChange={(e) => onConfigChange({ moveDelay: Number(e.target.value) })}
            disabled={isPlaying}
          />
        </div>

        <div className="control-group">
          <label htmlFor="max-moves">Max Moves:</label>
          <select
            id="max-moves"
            value={config.maxMoves}
            onChange={(e) => onConfigChange({ maxMoves: Number(e.target.value) })}
            disabled={isPlaying}
          >
            {MAX_MOVES_OPTIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="controls-row buttons-row">
        <button
          className="btn btn-generate"
          onClick={onGenerateMaze}
          disabled={isPlaying}
        >
          Generate Maze
        </button>

        {!isPlaying ? (
          <button
            className="btn btn-start"
            onClick={onStart}
            disabled={!canStart}
          >
            START BATTLE
          </button>
        ) : (
          <button
            className="btn btn-stop"
            onClick={onStop}
          >
            STOP
          </button>
        )}

        <button
          className="btn btn-restart"
          onClick={onRestart}
          disabled={isPlaying || !canRestart}
          title="New maze, keep prompts"
        >
          Restart
        </button>

        <button
          className="btn btn-clear"
          onClick={onClearAll}
          disabled={isPlaying}
          title="Clear everything"
        >
          Clear All
        </button>
      </div>

      <div className="timer-row">
        <GlobalTimer
          startTime={globalStartTime}
          endTime={globalEndTime}
          isRunning={isPlaying}
        />
      </div>

      {!hasApiKey && (
        <div className="warning-message">
          Please enter your OpenAI API key in Settings (gear icon in top right)
        </div>
      )}
    </div>
  );
}
