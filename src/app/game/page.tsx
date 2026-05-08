'use client';

import { useState, useCallback } from 'react';
import GamePage from '@/components/GamePage';

export default function GameRoute() {
  const handleHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  return <GamePage onHome={handleHome} />;
}
