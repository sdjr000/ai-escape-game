'use client';

import { useState, useCallback } from 'react';
import HomePage from '@/components/HomePage';
import GamePage from '@/components/GamePage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GameSave } from '@/engine/types';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState<string | undefined>();
  const [save, setSave, removeSave] = useLocalStorage<GameSave | null>('ai-escape-save', null);

  const handleStart = useCallback((name?: string) => {
    setPlayerName(name);
    setGameStarted(true);
  }, []);

  const handleContinue = useCallback(() => {
    if (save) {
      setPlayerName(save.playerChoices.length > 0 ? '测试者' : undefined);
      setGameStarted(true);
    }
  }, [save]);

  const handleHome = useCallback(() => {
    setGameStarted(false);
    setPlayerName(undefined);
  }, []);

  if (gameStarted) {
    return <GamePage playerName={playerName} onHome={handleHome} />;
  }

  return (
    <HomePage
      onStart={handleStart}
      onContinue={handleContinue}
      hasSave={!!save}
    />
  );
}
