import { useState } from 'react';

type TabType = 'goal' | 'provide' | 'ai-context' | 'winning';

export function ContextInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('goal');

  return (
    <div className="context-info-container">
      <button 
        className="context-info-btn instructions-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="How to Play"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <path d="M12 17h.01"></path>
        </svg>
        How to Play
      </button>

      {isOpen && (
        <>
          <div className="context-overlay" onClick={() => setIsOpen(false)} />
          <div className="context-modal instructions-modal">
            <div className="context-header">
              <h3>VMaze - Game Instructions</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className="instructions-tabs">
              <button 
                className={`tab-btn ${activeTab === 'goal' ? 'active' : ''}`}
                onClick={() => setActiveTab('goal')}
              >
                Goal
              </button>
              <button 
                className={`tab-btn ${activeTab === 'provide' ? 'active' : ''}`}
                onClick={() => setActiveTab('provide')}
              >
                What You Provide
              </button>
              <button 
                className={`tab-btn ${activeTab === 'ai-context' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-context')}
              >
                AI Context
              </button>
              <button 
                className={`tab-btn ${activeTab === 'winning' ? 'active' : ''}`}
                onClick={() => setActiveTab('winning')}
              >
                Who Wins?
              </button>
            </div>

            <div className="context-content">
              {activeTab === 'goal' && (
                <div className="tab-content">
                  <div className="goal-section">
                    <div className="goal-icon">🎯</div>
                    <h4>Your Mission</h4>
                    <p>
                      Guide an AI through a maze from <strong>START</strong> to <strong>GOAL</strong> 
                      using only a text prompt as your navigation strategy.
                    </p>
                  </div>

                  <div className="key-points">
                    <div className="key-point">
                      <span className="point-icon">🧩</span>
                      <div>
                        <strong>The Challenge</strong>
                        <p>The AI cannot see the maze! It only knows what's immediately around it.</p>
                      </div>
                    </div>
                    <div className="key-point">
                      <span className="point-icon">🤖</span>
                      <div>
                        <strong>Your Role</strong>
                        <p>Write a strategy prompt that helps the AI make smart navigation decisions.</p>
                      </div>
                    </div>
                    <div className="key-point">
                      <span className="point-icon">⚔️</span>
                      <div>
                        <strong>Competition</strong>
                        <p>Two players compete on the same maze. Best strategy wins!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'provide' && (
                <div className="tab-content">
                  <h4>What You Need to Provide</h4>
                  
                  <div className="provide-item">
                    <div className="provide-number">1</div>
                    <div className="provide-content">
                      <strong>Your Name</strong>
                      <p>Identify yourself in the competition (optional but recommended).</p>
                    </div>
                  </div>

                  <div className="provide-item highlight">
                    <div className="provide-number">2</div>
                    <div className="provide-content">
                      <strong>Navigation Strategy (Prompt)</strong>
                      <p>
                        This is the key! Write instructions that tell the AI how to navigate.
                        Your prompt is sent to the AI on <em>every single move</em>.
                      </p>
                      <div className="example-box">
                        <span className="example-label">Example prompt:</span>
                        <code>
                          "Move towards the goal. If blocked, try alternative directions. 
                          Avoid revisiting the same positions. Prefer directions that 
                          decrease distance to goal."
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="tip-box">
                    <strong>💡 Tip:</strong> Think about edge cases! What should the AI do when 
                    stuck in a corner? How should it handle dead ends? Good prompts anticipate these scenarios.
                  </div>
                </div>
              )}

              {activeTab === 'ai-context' && (
                <div className="tab-content">
                  <p className="context-note">
                    The AI does <strong>NOT</strong> see the maze layout. Each turn, it receives only:
                  </p>
                  
                  <div className="context-item">
                    <span className="context-label">CURRENT POSITION</span>
                    <span className="context-desc">Coordinates (row, col) - where the AI is now</span>
                  </div>
                  
                  <div className="context-item">
                    <span className="context-label">GOAL POSITION</span>
                    <span className="context-desc">Coordinates (row, col) - where it needs to go</span>
                  </div>
                  
                  <div className="context-item">
                    <span className="context-label">DISTANCE TO GOAL</span>
                    <span className="context-desc">Manhattan distance (minimum steps if no walls existed)</span>
                  </div>
                  
                  <div className="context-item">
                    <span className="context-label">AVAILABLE MOVES</span>
                    <span className="context-desc">Each direction marked as OPEN or BLOCKED</span>
                  </div>
                  
                  <div className="context-item">
                    <span className="context-label">MOVEMENT HISTORY</span>
                    <span className="context-desc">
                      <code>visited</code>: all positions in order<br/>
                      <code>revisited</code>: positions visited more than once<br/>
                      <code>lastDirections</code>: last 5 moves taken<br/>
                      <code>totalMoves</code>: total move count
                    </span>
                  </div>
                  
                  <div className="context-item highlight">
                    <span className="context-label">YOUR STRATEGY</span>
                    <span className="context-desc">The navigation prompt you wrote!</span>
                  </div>

                  <div className="coordinate-info">
                    <strong>📐 Coordinate System:</strong>
                    <ul>
                      <li>Row 0 is at the <strong>top</strong>, rows increase going DOWN</li>
                      <li>Column 0 is at the <strong>left</strong>, columns increase going RIGHT</li>
                      <li>UP = row decreases, DOWN = row increases</li>
                      <li>LEFT = col decreases, RIGHT = col increases</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'winning' && (
                <div className="tab-content">
                  <h4>How the Winner is Determined</h4>
                  
                  <div className="winning-rules">
                    <div className="rule priority-1">
                      <div className="rule-header">
                        <span className="priority">Priority 1</span>
                        <strong>Reaching the Goal</strong>
                      </div>
                      <p>If only one player's AI reaches the goal, that player wins.</p>
                    </div>

                    <div className="rule priority-2">
                      <div className="rule-header">
                        <span className="priority">Priority 2</span>
                        <strong>Fewer Moves (if both finish)</strong>
                      </div>
                      <p>If both reach the goal, the one who did it in fewer moves wins.</p>
                    </div>

                    <div className="rule priority-3">
                      <div className="rule-header">
                        <span className="priority">Priority 3</span>
                        <strong>Closest Distance (if neither finishes)</strong>
                      </div>
                      <p>
                        If neither reaches the goal (hit max moves), the winner is whoever 
                        got <em>closest</em> to the goal at any point during their run.
                      </p>
                    </div>

                    <div className="rule priority-4">
                      <div className="rule-header">
                        <span className="priority">Priority 4</span>
                        <strong>Efficiency Tiebreaker</strong>
                      </div>
                      <p>If still tied, whoever used fewer total moves wins.</p>
                    </div>
                  </div>

                  <div className="tie-info">
                    <strong>🤝 Tie:</strong> If everything is equal, it's declared a tie!
                  </div>

                  <div className="max-moves-info">
                    <strong>⚠️ Max Moves:</strong> Each player has a maximum number of moves 
                    (configurable in settings). If exceeded, the run ends without reaching the goal.
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
