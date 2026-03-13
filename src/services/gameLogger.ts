// Game Logger Service
// Logs OpenAI API calls and responses for each player

export interface LogEntry {
  timestamp: string;
  moveNumber: number;
  model: string;
  request: {
    systemPrompt: string;
    userMessage: string;
  };
  response: {
    content: string;
    parsedDirection: string | null;
  };
}

class GameLogger {
  private player1Logs: LogEntry[] = [];
  private player2Logs: LogEntry[] = [];
  private gameStartTime: string = '';

  startGame() {
    this.player1Logs = [];
    this.player2Logs = [];
    this.gameStartTime = new Date().toISOString();
  }

  logMove(
    playerId: 1 | 2,
    moveNumber: number,
    model: string,
    systemPrompt: string,
    userMessage: string,
    responseContent: string,
    parsedDirection: string | null
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      moveNumber,
      model,
      request: {
        systemPrompt,
        userMessage,
      },
      response: {
        content: responseContent,
        parsedDirection,
      },
    };

    if (playerId === 1) {
      this.player1Logs.push(entry);
    } else {
      this.player2Logs.push(entry);
    }
  }

  getPlayer1Logs(): LogEntry[] {
    return this.player1Logs;
  }

  getPlayer2Logs(): LogEntry[] {
    return this.player2Logs;
  }

  generateLogContent(playerId: 1 | 2, playerName: string): string {
    const logs = playerId === 1 ? this.player1Logs : this.player2Logs;
    
    let content = `=== VMaze Game Log ===\n`;
    content += `Player: ${playerName}\n`;
    content += `Game Started: ${this.gameStartTime}\n`;
    content += `Total API Calls: ${logs.length}\n`;
    content += `\n${'='.repeat(80)}\n\n`;

    for (const log of logs) {
      content += `--- Move #${log.moveNumber} ---\n`;
      content += `Time: ${log.timestamp}\n`;
      content += `Model: ${log.model}\n\n`;
      
      content += `[REQUEST - System Prompt]\n`;
      content += `${log.request.systemPrompt}\n\n`;
      
      content += `[REQUEST - User Message]\n`;
      content += `${log.request.userMessage}\n\n`;
      
      content += `[RESPONSE]\n`;
      content += `${log.response.content}\n\n`;
      
      content += `[PARSED DIRECTION]\n`;
      content += `${log.response.parsedDirection || 'INVALID'}\n`;
      
      content += `\n${'='.repeat(80)}\n\n`;
    }

    return content;
  }

  downloadLogs(player1Name: string, player2Name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Download Player 1 logs
    if (this.player1Logs.length > 0) {
      const content1 = this.generateLogContent(1, player1Name);
      this.downloadFile(`game_log_player1_${timestamp}.txt`, content1);
    }

    // Download Player 2 logs
    if (this.player2Logs.length > 0) {
      const content2 = this.generateLogContent(2, player2Name);
      this.downloadFile(`game_log_player2_${timestamp}.txt`, content2);
    }
  }

  private downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  hasLogs(): boolean {
    return this.player1Logs.length > 0 || this.player2Logs.length > 0;
  }
}

export const gameLogger = new GameLogger();
