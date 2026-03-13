import type { PlayerState, Maze } from '../types';
import { MazeCanvas } from './MazeCanvas';

interface PlayerPanelProps {
  player: PlayerState;
  maze: Maze | null;
  onPromptChange: (prompt: string) => void;
  onNameChange: (name: string) => void;
  isPlaying: boolean;
}

export function PlayerPanel({ player, maze, onPromptChange, onNameChange, isPlaying }: PlayerPanelProps) {
  const getStatusBadge = () => {
    switch (player.status) {
      case 'waiting':
        return <span className="status-badge waiting">Waiting</span>;
      case 'playing':
        return <span className="status-badge playing">Playing...</span>;
      case 'finished':
        return <span className="status-badge finished">Finished!</span>;
      case 'stopped':
        return <span className="status-badge stopped">Stopped</span>;
      case 'error':
        return <span className="status-badge error">Error</span>;
      default:
        return null;
    }
  };

  const panelClass = `player-panel player-${player.id}`;

  // Extract path positions from moveHistory for the canvas
  const path = player.moveHistory.map(record => record.position);

  return (
    <div className={panelClass}>
      <div className="player-header">
        <input
          type="text"
          className="player-name-input"
          value={player.name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isPlaying}
          placeholder={`Player ${player.id}`}
        />
        {getStatusBadge()}
      </div>

      <div className="prompt-section">
        <label htmlFor={`prompt-${player.id}`}>Navigation Prompt:</label>
        <textarea
          id={`prompt-${player.id}`}
          className="prompt-textarea"
          value={player.prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isPlaying}
          placeholder={`Enter navigation instructions for Player ${player.id}...\n\nExample:\n"Always try to go RIGHT first. If you can't go right, try DOWN. If you can't go down, try LEFT. If you can't go left, try UP. Avoid going back to previous positions if possible."`}
          rows={6}
        />
      </div>

      <div className="maze-section">
        <MazeCanvas
          maze={maze}
          playerPosition={player.position}
          path={path}
          playerId={player.id}
        />
      </div>

      <div className="stats-section">
        <div className="stat">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{player.moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Invalid</span>
          <span className="stat-value invalid">{player.invalidMoves}</span>
        </div>
      </div>

      {player.errorMessage && (
        <div className="error-message">
          {player.errorMessage}
        </div>
      )}
    </div>
  );
}
