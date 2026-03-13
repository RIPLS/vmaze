# VMaze - AI Prompt Battle

A competitive maze navigation game where two players write prompts to guide AI bots through a maze. The best navigation strategy wins!

## How It Works

1. **Generate a maze** - A random maze is created with a start and goal position
2. **Write prompts** - Each player writes a navigation strategy prompt
3. **AI navigates** - Both AI bots navigate the maze simultaneously using the prompts
4. **Winner declared** - First to reach the goal wins, or closest distance if neither finishes

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173, click the gear icon, and enter your OpenAI API key.

## Debug Mode

Add `?debug=true` to the URL to auto-fill sample prompts for testing:

```
http://localhost:5173/?debug=true
```

## Game Rules

### Winning Conditions (in order of priority)

1. **Reach the goal first** - If only one player reaches the goal, they win
2. **Fewer moves** - If both reach the goal, fewer moves wins
3. **Closest distance** - If neither finishes, closest to goal wins
4. **Efficiency tiebreaker** - If tied on distance, fewer moves wins
5. **Tie** - If everything is equal, it's a tie

### AI Context

Each turn, the AI receives:
- Current position and goal position
- Previous position and current facing direction
- Available moves (OPEN/BLOCKED)
- Relative directions (FORWARD, RIGHT, BACK, LEFT based on facing)
- Movement history (visited positions, revisited counts, last moves)
- Your navigation prompt

### Player Status

- `waiting` - Ready to start
- `playing` - Currently navigating
- `finished` - Reached the goal
- `stopped` - Stopped without reaching goal (opponent won or max moves reached)
- `error` - API or other error occurred

## Project Structure

```
src/
  components/     # React UI components
  hooks/          # Game engine logic (useGameEngine)
  services/       # OpenAI API integration
  types/          # TypeScript interfaces
  utils/          # Maze generation algorithms
```

## Tech Stack

- React 19 + TypeScript
- Vite
- OpenAI API (GPT models)

## License

MIT
