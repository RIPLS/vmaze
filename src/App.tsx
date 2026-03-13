import { useGameEngine } from './hooks/useGameEngine';
import { PlayerPanel } from './components/PlayerPanel';
import { GameControls } from './components/GameControls';
import { WinnerBanner } from './components/WinnerBanner';
import { SettingsModal } from './components/SettingsModal';
import { ContextInfo } from './components/ContextInfo';
import './App.css';

function App() {
  const {
    gameState,
    config,
    generateNewMaze,
    updatePlayerPrompt,
    updatePlayerName,
    updateConfig,
    startGame,
    stopGame,
    restartGame,
    clearAll,
    downloadLogs,
  } = useGameEngine();

  const isPlaying = gameState.status === 'playing';
  const hasApiKey = config.apiKey.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>VMaze</h1>
          <p className="subtitle">AI Prompt Battle</p>
        </div>
        <div className="header-right">
          <ContextInfo />
          <SettingsModal
            config={config}
            onConfigChange={updateConfig}
            isPlaying={isPlaying}
          />
        </div>
      </header>

      <GameControls
        config={config}
        onConfigChange={updateConfig}
        onGenerateMaze={generateNewMaze}
        onStart={startGame}
        onStop={stopGame}
        onRestart={restartGame}
        onClearAll={clearAll}
        gameStatus={gameState.status}
        hasApiKey={hasApiKey}
        globalStartTime={gameState.globalStartTime}
        globalEndTime={gameState.globalEndTime}
      />

      <WinnerBanner
        winner={gameState.winner}
        player1={gameState.player1}
        player2={gameState.player2}
        visible={gameState.status === 'finished'}
        onDownloadLogs={downloadLogs}
      />

      <main className="battle-arena">
        <PlayerPanel
          player={gameState.player1}
          maze={gameState.maze}
          onPromptChange={(prompt) => updatePlayerPrompt(1, prompt)}
          onNameChange={(name) => updatePlayerName(1, name)}
          isPlaying={isPlaying}
        />

        <div className="vs-separator">
          <span>VS</span>
        </div>

        <PlayerPanel
          player={gameState.player2}
          maze={gameState.maze}
          onPromptChange={(prompt) => updatePlayerPrompt(2, prompt)}
          onNameChange={(name) => updatePlayerName(2, name)}
          isPlaying={isPlaying}
        />
      </main>

      <footer className="app-footer">
        <p>Pit your prompts against each other. May the best navigation strategy win!</p>
      </footer>
    </div>
  );
}

export default App;
