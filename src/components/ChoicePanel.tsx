'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Choice } from '@/engine/types';

interface ChoicePanelProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
  dangerLevel?: number;
}

export default function ChoicePanel({
  choices,
  onSelect,
  disabled = false,
  dangerLevel = 0,
}: ChoicePanelProps) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="space-y-2 py-3">
      <AnimatePresence mode="wait">
        {choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
            onClick={() => !disabled && onSelect(choice.id)}
            disabled={disabled}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
              disabled
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer hover:brightness-150'
            }`}
            style={{
              background: choice.isTrap
                ? 'rgba(255, 0, 60, 0.05)'
                : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${
                choice.isTrap
                  ? 'rgba(255, 0, 60, 0.2)'
                  : 'rgba(255, 255, 255, 0.08)'
              }`,
              boxShadow: choice.isTrap
                ? '0 0 5px rgba(255, 0, 60, 0.05)'
                : 'none',
            }}
          >
            <div className="flex items-center gap-3">
              {/* 序号 */}
              <span
                className="text-xs font-mono flex-shrink-0 w-5 h-5 flex items-center justify-center rounded"
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  color: '#00f0ff',
                }}
              >
                {index + 1}
              </span>

              {/* 文本 */}
              <span
                className={`text-sm leading-relaxed ${
                  choice.isTrap ? 'text-red-400/80' : 'text-gray-300'
                }`}
              >
                {choice.text}
              </span>

              {/* 危险标记 */}
              {choice.isTrap && (
                <span className="text-[10px] text-red-500/50 ml-auto flex-shrink-0">
                  ⚠
                </span>
              )}
            </div>

            {/* 危险值变化提示 */}
            {choice.dangerDelta !== undefined && choice.dangerDelta !== 0 && (
              <div className="mt-1 ml-8">
                <span
                  className={`text-[10px] font-mono ${
                    choice.dangerDelta > 0 ? 'text-red-500/50' : 'text-green-500/50'
                  }`}
                >
                  {choice.dangerDelta > 0 ? `+${choice.dangerDelta}` : choice.dangerDelta} 危险值
                </span>
              </div>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
