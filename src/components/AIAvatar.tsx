'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AIState, AIStateLabels } from '@/engine/types';
import { AI_AVATAR_STATES } from '@/data/dialogues';

interface AIAvatarProps {
  state: AIState;
  isTyping: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AIAvatar({ state, isTyping, size = 'md' }: AIAvatarProps) {
  const avatarConfig = AI_AVATAR_STATES[state] || AI_AVATAR_STATES.calm;
  const [glitch, setGlitch] = useState(false);
  const [pulse, setPulse] = useState(false);

  // 周期性glitch效果
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 打字时脉冲效果
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setPulse((p) => !p);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setPulse(false);
    }
  }, [isTyping]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const isDangerous = state === AIState.Angry || state === AIState.OutOfControl;

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={`relative flex items-center justify-center rounded-full ${sizeClasses[size]}`}
        animate={{
          scale: pulse ? 1.1 : 1,
          rotate: glitch ? [0, -5, 3, -2, 0] : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{
          background: `radial-gradient(circle, ${avatarConfig.color}22, transparent)`,
          border: `1px solid ${avatarConfig.color}44`,
          boxShadow: glitch
            ? `0 0 15px ${avatarConfig.color}, 0 0 30px ${avatarConfig.color}66`
            : `0 0 10px ${avatarConfig.color}44`,
        }}
      >
        <span
          className="font-bold"
          style={{ color: avatarConfig.color, textShadow: `0 0 8px ${avatarConfig.color}` }}
        >
          {avatarConfig.symbol}
        </span>

        {/* 脉冲光环 */}
        {isDangerous && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 10px ${avatarConfig.color}66`,
                `0 0 25px ${avatarConfig.color}88`,
                `0 0 10px ${avatarConfig.color}66`,
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* AI名字/状态 */}
      <span
        className="text-[10px] font-mono"
        style={{ color: avatarConfig.color, opacity: 0.7 }}
      >
        {isTyping ? '正在思考...' : 'AI-核心'}
      </span>
    </div>
  );
}
