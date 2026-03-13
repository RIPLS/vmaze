# VMaze - AI Prompt Battle

A competitive maze navigation game where two players write prompts to guide AI bots through a maze. The best navigation strategy wins!

## How It Works

1. **Generate a maze** - A random maze is created with a start and goal position
2. **Write prompts** - Each player writes a navigation strategy prompt
3. **AI navigates** - Both AI bots navigate the maze simultaneously using the prompts
4. **Winner declared** - First to reach the goal wins, or closest distance if neither finishes

## Quick Start

```bash
# Install dependencies
npm install

# Copy config template and add your OpenAI API key
cp src/config.local.example.ts src/config.local.ts
# Edit src/config.local.ts and add your API key

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## Configuration

### API Key Setup

The OpenAI API key can be configured in two ways:

1. **Via Settings UI** - Click the gear icon and enter your API key. It will be saved to localStorage and persist across sessions.

2. **Via config file** - Edit `src/config.local.ts`:
   ```typescript
   export const DEFAULT_API_KEY = 'sk-your-api-key-here';
   ```

### Debug Mode

Add `?debug=true` to the URL to auto-fill sample prompts for testing:

```
http://localhost:5173/?debug=true
```

Debug prompts can be customized in `src/config.local.ts`:
```typescript
export const DEBUG_PROMPT_1 = `Your first test prompt...`;
export const DEBUG_PROMPT_2 = `Your second test prompt...`;
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
  config.local.ts # Local configuration (git-ignored)
```

## Tech Stack

- React 19 + TypeScript
- Vite
- OpenAI API (GPT models)

## License

MIT
