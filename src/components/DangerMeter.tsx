'use client';

import { motion } from 'framer-motion';
import { dangerColor } from '@/utils/effects';

interface DangerMeterProps {
  level: number;
  maxLevel?: number;
  label?: string;
}

export default function DangerMeter({
  level,
  maxLevel = 100,
  label = '危险值',
}: DangerMeterProps) {
  const percent = Math.min(100, Math.max(0, (level / maxLevel) * 100));
  const color = dangerColor(level);

  const getLevelLabel = (): string => {
    if (level === 0) return '安全';
    if (level < 20) return '低危';
    if (level < 40) return '注意';
    if (level < 60) return '警告';
    if (level < 80) return '高危';
    if (level < 100) return '极度危险';
    return '致命';
  };

  return (
    <div className="flex items-center gap-3">
      {/* 标签 */}
      <div className="flex flex-col items-end min-w-[48px]">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          {label}
        </span>
        <span
          className="text-[10px] font-bold font-mono"
          style={{ color }}
        >
          {Math.round(level)}%
        </span>
      </div>

      {/* 进度条 */}
      <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-gray-800 relative">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />

        {/* 刻度线 */}
        {[20, 40, 60, 80].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-gray-700/50"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>

      {/* 等级文本 */}
      <motion.span
        className="text-[10px] font-mono font-bold min-w-[48px] text-right"
        animate={{ color }}
        transition={{ duration: 0.5 }}
      >
        {getLevelLabel()}
      </motion.span>
    </div>
  );
}
