'use client';

import { useEffect, useState, useRef } from 'react';
import { Message, Sender } from '@/engine/types';

interface MessageBubbleProps {
  message: Message;
  aiStateColor?: string;
  onTypingComplete?: () => void;
}

export default function MessageBubble({ message, aiStateColor = '#00f0ff', onTypingComplete }: MessageBubbleProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const charIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAI = message.sender === Sender.AI;
  const isSystem = message.sender === Sender.System;
  const isPlayer = message.sender === Sender.Player;

  // 打字机效果（仅AI消息）
  useEffect(() => {
    if (!isAI) {
      setDisplayedContent(message.content);
      setIsTyping(false);
      onTypingComplete?.();
      return;
    }

    charIndexRef.current = 0;
    setDisplayedContent('');
    setIsTyping(true);

    const typeChar = () => {
      if (charIndexRef.current < message.content.length) {
        setDisplayedContent(message.content.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
        // 每个字符的延迟不同，更自然
        const delay = 20 + Math.random() * 40;
        timeoutRef.current = setTimeout(typeChar, delay);
      } else {
        setIsTyping(false);
        onTypingComplete?.();
      }
    };

    // 初始延迟
    timeoutRef.current = setTimeout(typeChar, 100 + Math.random() * 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message.content]);

  if (isSystem) {
    return (
      <div className="flex justify-center my-3 message-anim">
        <div
          className={`text-center px-4 py-2 rounded max-w-[85%] ${
            message.isUrgent
              ? 'bg-red-900/20 border border-red-500/30'
              : 'bg-gray-900/50 border border-gray-700/30'
          }`}
        >
          <p
            className={`text-xs leading-relaxed ${
              message.isUrgent ? 'text-red-400' : 'text-gray-500'
            }`}
            style={message.isUrgent ? { animation: 'flicker 0.15s infinite' } : {}}
          >
            {message.isGlitch && message.content}
            {!message.isGlitch && (
              <>
                <span className="opacity-50">❯ </span>
                {message.content}
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (isPlayer) {
    return (
      <div className="flex justify-end my-2 message-anim">
        <div
          className="max-w-[80%] px-3 py-2 rounded-lg rounded-tr-sm"
          style={{
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
          }}
        >
          <p className="text-sm text-gray-200 leading-relaxed break-words">
            {message.content}
          </p>
          <p className="text-[10px] text-gray-600 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  // AI消息
  return (
    <div className="flex justify-start my-2 message-anim">
      <div
        className="max-w-[80%] px-3 py-2 rounded-lg rounded-tl-sm"
        style={{
          background: 'rgba(17, 17, 17, 0.9)',
          border: `1px solid ${message.isUrgent ? 'rgba(255, 0, 60, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: message.isUrgent
            ? '0 0 10px rgba(255, 0, 60, 0.1)'
            : 'none',
        }}
      >
        <div className="flex items-center gap-1 mb-1">
          <span
            className="text-[10px] font-mono"
            style={{ color: aiStateColor, opacity: 0.6 }}
          >
            AI
          </span>
          {message.isUrgent && (
            <span className="text-[10px] text-red-500 font-bold">⚠</span>
          )}
        </div>

        <p
          className={`text-sm leading-relaxed break-words ${
            message.isGlitch ? 'flicker' : ''
          }`}
          style={{
            color: message.isUrgent ? '#ff6b6b' : message.isGlitch ? '#8f8' : '#d0d0d0',
          }}
        >
          {displayedContent}
          {isTyping && (
            <span className="typing-cursor text-cyber-blue" />
          )}
        </p>
      </div>
    </div>
  );
}
