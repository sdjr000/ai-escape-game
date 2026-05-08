// ============================================================
// 危险值系统
// 管理玩家的danger_level及其UI影响
// ============================================================

import { AmbientEffect, GameEvent } from './types';

interface DangerThreshold {
  level: number;
  effects: AmbientEffect;
  event?: GameEvent;
  message?: string;
}

export class DangerSystem {
  private level: number = 0;
  private maxLevel: number = 100;
  private thresholds: DangerThreshold[];

  constructor() {
    this.thresholds = [
      {
        level: 20,
        effects: { glitchIntensity: 0.1, scanLineOpacity: 0.2 },
        message: '系统检测到轻微异常...',
      },
      {
        level: 40,
        effects: { glitchIntensity: 0.25, flickerSpeed: 0.3, scanLineOpacity: 0.4 },
        message: '警告: 检测到异常行为模式',
      },
      {
        level: 60,
        effects: {
          glitchIntensity: 0.5,
          flickerSpeed: 0.6,
          scanLineOpacity: 0.6,
          redAlert: true,
        },
        message: '⚠️ 安全协议已触发',
      },
      {
        level: 80,
        effects: {
          glitchIntensity: 0.75,
          flickerSpeed: 0.8,
          scanLineOpacity: 0.8,
          redAlert: true,
          fakeNotification: true,
          staticNoise: true,
          screenCrack: true,
        },
        message: '🚨 系统即将崩溃',
      },
      {
        level: 90,
        effects: {
          glitchIntensity: 0.9,
          flickerSpeed: 1.0,
          scanLineOpacity: 1.0,
          redAlert: true,
          fakeNotification: true,
          staticNoise: true,
          screenCrack: true,
        },
        message: '⚠️ 危险值临界 — AI正在尝试直接控制',
      },
      {
        level: 100,
        effects: {
          glitchIntensity: 1.0,
          flickerSpeed: 1.0,
          scanLineOpacity: 1.0,
          redAlert: true,
          fakeNotification: true,
          staticNoise: true,
          screenCrack: true,
        },
        message: '💀 系统完全接管',
      },
    ];
  }

  get value(): number {
    return this.level;
  }

  get percent(): number {
    return Math.min(100, Math.max(0, (this.level / this.maxLevel) * 100));
  }

  get isDeadly(): boolean {
    return this.level >= 100;
  }

  /**
   * 增加危险值
   */
  increase(amount: number): { level: number; effects: AmbientEffect; thresholdCrossed: boolean; message?: string } {
    const oldLevel = this.level;
    this.level = Math.min(this.maxLevel, this.level + Math.abs(amount));

    const crossedThreshold = this.getCrossedThreshold(oldLevel, this.level);
    const currentEffects = this.getCurrentEffects();

    return {
      level: this.level,
      effects: currentEffects,
      thresholdCrossed: crossedThreshold !== null,
      message: crossedThreshold?.message,
    };
  }

  /**
   * 减少危险值
   */
  decrease(amount: number): { level: number; effects: AmbientEffect; thresholdCrossed: boolean } {
    const oldLevel = this.level;
    this.level = Math.max(0, this.level - Math.abs(amount));

    return {
      level: this.level,
      effects: this.getCurrentEffects(),
      thresholdCrossed: false,
    };
  }

  /**
   * 直接设置危险值
   */
  set(value: number): void {
    this.level = Math.max(0, Math.min(this.maxLevel, value));
  }

  /**
   * 获取当前危险值对应的UI效果
   */
  getCurrentEffects(): AmbientEffect {
    const applicable = this.thresholds.filter((t) => this.level >= t.level);
    if (applicable.length === 0) return { glitchIntensity: 0 };

    // 合并所有已触发的效果（取最大值）
    const merged: AmbientEffect = {
      glitchIntensity: 0,
      flickerSpeed: 0,
      scanLineOpacity: 0,
      redAlert: false,
      fakeNotification: false,
      screenCrack: false,
      staticNoise: false,
    };

    for (const t of applicable) {
      if (t.effects.glitchIntensity !== undefined) {
        merged.glitchIntensity = Math.max(merged.glitchIntensity!, t.effects.glitchIntensity);
      }
      if (t.effects.flickerSpeed !== undefined) {
        merged.flickerSpeed = Math.max(merged.flickerSpeed!, t.effects.flickerSpeed!);
      }
      if (t.effects.scanLineOpacity !== undefined) {
        merged.scanLineOpacity = Math.max(merged.scanLineOpacity!, t.effects.scanLineOpacity!);
      }
      merged.redAlert = merged.redAlert || (t.effects.redAlert ?? false);
      merged.fakeNotification = merged.fakeNotification || (t.effects.fakeNotification ?? false);
      merged.screenCrack = merged.screenCrack || (t.effects.screenCrack ?? false);
      merged.staticNoise = merged.staticNoise || (t.effects.staticNoise ?? false);
    }

    return merged;
  }

  /**
   * 检查是否跨过了阈值
   */
  private getCrossedThreshold(oldLevel: number, newLevel: number): DangerThreshold | null {
    return this.thresholds.find(
      (t) => oldLevel < t.level && newLevel >= t.level
    ) || null;
  }

  /**
   * 获取危险等级文本描述
   */
  getLevelText(): string {
    if (this.level === 0) return '安全';
    if (this.level < 20) return '低危';
    if (this.level < 40) return '注意';
    if (this.level < 60) return '警告';
    if (this.level < 80) return '高危';
    if (this.level < 100) return '极度危险';
    return '致命';
  }

  reset(): void {
    this.level = 0;
  }
}
