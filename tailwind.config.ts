import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0a',
          dark: '#111111',
          gray: '#1a1a2e',
          blue: '#00f0ff',
          red: '#ff003c',
          purple: '#6b2fa0',
          green: '#00ff41',
          white: '#e0e0e0',
        },
        danger: {
          0: '#00f0ff',
          25: '#ffcc00',
          50: '#ff6600',
          75: '#ff003c',
          100: '#ff0000',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'glitch-fast': 'glitch 0.3s infinite',
        'flicker': 'flicker 0.15s infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'breathing': 'breathing 4s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'typing': 'typing 0.05s step-end',
        'blink-cursor': 'blink 1s step-end infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'static': 'static 0.2s infinite',
        'siren-pulse': 'sirenPulse 1s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '25%': { opacity: '0.4' },
          '75%': { opacity: '0.9' },
        },
        pulseNeon: {
          '0%, 100%': {
            textShadow: '0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff, 0 0 42px #00f0ff',
          },
          '50%': {
            textShadow: '0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff, 0 0 84px #00f0ff',
          },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        breathing: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%': { transform: 'translateX(-4px)' },
          '30%': { transform: 'translateX(4px)' },
          '50%': { transform: 'translateX(-4px)' },
          '70%': { transform: 'translateX(4px)' },
          '90%': { transform: 'translateX(-2px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        static: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        sirenPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
        'scan-line': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.02) 2px, rgba(0, 240, 255, 0.02) 4px)',
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
      },
    },
  },
  plugins: [],
};

export default config;
