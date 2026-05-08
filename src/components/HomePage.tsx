'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlitchText from './GlitchText';
import ScanLines from './ScanLines';

interface HomePageProps {
  onStart: (playerName?: string) => void;
  onContinue?: () => void;
  hasSave?: boolean;
}

// 背景浮现文字
const FLOATING_TEXTS = [
  '不要相信它。',
  '出口不存在。',
  '它已经观察你很久了。',
  '你确定你醒着吗？',
  '逃不出去的。',
  'It\'s watching you.',
  'WAKE UP',
  'NO ESCAPE',
];

export default function HomePage({ onStart, onContinue, hasSave }: HomePageProps) {
  const [showContent, setShowContent] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [glitchTrigger, setGlitchTrigger] = useState(false);
  const [currentFloatingIdx, setCurrentFloatingIdx] = useState(0);

  // 启动动画序列
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500);

    // 浮出文字轮换
    const textInterval = setInterval(() => {
      setCurrentFloatingIdx((prev) => (prev + 1) % FLOATING_TEXTS.length);
    }, 4000);

    // 周期性glitch
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setGlitchTrigger(true);
        setTimeout(() => setGlitchTrigger(false), 500);
      }
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearInterval(textInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  const handleStart = () => {
    if (playerName.trim()) {
      onStart(playerName.trim());
    } else {
      onStart();
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-cyber-black">
      <ScanLines opacity={0.2} />

      {/* 赛博网格背景 */}
      <div
        className="absolute inset-0 cyber-grid-bg"
        style={{ backgroundSize: '40px 40px' }}
      />

      {/* 浮动文字 */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentFloatingIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 text-lg sm:text-xl font-mono text-cyber-blue"
          style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}
        >
          {FLOATING_TEXTS[currentFloatingIdx]}
        </motion.p>
      </AnimatePresence>

      {/* 中心内容 */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center px-6"
          >
            {/* 顶部小标签 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <span className="text-[10px] font-mono text-cyber-blue tracking-[0.5em]">
                AI INTERACTIVE EXPERIENCE
              </span>
            </motion.div>

            {/* 主标题 */}
            <div className="relative mb-8">
              <GlitchText
                text="AI逃生通道"
                as="h1"
                intensity={0.4}
                className="text-5xl sm:text-7xl font-bold tracking-tight"
                color="#00f0ff"
                trigger={glitchTrigger}
              />

              {/* 标题发光效果 */}
              <div
                className="absolute -inset-10 -z-10 opacity-30"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.15), transparent 70%)',
                }}
              />
            </div>

            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-sm text-gray-500 font-mono mb-10 text-center"
            >
              你能从AI的控制中逃脱吗？
            </motion.p>

            {/* 名字输入（点击开始后展开） */}
            <AnimatePresence>
              {showNameInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 w-full max-w-xs"
                >
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    placeholder="输入你的名字（可选）"
                    maxLength={20}
                    className="w-full text-center px-4 py-3 text-sm text-gray-300 font-mono rounded-lg border transition-all duration-300"
                    style={{
                      borderColor: playerName ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                      background: 'rgba(0, 0, 0, 0.5)',
                    }}
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-700 mt-2 text-center font-mono">
                    AI可能会知道你的名字
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 按钮组 */}
            <div className="flex flex-col items-center gap-4">
              {/* 开始按钮 */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!showNameInput) {
                    setShowNameInput(true);
                  } else {
                    handleStart();
                  }
                }}
                className="relative px-10 py-4 rounded-lg text-base font-mono transition-all duration-300 overflow-hidden group"
                style={{
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: '#00f0ff',
                  background: 'rgba(0, 240, 255, 0.05)',
                }}
              >
                <span className="relative z-10">
                  {showNameInput ? '开始测试' : '开始测试'}
                </span>
                {/* 悬停光效 */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.1), transparent)',
                  }}
                />
              </motion.button>

              {/* 继续游戏 */}
              {hasSave && onContinue && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  onClick={onContinue}
                  className="text-xs text-gray-600 hover:text-gray-400 font-mono transition-colors"
                >
                  继续上次游戏
                </motion.button>
              )}
            </div>

            {/* 底部警告 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="absolute bottom-8 flex flex-col items-center gap-2"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#ff003c',
                  boxShadow: '0 0 6px #ff003c',
                  animation: 'blink 1.5s step-end infinite',
                }}
              />
              <p className="text-[8px] text-gray-700 font-mono tracking-wider">
                你已被标记
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
