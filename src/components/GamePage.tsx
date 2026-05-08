'use client';

import { useEffect, useCallback, useState } from 'react';
import { useGameStore } from '@/hooks/useGameState';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GameSave, EndingType } from '@/engine/types';
import { useWechatShare } from '@/hooks/useWechatShare';
import { endings } from '@/data/endings';
import ChatInterface from './ChatInterface';
import GameHeader from './GameHeader';
import ScanLines from './ScanLines';
import SystemNotification from './SystemNotification';
import EndingScreen from './EndingScreen';

interface GamePageProps {
  playerName?: string;
  onHome: () => void;
}

export default function GamePage({ playerName, onHome }: GamePageProps) {
  const [save, setSave, removeSave] = useLocalStorage<GameSave | null>('ai-escape-save', null);
  const [showNotification, setShowNotification] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  function getEndingTitle(type: EndingType): string {
    return endings.find(e => e.type === type)?.title || '未知结局';
  }

  const store = useGameStore();

  const {
    messages,
    aiState,
    dangerLevel,
    isAITyping,
    showChoices,
    ambientEffect,
    isGameOver,
    endingType,
    currentChoices,
    playCount,
  } = store;

  // 初始化游戏
  useEffect(() => {
    store.startGame(playerName);
  }, []);

  // 自动保存
  useEffect(() => {
    if (!isGameOver && messages.length > 0) {
      const gameSave = store.saveGame();
      setSave(gameSave);
    }
  }, [messages.length, dangerLevel, aiState, currentChoices]);

  // 微信分享（根据游戏状态动态更新分享内容）
  useWechatShare({
    title: isGameOver
      ? `我在"AI逃生通道"中走到了终点`
      : dangerLevel > 50
        ? `危险！我被困在AI控制中，危险值${dangerLevel}%`
        : '我被困在一个AI控制的迷宫里，帮我逃出去',
    desc: isGameOver && endingType
      ? `触发了结局: ${getEndingTitle(endingType)}`
      : '一个高沉浸感的AI文字互动逃生游戏，你能逃出去吗？',
    link: typeof window !== 'undefined' ? window.location.href : '',
  });

  // 危险值触发的假通知
  useEffect(() => {
    if (dangerLevel > 60 && Math.random() < 0.3) {
      setShowNotification(true);
    }
  }, [dangerLevel]);

  // 危险值环境的UI效果
  const glitchIntensity = ambientEffect?.glitchIntensity || 0;
  const isRedAlert = ambientEffect?.redAlert || false;
  const hasStatic = ambientEffect?.staticNoise || false;

  const handleRestart = useCallback(() => {
    setIsRestarting(true);
    setShowNotification(false);
    removeSave();
    setTimeout(() => {
      store.resetGame();
      store.startGame(playerName);
      setIsRestarting(false);
    }, 500);
  }, [playerName]);

  const handleHome = useCallback(() => {
    removeSave();
    store.resetGame();
    onHome();
  }, [onHome]);

  const handleSendMessage = useCallback((text: string) => {
    store.sendMessage(text);
  }, []);

  const handleSelectChoice = useCallback((choiceId: string) => {
    store.selectChoice(choiceId);
  }, []);

  const handleNotificationClose = useCallback(() => {
    setShowNotification(false);
  }, []);

  if (isRestarting) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <p className="text-gray-700 font-mono text-sm animate-pulse">重置中...</p>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full flex flex-col"
      style={{
        background: isRedAlert
          ? 'radial-gradient(ellipse at center, rgba(255, 0, 60, 0.03), #0a0a0a)'
          : '#0a0a0a',
      }}
    >
      {/* 扫描线叠加 */}
      <ScanLines
        opacity={0.2 + glitchIntensity * 0.4}
        isRedAlert={isRedAlert}
        intensity={glitchIntensity}
      />

      {/* 静态噪点 */}
      {hasStatic && (
        <div className="static-noise fixed inset-0 pointer-events-none z-40" />
      )}

      {/* 红色警报边框 */}
      {isRedAlert && (
        <div
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            boxShadow: 'inset 0 0 100px rgba(255, 0, 60, 0.15)',
            animation: 'redPulse 1s ease-in-out infinite',
          }}
        />
      )}

      {/* Glitch闪烁 */}
      {glitchIntensity > 0.4 && (
        <div
          className="fixed inset-0 pointer-events-none z-30 flicker"
          style={{ opacity: 0.03 * glitchIntensity }}
        />
      )}

      {/* 假通知 */}
      <SystemNotification
        trigger={showNotification}
        onClose={handleNotificationClose}
        autoHideDelay={3500}
      />

      {/* 游戏头部 */}
      <GameHeader
        aiState={aiState}
        dangerLevel={dangerLevel}
        isAITyping={isAITyping}
        onRestart={handleRestart}
        onMenuClick={handleHome}
      />

      {/* 聊天界面 */}
      <div className="flex-1 overflow-hidden relative">
        {/* 左上角"被监视"提示 */}
        <div className="absolute top-2 left-4 z-20 flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#ff003c',
              boxShadow: '0 0 6px #ff003c',
              animation: 'blink 1.5s step-end infinite',
            }}
          />
          <span className="text-[8px] text-gray-700 font-mono tracking-wider">
            系统监控中
          </span>
        </div>

        <ChatInterface
          messages={messages}
          choices={currentChoices}
          aiState={aiState}
          isAITyping={isAITyping}
          showChoices={showChoices}
          onSendMessage={handleSendMessage}
          onSelectChoice={handleSelectChoice}
        />
      </div>

      {/* 结局画面 */}
      {isGameOver && endingType && (
        <EndingScreen
          endingType={endingType}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
