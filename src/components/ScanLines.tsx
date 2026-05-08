'use client';

import { useEffect, useState } from 'react';

interface ScanLinesProps {
  opacity?: number;
  isRedAlert?: boolean;
  intensity?: number;
}

export default function ScanLines({ opacity = 0.3, isRedAlert = false, intensity = 0 }: ScanLinesProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!show) return;
  }, [show]);

  const color = isRedAlert ? '255, 0, 60' : '0, 240, 255';

  return (
    <>
      {/* 扫描线 */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(${color}, ${0.02 * opacity}) 2px,
            rgba(${color}, ${0.02 * opacity}) 4px
          )`,
          animation: 'scanlineMove 8s linear infinite',
          opacity: Math.min(1, opacity * (1 + intensity * 0.5)),
        }}
      />

      {/* CRT 曲面 */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 60%,
            rgba(0, 0, 0, ${0.2 + intensity * 0.3}) 100%
          )`,
        }}
      />

      {/* 高危险值时的噪点 */}
      {intensity > 0.5 && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.5 + intensity * 0.5}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${0.03 + intensity * 0.07}'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            opacity: 0.5,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </>
  );
}
