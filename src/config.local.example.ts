// Copy this file to config.local.ts
// config.local.ts is excluded from git
// API key is entered by user in Settings UI and saved to localStorage

export const DEFAULT_API_KEY: string = '';

// Debug prompts: used when ?debug=true in URL
export const DEBUG_PROMPT_1 = `Always turn right. If you can't turn right, continue straight.
If, after turning right you can't continue straight, turn right again.`;

export const DEBUG_PROMPT_2 = `Move towards the goal by choosing the direction that minimizes distance.
Prioritize: DOWN, RIGHT, UP, LEFT when distances are equal.
Never revisit a position unless all other moves are blocked.
If stuck in a loop, try the least recently used direction.`;
