import { useEffect, useRef } from 'react';
import type { Maze, Position } from '../types';

interface MazeCanvasProps {
  maze: Maze | null;
  playerPosition: Position;
  path: Position[];
  playerId: 1 | 2;
}

const CELL_SIZE = 30;
const WALL_WIDTH = 2;

const COLORS = {
  background: '#1a1a2e',
  wall: '#4a4a6a',
  path: '#16213e',
  player1: '#e94560',
  player2: '#0f3460',
  player1Trail: 'rgba(233, 69, 96, 0.3)',
  player2Trail: 'rgba(15, 52, 96, 0.3)',
  start: '#4ade80',
  goal: '#fbbf24',
  goalGlow: 'rgba(251, 191, 36, 0.4)',
};

export function MazeCanvas({ maze, playerPosition, path, playerId }: MazeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = maze.cols * CELL_SIZE;
    const height = maze.rows * CELL_SIZE;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw cells (paths)
    ctx.fillStyle = COLORS.path;
    for (let row = 0; row < maze.rows; row++) {
      for (let col = 0; col < maze.cols; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        ctx.fillRect(x + WALL_WIDTH, y + WALL_WIDTH, CELL_SIZE - WALL_WIDTH * 2, CELL_SIZE - WALL_WIDTH * 2);
      }
    }

    // Draw trail
    const trailColor = playerId === 1 ? COLORS.player1Trail : COLORS.player2Trail;
    ctx.fillStyle = trailColor;
    for (const pos of path) {
      const x = pos.col * CELL_SIZE + CELL_SIZE / 2;
      const y = pos.row * CELL_SIZE + CELL_SIZE / 2;
      ctx.beginPath();
      ctx.arc(x, y, CELL_SIZE / 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw walls
    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = WALL_WIDTH;
    ctx.lineCap = 'round';

    for (let row = 0; row < maze.rows; row++) {
      for (let col = 0; col < maze.cols; col++) {
        const cell = maze.grid[row][col];
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        if (cell.walls.top) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + CELL_SIZE, y);
          ctx.stroke();
        }
        if (cell.walls.right) {
          ctx.beginPath();
          ctx.moveTo(x + CELL_SIZE, y);
          ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
          ctx.stroke();
        }
        if (cell.walls.bottom) {
          ctx.beginPath();
          ctx.moveTo(x, y + CELL_SIZE);
          ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
          ctx.stroke();
        }
        if (cell.walls.left) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + CELL_SIZE);
          ctx.stroke();
        }
      }
    }

    // Draw start position
    const startX = maze.start.col * CELL_SIZE + CELL_SIZE / 2;
    const startY = maze.start.row * CELL_SIZE + CELL_SIZE / 2;
    ctx.fillStyle = COLORS.start;
    ctx.beginPath();
    ctx.arc(startX, startY, CELL_SIZE / 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw goal with glow effect
    const goalX = maze.goal.col * CELL_SIZE + CELL_SIZE / 2;
    const goalY = maze.goal.row * CELL_SIZE + CELL_SIZE / 2;
    
    // Glow
    ctx.fillStyle = COLORS.goalGlow;
    ctx.beginPath();
    ctx.arc(goalX, goalY, CELL_SIZE / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Goal marker
    ctx.fillStyle = COLORS.goal;
    ctx.beginPath();
    ctx.arc(goalX, goalY, CELL_SIZE / 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw player
    const playerColor = playerId === 1 ? COLORS.player1 : COLORS.player2;
    const playerX = playerPosition.col * CELL_SIZE + CELL_SIZE / 2;
    const playerY = playerPosition.row * CELL_SIZE + CELL_SIZE / 2;
    
    // Player glow
    ctx.shadowColor = playerColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = playerColor;
    ctx.beginPath();
    ctx.arc(playerX, playerY, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [maze, playerPosition, path, playerId]);

  if (!maze) {
    return (
      <div className="maze-placeholder">
        <p>Generate a maze to start</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="maze-canvas"
      style={{
        border: `3px solid ${playerId === 1 ? COLORS.player1 : COLORS.player2}`,
        borderRadius: '8px',
      }}
    />
  );
}
