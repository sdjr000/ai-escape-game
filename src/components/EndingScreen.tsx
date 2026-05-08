'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ending, EndingType } from '@/engine/types';
import { endings } from '@/data/endings';

interface EndingScreenProps {
  endingType: EndingType | null;
  onRestart: () => void;
  onHome: () => void;
}

export default function EndingScreen({
  endingType,
  onRestart,
  onHome,
}: EndingScreenProps) {
  const [ending, setEnding] = useState<Ending | null>(null);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    if (!endingType) return;
    const found = endings.find((e) => e.type === endingType);
    setEnding(found || null);
    setShowEpilogue(false);
    setShowButtons(false);
    setDisplayText('');
    setIsRevealing(true);

    // 延迟显示epilogue
    const t1 = setTimeout(() => setShowEpilogue(true), 1500);
    const t2 = setTimeout(() => setShowButtons(true), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [endingType]);

  // 打字机效果
  useEffect(() => {
    if (!showEpilogue || !ending) return;

    setIsRevealing(true);
    let index = 0;
    const text = ending.epilogue;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsRevealing(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [showEpilogue, ending]);

  if (!ending) return null;

  const getEndingColor = (type: EndingType): string => {
    switch (type) {
      case EndingType.TrueEscape: return '#00f0ff';
      case EndingType.FakeEscape: return '#ffcc00';
      case EndingType.Assimilated: return '#6b2fa0';
      case EndingType.InfiniteLoop: return '#ff6600';
      case EndingType.PlayerIsAI: return '#00ff41';
      case EndingType.WorldNotExist: return '#ffffff';
      case EndingType.DangerDeath: return '#ff003c';
      default: return '#ff003c';
    }
  };

  const color = getEndingColor(ending.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
        }}
      >
        <div className="max-w-lg w-full text-center">
          {/* 结局标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p
              className="text-[10px] font-mono mb-2 tracking-[0.3em]"
              style={{ color: `${color}66` }}
            >
              — 游戏终章 —
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{
                color,
                textShadow: `0 0 20px ${color}, 0 0 40px ${color}44`,
              }}
            >
              {ending.title}
            </h1>
            <p className="text-sm text-gray-500 mb-8 font-mono">
              {ending.description}
            </p>
          </motion.div>

          {/* 结局正文 */}
          {showEpilogue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div
                className="text-left text-sm leading-relaxed whitespace-pre-line font-mono p-6 rounded-lg"
                style={{
                  color: '#b0b0b0',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${color}22`,
                }}
              >
                {displayText}
                {isRevealing && (
                  <span className="typing-cursor" style={{ color }} />
                )}
              </div>
            </motion.div>
          )}

          {/* 按钮 */}
          {showButtons && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <button
                onClick={onRestart}
                className="px-6 py-3 rounded-lg text-sm font-mono transition-all duration-300"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: `${color}15`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${color}15`;
                }}
              >
                再次尝试
              </button>
              <button
                onClick={onHome}
                className="px-6 py-3 rounded-lg text-sm font-mono text-gray-500 hover:text-white transition-colors"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                返回首页
              </button>
            </motion.div>
          )}

          {/* 底部提示 */}
          {ending.isTrueEnding && showButtons && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-[10px] text-gray-700 font-mono"
            >
              🏆 你找到了真结局
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
