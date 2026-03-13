import OpenAI from 'openai';
import type { Maze, Position, Direction, MoveRecord, AIModel } from '../types';
import { getWallsInfo } from '../utils/mazeAlgorithms';
import { gameLogger } from './gameLogger';

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export function isOpenAIInitialized(): boolean {
  return openaiClient !== null;
}

// Calculate relative directions based on current facing direction
function getRelativeDirections(facing: Direction): { forward: Direction; right: Direction; back: Direction; left: Direction } {
  const rotations: Record<Direction, { forward: Direction; right: Direction; back: Direction; left: Direction }> = {
    UP:    { forward: 'UP',    right: 'RIGHT', back: 'DOWN',  left: 'LEFT' },
    DOWN:  { forward: 'DOWN',  right: 'LEFT',  back: 'UP',    left: 'RIGHT' },
    LEFT:  { forward: 'LEFT',  right: 'UP',    back: 'RIGHT', left: 'DOWN' },
    RIGHT: { forward: 'RIGHT', right: 'DOWN',  back: 'LEFT',  left: 'UP' },
  };
  return rotations[facing];
}

// System prompt with clear rules
export const DEFAULT_SYSTEM_PROMPT = `You are a bot navigating a maze. Your task is to reach the goal position.

RESPONSE FORMAT:
- You MUST respond with exactly ONE word: UP, DOWN, LEFT, or RIGHT
- Do not include any explanation or additional text

RULES:
1. You can only move in directions marked as OPEN
2. BLOCKED directions have walls - you cannot pass through them
3. Coordinates use (row, column) format where:
   - Row 0 is the top, rows increase going DOWN
   - Column 0 is the left, columns increase going RIGHT
4. UP decreases row, DOWN increases row
5. LEFT decreases column, RIGHT increases column

Use the player's navigation strategy to decide your move.`;

export async function getNextMove(
  maze: Maze,
  currentPosition: Position,
  userPrompt: string,
  moveHistory: MoveRecord[],
  model: AIModel = 'gpt-5.2',
  playerId: 1 | 2 = 1,
  moveNumber: number = 0
): Promise<Direction> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }

  const wallsInfo = getWallsInfo(maze, currentPosition);
  
  // Build structured history data
  const visited = moveHistory.map(r => [r.position.row, r.position.col]);
  
  // Count revisited positions
  const visitCounts: Record<string, number> = {};
  moveHistory.forEach(r => {
    const key = `${r.position.row},${r.position.col}`;
    visitCounts[key] = (visitCounts[key] || 0) + 1;
  });
  const revisited = Object.fromEntries(
    Object.entries(visitCounts).filter(([, count]) => count > 1)
  );
  
  // Get last directions taken
  const lastDirections = moveHistory
    .slice(-5)
    .map(r => r.direction)
    .filter(d => d !== null);
  
  const historyJson = JSON.stringify({
    visited,
    revisited,
    lastDirections,
    totalMoves: Math.max(0, moveHistory.length - 1)  // Exclude initial position
  });
  
  // Calculate distance to goal
  const rowDiff = maze.goal.row - currentPosition.row;
  const colDiff = maze.goal.col - currentPosition.col;
  const distanceToGoal = Math.abs(rowDiff) + Math.abs(colDiff);

  // Get previous position and current facing direction for orientation context
  const previousPosition = moveHistory.length > 1
    ? moveHistory[moveHistory.length - 2].position
    : null;

  const currentFacing = moveHistory.length > 1
    ? moveHistory[moveHistory.length - 2].direction
    : null;

  const relativeDirections = currentFacing ? getRelativeDirections(currentFacing) : null;

  // Build orientation section
  const previousPosStr = previousPosition
    ? `(${previousPosition.row}, ${previousPosition.col})`
    : 'None (first move)';

  const facingSection = currentFacing && relativeDirections
    ? `## CURRENT FACING: ${currentFacing}
   The direction you moved to reach current position. This is your "forward" direction.

## RELATIVE DIRECTIONS (based on facing ${currentFacing}):
   FORWARD = ${relativeDirections.forward}, RIGHT = ${relativeDirections.right}, BACK = ${relativeDirections.back}, LEFT = ${relativeDirections.left}
   Use these to interpret instructions like "turn right" or "go straight".
`
    : `## CURRENT FACING: None (first move)
   No facing direction yet - this is your first move.
`;

  const userMessage = `# INFORMATION PROVIDED TO YOU #

## CURRENT POSITION: (${currentPosition.row}, ${currentPosition.col})
   This is where you are right now in the maze.

## PREVIOUS POSITION: ${previousPosStr}
   Where you were before your last move.

${facingSection}
## GOAL POSITION: (${maze.goal.row}, ${maze.goal.col})
   This is where you need to reach.

## DISTANCE TO GOAL: ${distanceToGoal} steps
   Manhattan distance - the minimum steps needed if there were no walls.

## AVAILABLE MOVES FROM YOUR POSITION:
${wallsInfo}
   OPEN = you can move there, BLOCKED = wall, you cannot pass.

## MOVEMENT HISTORY (JSON format):
${historyJson}
   - "visited": array of all positions [row, col] in order
   - "revisited": positions visited more than once with count
   - "lastDirections": your last 5 moves
   - "totalMoves": total moves made

${userPrompt}

=== YOUR RESPONSE ===
Based on the information above, choose your next move.
Respond with only ONE word: UP, DOWN, LEFT, or RIGHT`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_completion_tokens: 20,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim().toUpperCase() || '';
    
    const validDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    
    let foundDirection: Direction | null = null;
    for (const dir of validDirections) {
      if (content.includes(dir)) {
        foundDirection = dir;
        break;
      }
    }

    // Log the API call with full request/response
    gameLogger.logMove(
      playerId,
      moveNumber,
      model,
      DEFAULT_SYSTEM_PROMPT,
      userMessage,
      content,
      foundDirection
    );
    
    if (foundDirection) {
      return foundDirection;
    }
    
    throw new Error(`Invalid response from AI: ${content}`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error calling OpenAI API');
  }
}

// Calculate Manhattan distance from position to goal
export function calculateDistance(position: Position, goal: Position): number {
  return Math.abs(position.row - goal.row) + Math.abs(position.col - goal.col);
}

// Available models for the UI
export const AVAILABLE_MODELS: { id: AIModel; name: string; description: string }[] = [
  { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Latest model (default)' },
  { id: 'gpt-5', name: 'GPT-5', description: 'Next generation' },
  { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Stable model' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Fast and capable' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, lower cost' },
];
