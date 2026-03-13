import { useState, useEffect } from 'react';

interface GlobalTimerProps {
  startTime: number | null;
  endTime: number | null;
  isRunning: boolean;
}

export function GlobalTimer({ startTime, endTime, isRunning }: GlobalTimerProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const getElapsedTime = () => {
    if (!startTime) return '0.0';
    const end = endTime || currentTime;
    return ((end - startTime) / 1000).toFixed(1);
  };

  return (
    <div className={`global-timer ${isRunning ? 'running' : ''}`}>
      <span className="timer-label">Time</span>
      <span className="timer-value">{getElapsedTime()}s</span>
    </div>
  );
}
