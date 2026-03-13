import type { Cell, Maze, Position } from '../types';

// Create an empty grid with all walls
function createGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      grid[row][col] = {
        row,
        col,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        },
        visited: false,
      };
    }
  }
  
  return grid;
}

// Get unvisited neighbors of a cell
function getUnvisitedNeighbors(grid: Cell[][], cell: Cell): Cell[] {
  const { row, col } = cell;
  const neighbors: Cell[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Top
  if (row > 0 && !grid[row - 1][col].visited) {
    neighbors.push(grid[row - 1][col]);
  }
  // Right
  if (col < cols - 1 && !grid[row][col + 1].visited) {
    neighbors.push(grid[row][col + 1]);
  }
  // Bottom
  if (row < rows - 1 && !grid[row + 1][col].visited) {
    neighbors.push(grid[row + 1][col]);
  }
  // Left
  if (col > 0 && !grid[row][col - 1].visited) {
    neighbors.push(grid[row][col - 1]);
  }
  
  return neighbors;
}

// Remove wall between two adjacent cells
function removeWall(current: Cell, next: Cell): void {
  const rowDiff = next.row - current.row;
  const colDiff = next.col - current.col;
  
  if (rowDiff === -1) {
    // Next is above current
    current.walls.top = false;
    next.walls.bottom = false;
  } else if (rowDiff === 1) {
    // Next is below current
    current.walls.bottom = false;
    next.walls.top = false;
  } else if (colDiff === -1) {
    // Next is to the left of current
    current.walls.left = false;
    next.walls.right = false;
  } else if (colDiff === 1) {
    // Next is to the right of current
    current.walls.right = false;
    next.walls.left = false;
  }
}

// Generate maze using Recursive Backtracking (DFS)
export function generateMaze(rows: number, cols: number): Maze {
  const grid = createGrid(rows, cols);
  const stack: Cell[] = [];
  
  // Start from top-left corner
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(grid, current);
    
    if (neighbors.length > 0) {
      // Pick a random neighbor
      const randomIndex = Math.floor(Math.random() * neighbors.length);
      const next = neighbors[randomIndex];
      
      // Remove wall between current and next
      removeWall(current, next);
      
      // Mark next as visited and push to stack
      next.visited = true;
      stack.push(next);
    } else {
      // Backtrack
      stack.pop();
    }
  }
  
  // Reset visited flags for game use
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid[row][col].visited = false;
    }
  }
  
  const start: Position = { row: 0, col: 0 };
  const goal: Position = { row: rows - 1, col: cols - 1 };
  
  return {
    grid,
    rows,
    cols,
    start,
    goal,
  };
}

// Check if a move is valid (no wall blocking)
export function isValidMove(maze: Maze, from: Position, direction: string): boolean {
  const cell = maze.grid[from.row][from.col];
  
  switch (direction.toUpperCase()) {
    case 'UP':
      return !cell.walls.top && from.row > 0;
    case 'DOWN':
      return !cell.walls.bottom && from.row < maze.rows - 1;
    case 'LEFT':
      return !cell.walls.left && from.col > 0;
    case 'RIGHT':
      return !cell.walls.right && from.col < maze.cols - 1;
    default:
      return false;
  }
}

// Get new position after a move
export function getNewPosition(from: Position, direction: string): Position {
  switch (direction.toUpperCase()) {
    case 'UP':
      return { row: from.row - 1, col: from.col };
    case 'DOWN':
      return { row: from.row + 1, col: from.col };
    case 'LEFT':
      return { row: from.row, col: from.col - 1 };
    case 'RIGHT':
      return { row: from.row, col: from.col + 1 };
    default:
      return from;
  }
}

// Check if position is at goal
export function isAtGoal(position: Position, goal: Position): boolean {
  return position.row === goal.row && position.col === goal.col;
}

// Convert maze to text representation for AI
export function mazeToText(maze: Maze, currentPosition: Position): string {
  const { grid, rows, cols, goal } = maze;
  let text = '';
  
  // Create a visual representation
  for (let row = 0; row < rows; row++) {
    // Top walls
    let topLine = '';
    let midLine = '';
    
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      
      // Top wall
      topLine += '+';
      topLine += cell.walls.top ? '---' : '   ';
      
      // Left wall and cell content
      midLine += cell.walls.left ? '|' : ' ';
      
      // Cell content
      if (row === currentPosition.row && col === currentPosition.col) {
        midLine += ' X '; // Current position
      } else if (row === goal.row && col === goal.col) {
        midLine += ' G '; // Goal
      } else if (row === 0 && col === 0) {
        midLine += ' S '; // Start
      } else {
        midLine += '   ';
      }
    }
    
    // Close the row
    topLine += '+';
    midLine += grid[row][cols - 1].walls.right ? '|' : ' ';
    
    text += topLine + '\n';
    text += midLine + '\n';
  }
  
  // Bottom wall of last row
  let bottomLine = '';
  for (let col = 0; col < cols; col++) {
    bottomLine += '+';
    bottomLine += grid[rows - 1][col].walls.bottom ? '---' : '   ';
  }
  bottomLine += '+';
  text += bottomLine + '\n';
  
  return text;
}

// Get available moves from current position
export function getAvailableMoves(maze: Maze, position: Position): string[] {
  const moves: string[] = [];
  const cell = maze.grid[position.row][position.col];
  
  if (!cell.walls.top && position.row > 0) moves.push('UP');
  if (!cell.walls.bottom && position.row < maze.rows - 1) moves.push('DOWN');
  if (!cell.walls.left && position.col > 0) moves.push('LEFT');
  if (!cell.walls.right && position.col < maze.cols - 1) moves.push('RIGHT');
  
  return moves;
}

// Get walls info for current position (for AI context)
export function getWallsInfo(maze: Maze, position: Position): string {
  const cell = maze.grid[position.row][position.col];
  const walls: string[] = [];
  
  walls.push(`UP: ${cell.walls.top || position.row === 0 ? 'BLOCKED' : 'OPEN'}`);
  walls.push(`DOWN: ${cell.walls.bottom || position.row === maze.rows - 1 ? 'BLOCKED' : 'OPEN'}`);
  walls.push(`LEFT: ${cell.walls.left || position.col === 0 ? 'BLOCKED' : 'OPEN'}`);
  walls.push(`RIGHT: ${cell.walls.right || position.col === maze.cols - 1 ? 'BLOCKED' : 'OPEN'}`);
  
  return walls.join(', ');
}
