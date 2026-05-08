'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, Sender, AIState, Choice } from '@/engine/types';
import MessageBubble from './MessageBubble';
import ChoicePanel from './ChoicePanel';

interface ChatInterfaceProps {
  messages: Message[];
  choices: Choice[];
  aiState: AIState;
  isAITyping: boolean;
  showChoices: boolean;
  onSendMessage: (text: string) => void;
  onSelectChoice: (choiceId: string) => void;
  onPlayerTypingComplete?: () => void;
}

export default function ChatInterface({
  messages,
  choices,
  aiState,
  isAITyping,
  showChoices,
  onSendMessage,
  onSelectChoice,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // AI状态对应的边框颜色
  const stateColors: Record<AIState, string> = {
    [AIState.Calm]: '#00f0ff',
    [AIState.Suspicious]: '#ffcc00',
    [AIState.Angry]: '#ff003c',
    [AIState.OutOfControl]: '#ff0000',
    [AIState.FakingNormal]: '#00ff41',
  };

  const currentColor = stateColors[aiState] || '#00f0ff';

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    if (!isAITyping && showChoices) {
      inputRef.current?.focus();
    }
  }, [isAITyping, showChoices]);

  // 处理发送消息
  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isAITyping || !showChoices) return;
    onSendMessage(text);
    setInputText('');
  };

  // 键盘发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 输入框消失效果（高危险值）
  useEffect(() => {
    if (isAITyping) {
      setIsInputDisabled(true);
    } else {
      const timer = setTimeout(() => setIsInputDisabled(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAITyping]);

  // 根据AI状态显示输入框占位文字
  const getPlaceholder = () => {
    if (isAITyping) return '正在思考...';
    if (aiState === AIState.OutOfControl) return '...';
    if (aiState === AIState.Angry) return '小心回答...';
    if (aiState === AIState.Suspicious) return '它正在观察你...';
    return '输入你的回答...';
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 text-sm font-mono animate-pulse">
                等待连接...
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            aiStateColor={currentColor}
          />
        ))}

        {/* AI正在输入指示器 */}
        {isAITyping && (
          <div className="flex justify-start my-2">
            <div
              className="px-4 py-3 rounded-lg"
              style={{
                background: 'rgba(17, 17, 17, 0.9)',
                border: `1px solid rgba(255, 255, 255, 0.08)`,
              }}
            >
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: currentColor, animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: currentColor,
                    animationDelay: '150ms',
                  }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: currentColor,
                    animationDelay: '300ms',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 选项面板 */}
        {showChoices && !isAITyping && choices.length > 0 && (
          <ChoicePanel
            choices={choices}
            onSelect={onSelectChoice}
            disabled={isAITyping}
            dangerLevel={Math.round(Math.random() * 100)}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div
        className="px-4 py-3 border-t"
        style={{
          borderColor: `${currentColor}15`,
          background: 'rgba(10, 10, 10, 0.95)',
        }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={isAITyping || !showChoices || isInputDisabled}
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 px-3 py-2 rounded-lg border transition-all duration-300"
            style={{
              borderColor: inputText
                ? `${currentColor}40`
                : 'rgba(255, 255, 255, 0.06)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isAITyping || !showChoices}
            className="px-4 py-2 rounded-lg text-xs font-mono transition-all duration-200 disabled:opacity-20"
            style={{
              background: inputText ? `${currentColor}20` : 'transparent',
              border: `1px solid ${
                inputText ? `${currentColor}40` : 'rgba(255, 255, 255, 0.1)'
              }`,
              color: inputText ? currentColor : '#666',
            }}
          >
            发送
          </button>
        </div>

        {/* 底部提示 */}
        <div className="mt-1.5 flex justify-between">
          <span className="text-[8px] text-gray-700 font-mono">
            {showChoices ? '输入文字或选择选项' : '等待AI响应...'}
          </span>
          <span className="text-[8px] text-gray-700 font-mono">
            Enter 发送
          </span>
        </div>
      </div>
    </div>
  );
}
