# VMaze - Game Instructions

## 🎯 Goal

**Your Mission:** Guide an AI through a maze from **START** to **GOAL** using only a text prompt as your navigation strategy.

### The Challenge
- The AI **cannot see** the maze! It only knows what's immediately around it.

### Your Role
- Write a strategy prompt that helps the AI make smart navigation decisions.

### Competition
- Two players compete on the same maze. Best strategy wins!

---

## 📝 What You Need to Provide

### 1. Your Name
Identify yourself in the competition (optional but recommended).

### 2. Navigation Strategy (Prompt) ⭐
This is the key! Write instructions that tell the AI how to navigate. Your prompt is sent to the AI on **every single move**.

**Example prompt:**
```
Move towards the goal. If blocked, try alternative directions. 
Avoid revisiting the same positions. Prefer directions that 
decrease distance to goal.
```

> **💡 Tip:** Think about edge cases! What should the AI do when stuck in a corner? How should it handle dead ends? Good prompts anticipate these scenarios.

---

## 🤖 What the AI Receives (Context)

The AI does **NOT** see the maze layout. Each turn, it receives only:

| Information | Description |
|-------------|-------------|
| **CURRENT POSITION** | Coordinates (row, col) - where the AI is now |
| **GOAL POSITION** | Coordinates (row, col) - where it needs to go |
| **DISTANCE TO GOAL** | Manhattan distance (minimum steps if no walls existed) |
| **AVAILABLE MOVES** | Each direction marked as OPEN or BLOCKED |
| **MOVEMENT HISTORY** | `visited`: all positions in order |
| | `revisited`: positions visited more than once |
| | `lastDirections`: last 5 moves taken |
| | `totalMoves`: total move count |
| **YOUR STRATEGY** | The navigation prompt you wrote! |

### 📐 Coordinate System
- Row 0 is at the **top**, rows increase going DOWN
- Column 0 is at the **left**, columns increase going RIGHT
- UP = row decreases, DOWN = row increases
- LEFT = col decreases, RIGHT = col increases

---

## 🏆 Who Wins?

### Priority 1: Reaching the Goal
If only one player's AI reaches the goal, **that player wins**.

### Priority 2: Fewer Moves (if both finish)
If both reach the goal, the one who did it in **fewer moves** wins.

### Priority 3: Closest Distance (if neither finishes)
If neither reaches the goal (hit max moves), the winner is whoever got **closest** to the goal at any point during their run.

### Priority 4: Efficiency Tiebreaker
If still tied, whoever used **fewer total moves** wins.

### 🤝 Tie
If everything is equal, it's declared a tie!

> **⚠️ Max Moves:** Each player has a maximum number of moves (configurable in settings). If exceeded, the run ends without reaching the goal.

---

## 🎮 Quick Start

1. **Generate a maze** - Click "Generate Maze" to create a new maze
2. **Enter your name** - Optional, but helps identify players
3. **Write your strategy** - The most important part!
4. **Start the game** - Watch both AIs compete in real-time
5. **Analyze results** - See who won and why

---

## 💡 Strategy Tips

1. **Be specific** - Tell the AI exactly what to prioritize
2. **Handle loops** - Include instructions for avoiding revisiting positions
3. **Consider dead ends** - What should the AI do when stuck?
4. **Use the history** - Reference the movement history in your strategy
5. **Balance exploration vs. goal-seeking** - Sometimes going away from the goal is necessary

**Good luck! May the best prompt win! 🚀**
