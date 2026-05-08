'use client';

import { useEffect, useState, useRef } from 'react';

interface GlitchTextProps {
  text: string;
  intensity?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  color?: string;
  glitchOnHover?: boolean;
  trigger?: boolean;
}

// 乱码字符集
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________';

export default function GlitchText({
  text,
  intensity = 0.3,
  className = '',
  as: Tag = 'p',
  color,
  glitchOnHover = false,
  trigger = false,
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 执行glitch效果
  const doGlitch = () => {
    setIsGlitching(true);
    let count = 0;
    const maxGlitches = Math.floor(3 + intensity * 8);

    intervalRef.current = setInterval(() => {
      count++;
      if (count > maxGlitches) {
        clearInterval(intervalRef.current!);
        setDisplayText(text);
        setIsGlitching(false);
        return;
      }

      // 随机替换一些字符
      const chars = text.split('');
      const numToReplace = Math.floor(1 + intensity * 4);

      for (let i = 0; i < numToReplace; i++) {
        const idx = Math.floor(Math.random() * chars.length);
        if (Math.random() < intensity) {
          chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }

      setDisplayText(chars.join(''));
    }, 50 + Math.random() * 100);
  };

  // 自动glitch（低概率）
  useEffect(() => {
    if (glitchOnHover) return;

    const autoGlitch = () => {
      if (Math.random() < 0.1 + intensity * 0.3) {
        doGlitch();
      }
    };

    const timer = setInterval(autoGlitch, 3000 + Math.random() * 5000);

    return () => {
      clearInterval(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intensity, glitchOnHover]);

  // 外部触发glitch
  useEffect(() => {
    if (trigger) doGlitch();
  }, [trigger]);

  const style: React.CSSProperties = {
    color: color || undefined,
    position: 'relative',
  };

  return (
    <Tag
      className={`${className} ${isGlitching ? 'flicker' : ''}`}
      style={style}
      onMouseEnter={glitchOnHover ? doGlitch : undefined}
      data-text={text}
    >
      {displayText}
    </Tag>
  );
}
