import { useState } from 'react';
import type { GameConfig } from '../types';
import { AVAILABLE_MODELS } from '../services/openai';

interface SettingsModalProps {
  config: GameConfig;
  onConfigChange: (config: Partial<GameConfig>) => void;
  isPlaying: boolean;
}

export function SettingsModal({ config, onConfigChange, isPlaying }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="settings-container">
      <button 
        className="settings-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="settings-overlay" onClick={() => setIsOpen(false)} />
          <div className="settings-modal">
            <div className="settings-header">
              <h3>Settings</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className="settings-content">
              <div className="setting-group">
                <label htmlFor="api-key">OpenAI API Key:</label>
                <div className="api-key-input-wrapper">
                  <input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => onConfigChange({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    disabled={isPlaying}
                  />
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowApiKey(!showApiKey)}
                    title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                {config.apiKey && (
                  <span className="api-status">Connected</span>
                )}
              </div>

              <div className="setting-group">
                <label htmlFor="model">AI Model:</label>
                <select
                  id="model"
                  value={config.model}
                  onChange={(e) => onConfigChange({ model: e.target.value as any })}
                  disabled={isPlaying}
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label htmlFor="max-moves">Max Moves (limit):</label>
                <input
                  id="max-moves"
                  type="number"
                  min="50"
                  max="1000"
                  step="50"
                  value={config.maxMoves}
                  onChange={(e) => onConfigChange({ maxMoves: Number(e.target.value) })}
                  disabled={isPlaying}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
