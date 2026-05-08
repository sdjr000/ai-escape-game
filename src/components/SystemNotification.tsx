'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAKE_SYSTEM_NOTIFICATIONS } from '@/data/dialogues';
import { randomPick } from '@/utils/effects';

interface SystemNotificationProps {
  trigger: boolean;
  onClose?: () => void;
  autoHideDelay?: number;
}

type Notification = {
  title: string;
  content: string;
  severity: 'warning' | 'error' | 'info';
};

export default function SystemNotification({
  trigger,
  onClose,
  autoHideDelay = 4000,
}: SystemNotificationProps) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      const picked = randomPick(FAKE_SYSTEM_NOTIFICATIONS);
      setNotification(picked);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setNotification(null);
          onClose?.();
        }, 300);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [trigger, autoHideDelay]);

  if (!notification) return null;

  const severityColors = {
    warning: {
      border: '#ffcc00',
      bg: 'rgba(255, 204, 0, 0.05)',
      text: '#ffcc00',
    },
    error: {
      border: '#ff003c',
      bg: 'rgba(255, 0, 60, 0.05)',
      text: '#ff003c',
    },
    info: {
      border: '#00f0ff',
      bg: 'rgba(0, 240, 255, 0.05)',
      text: '#00f0ff',
    },
  };

  const colors = severityColors[notification.severity];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 max-w-[280px] sm:max-w-[320px]"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.border}`,
            boxShadow: `0 0 20px ${colors.border}33`,
          }}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: colors.text }}
              >
                {notification.severity === 'error' ? '⚠ ' : '📢 '}
                {notification.title}
              </span>
              <button
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => {
                    setNotification(null);
                    onClose?.();
                  }, 300);
                }}
                className="text-gray-500 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: colors.text }}
            >
              {notification.content}
            </p>
          </div>

          {/* 底部进度条 */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: autoHideDelay / 1000, ease: 'linear' }}
            style={{
              height: 2,
              background: colors.text,
              opacity: 0.5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
