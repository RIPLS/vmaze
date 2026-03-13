import type { PlayerState } from '../types';

interface WinnerBannerProps {
  winner: 1 | 2 | 'tie' | null;
  player1: PlayerState;
  player2: PlayerState;
  visible: boolean;
  onDownloadLogs: () => void;
}

export function WinnerBanner({ winner, player1, player2, visible, onDownloadLogs }: WinnerBannerProps) {
  if (!visible || winner === null) return null;

  // Use bestDistance (closest point reached during game)
  const p1BestDistance = player1.bestDistance;
  const p2BestDistance = player2.bestDistance;

  const getWinnerInfo = () => {
    if (winner === 'tie') {
      return {
        title: "IT'S A TIE!",
        subtitle: 'Both players performed equally',
        className: 'tie',
      };
    }

    const winningPlayer = winner === 1 ? player1 : player2;
    const losingPlayer = winner === 1 ? player2 : player1;
    const winnerBestDistance = winner === 1 ? p1BestDistance : p2BestDistance;
    const loserBestDistance = winner === 1 ? p2BestDistance : p1BestDistance;

    let subtitle = '';

    // Both finished (both reached goal) - winner by fewer moves
    if (winningPlayer.status === 'finished' && losingPlayer.status === 'finished') {
      const moveDiff = losingPlayer.moves - winningPlayer.moves;
      subtitle = `Completed in ${winningPlayer.moves} moves`;
      if (moveDiff > 0) {
        subtitle += ` (${moveDiff} fewer moves)`;
      }
    }
    // Winner finished, loser stopped (didn't reach goal)
    else if (winningPlayer.status === 'finished' && losingPlayer.status === 'stopped') {
      subtitle = `Reached the goal in ${winningPlayer.moves} moves!`;
    }
    // Winner finished, loser had error
    else if (winningPlayer.status === 'finished' && losingPlayer.status === 'error') {
      subtitle = `Reached the goal in ${winningPlayer.moves} moves!`;
      subtitle += ` Opponent: ${losingPlayer.errorMessage || 'Error'}`;
    }
    // Neither finished (both stopped) - winner by best distance reached
    else {
      subtitle = `Got closest to goal (best distance: ${winnerBestDistance} vs ${loserBestDistance})`;
    }

    return {
      title: `${winningPlayer.name} WINS!`,
      subtitle,
      className: `winner-${winner}`,
    };
  };

  const info = getWinnerInfo();

  return (
    <div className={`winner-banner ${info.className}`}>
      <div className="winner-content">
        <h2 className="winner-title">{info.title}</h2>
        <p className="winner-subtitle">{info.subtitle}</p>
        
        <div className="final-stats">
          <div className="player-final-stat">
            <h4>{player1.name}</h4>
            <p>Moves: {player1.moves} | Invalid: {player1.invalidMoves}</p>
            <p>Best distance: {p1BestDistance} steps from goal</p>
            <p className={`status-${player1.status}`}>
              {player1.status === 'finished' ? 'Reached goal!' :
               player1.status === 'stopped' ? (player1.errorMessage || 'Stopped') :
               player1.status === 'error' ? player1.errorMessage : player1.status}
            </p>
          </div>
          <div className="vs-divider">VS</div>
          <div className="player-final-stat">
            <h4>{player2.name}</h4>
            <p>Moves: {player2.moves} | Invalid: {player2.invalidMoves}</p>
            <p>Best distance: {p2BestDistance} steps from goal</p>
            <p className={`status-${player2.status}`}>
              {player2.status === 'finished' ? 'Reached goal!' :
               player2.status === 'stopped' ? (player2.errorMessage || 'Stopped') :
               player2.status === 'error' ? player2.errorMessage : player2.status}
            </p>
          </div>
        </div>

        <button className="btn btn-download-logs" onClick={onDownloadLogs}>
          Download Game Logs
        </button>
      </div>
    </div>
  );
}
