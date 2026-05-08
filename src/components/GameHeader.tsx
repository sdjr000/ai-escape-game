'use client';

import { motion } from 'framer-motion';
import { AIState, AIStateLabels } from '@/engine/types';
import { DangerSystem } from '@/engine/DangerSystem';
import DangerMeter from './DangerMeter';
import AIAvatar from './AIAvatar';

interface GameHeaderProps {
  aiState: AIState;
  dangerLevel: number;
  isAITyping: boolean;
  onMenuClick?: () => void;
  onRestart?: () => void;
}

export default function GameHeader({
  aiState,
  dangerLevel,
  isAITyping,
  onMenuClick,
  onRestart,
}: GameHeaderProps) {
  const stateColors: Record<AIState, string> = {
    [AIState.Calm]: '#00f0ff',
    [AIState.Suspicious]: '#ffcc00',
    [AIState.Angry]: '#ff003c',
    [AIState.OutOfControl]: '#ff0000',
    [AIState.FakingNormal]: '#00ff41',
  };

  const currentColor = stateColors[aiState] || '#00f0ff';

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b z-30"
      style={{
        background: 'rgba(10, 10, 10, 0.95)',
        borderColor: `${currentColor}22`,
      }}
    >
      {/* 左侧：AI 信息和状态 */}
      <div className="flex items-center gap-3">
        <AIAvatar state={aiState} isTyping={isAITyping} size="sm" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-300">
              AI-核心
            </span>
            <motion.span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              animate={{
                backgroundColor: `${currentColor}15`,
                borderColor: `${currentColor}30`,
                color: currentColor,
              }}
              style={{
                border: `1px solid ${currentColor}30`,
              }}
            >
              {AIStateLabels[aiState]}
            </motion.span>
          </div>

          {/* 危险值进度条 */}
          <div className="mt-1 w-40 sm:w-52">
            <DangerMeter level={dangerLevel} />
          </div>
        </div>
      </div>

      {/* 右侧：按钮 */}
      <div className="flex items-center gap-2">
        {/* "被监视"红点 */}
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#ff003c',
              boxShadow: '0 0 6px #ff003c',
              animation: 'blink 1.5s step-end infinite',
            }}
          />
          <span className="text-[8px] text-gray-600 hidden sm:inline">REC</span>
        </div>

        {onRestart && (
          <button
            onClick={onRestart}
            className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors font-mono"
          >
            重启
          </button>
        )}

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors font-mono"
          >
            菜单
          </button>
        )}
      </div>
    </div>
  );
}
