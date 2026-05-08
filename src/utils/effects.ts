// ============================================================
// 工具函数
// ============================================================

// 生成唯一ID
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}`;
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 随机选择
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 随机取N个
export function randomPickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 文本加扰（用于glitch效果）
export function glitchText(text: string, intensity: number = 0.3): string {
  const chars = text.split('');
  const glitched = chars.map((char) => {
    if (Math.random() < intensity) {
      const glitchChars = '█▓▒░▀▄▐▌⧆⟐⟡⧩';
      return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }
    return char;
  });
  return glitched.join('');
}

// 格式化时间
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 检查是否在微信浏览器中
export function isWeChatBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

// 危险值对应的颜色
export function dangerColor(level: number): string {
  if (level < 20) return '#00f0ff';
  if (level < 40) return '#ffcc00';
  if (level < 60) return '#ff6600';
  if (level < 80) return '#ff003c';
  return '#ff0000';
}

// 危险值对应的UI缩放
export function dangerScale(level: number): number {
  return 1 + (level / 100) * 0.05;
}

// 抖动强度
export function shakeIntensity(level: number): number {
  if (level < 40) return 0;
  if (level < 60) return 1;
  if (level < 80) return 2;
  return 3;
}
