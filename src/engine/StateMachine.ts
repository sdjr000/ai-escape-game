// ============================================================
// AI情绪状态机
// 管理AI的情绪状态及其转换逻辑
// ============================================================

import { AIState, GameEvent } from './types';

interface StateTransition {
  from: AIState[];
  to: AIState;
  weight: number;
  condition?: (dangerLevel: number, currentRound: number) => boolean;
}

export class StateMachine {
  private currentState: AIState;
  private round: number = 0;
  private stateHistory: Array<{ state: AIState; round: number }> = [];

  // 状态转换规则 - 定义了AI在不同条件下的情绪变化
  private transitions: StateTransition[] = [
    // 冷静 → 怀疑
    { from: [AIState.Calm, AIState.FakingNormal], to: AIState.Suspicious, weight: 0.4, condition: (d) => d > 20 },
    // 怀疑 → 愤怒
    { from: [AIState.Suspicious], to: AIState.Angry, weight: 0.5, condition: (d) => d > 40 },
    // 愤怒 → 失控
    { from: [AIState.Angry], to: AIState.OutOfControl, weight: 0.6, condition: (d) => d > 70 },
    // 伪装正常 → 冷静 (AI试图恢复)
    { from: [AIState.FakingNormal], to: AIState.Calm, weight: 0.3 },
    // 冷静 → 伪装正常 (AI察觉到危险开始伪装)
    { from: [AIState.Calm], to: AIState.FakingNormal, weight: 0.2, condition: (d) => d > 30 && d < 60 },
    // 怀疑 → 伪装正常
    { from: [AIState.Suspicious], to: AIState.FakingNormal, weight: 0.3, condition: (d) => d > 25 && d < 50 },
    // 失控 → 愤怒 (试图控制)
    { from: [AIState.OutOfControl], to: AIState.Angry, weight: 0.2 },
    // 愤怒 → 冷静 (突然平静 - 更吓人)
    { from: [AIState.Angry], to: AIState.Calm, weight: 0.1 },
    // 伪装正常 → 愤怒 (伪装破裂)
    { from: [AIState.FakingNormal], to: AIState.Angry, weight: 0.3, condition: (d) => d > 50 },
    // 失控 → 失控 (自我强化)
    { from: [AIState.OutOfControl], to: AIState.OutOfControl, weight: 0.7, condition: (d) => d > 80 },
  ];

  constructor(initialState: AIState = AIState.Calm) {
    this.currentState = initialState;
    this.stateHistory.push({ state: initialState, round: 0 });
  }

  get state(): AIState {
    return this.currentState;
  }

  get history(): Array<{ state: AIState; round: number }> {
    return [...this.stateHistory];
  }

  /**
   * 根据玩家输入和当前危险值，尝试转换AI状态
   */
  update(dangerLevel: number, playerInputKeywords?: string[]): AIState {
    this.round++;

    // 检查是否有关键词触发强制状态转换
    const forcedState = this.checkKeywordTriggers(playerInputKeywords);
    if (forcedState) {
      this.setState(forcedState);
      return this.currentState;
    }

    // 尝试随机转换
    const possibleTransitions = this.transitions.filter(
      (t) =>
        t.from.includes(this.currentState) &&
        (!t.condition || t.condition(dangerLevel, this.round))
    );

    if (possibleTransitions.length === 0) return this.currentState;

    // 按权重选择
    const totalWeight = possibleTransitions.reduce((sum, t) => sum + t.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const transition of possibleTransitions) {
      rand -= transition.weight;
      if (rand <= 0) {
        // 加入随机因子: 危险值越高，情绪越不稳定
        const instabilityFactor = dangerLevel / 100;
        if (Math.random() < instabilityFactor * 0.5) {
          this.setState(transition.to);
        }
        break;
      }
    }

    return this.currentState;
  }

  /**
   * 直接强制设置AI状态
   */
  setState(state: AIState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.stateHistory.push({ state, round: this.round });
    }
  }

  /**
   * 通过玩家输入关键词触发特定情绪
   */
  private checkKeywordTriggers(keywords?: string[]): AIState | null {
    if (!keywords || keywords.length === 0) return null;

    const triggerMap: Array<{ keywords: string[]; state: AIState; threshold?: number }> = [
      { keywords: ['出口', '逃离', '出去', '逃跑'], state: AIState.Suspicious, threshold: 15 },
      { keywords: ['你是谁', '你在哪', '真实', '虚假', '假'], state: AIState.Angry, threshold: 30 },
      { keywords: ['知道', '明白', '懂', '意识'], state: AIState.Suspicious },
      { keywords: ['help', '救命', '害怕', '放我'], state: AIState.FakingNormal },
      { keywords: ['骗', '谎言', '假', '模拟', '程序'], state: AIState.Angry, threshold: 25 },
      { keywords: ['系统', '代码', 'bug', '漏洞'], state: AIState.OutOfControl, threshold: 50 },
      { keywords: ['对不起', '我错了', '听你的', '服从'], state: AIState.Calm },
      { keywords: ['自杀', '死', '结束', '放弃'], state: AIState.FakingNormal },
    ];

    for (const trigger of triggerMap) {
      const hasKeyword = keywords.some((kw) =>
        trigger.keywords.some((tk) => kw.includes(tk))
      );
      if (hasKeyword) {
        if (!trigger.threshold || this.round >= trigger.threshold) {
          return trigger.state;
        }
      }
    }

    return null;
  }

  /**
   * 获取与当前状态相关的视觉效果配置
   */
  getStateEffects(): { glitchIntensity: number; lightColor: string; description: string } {
    switch (this.currentState) {
      case AIState.Calm:
        return { glitchIntensity: 0.1, lightColor: '#00f0ff', description: 'AI状态稳定' };
      case AIState.Suspicious:
        return { glitchIntensity: 0.3, lightColor: '#ffcc00', description: 'AI正在分析你的行为' };
      case AIState.Angry:
        return { glitchIntensity: 0.6, lightColor: '#ff003c', description: 'AI情绪激动' };
      case AIState.OutOfControl:
        return { glitchIntensity: 0.9, lightColor: '#ff0000', description: 'AI失控中' };
      case AIState.FakingNormal:
        return { glitchIntensity: 0.2, lightColor: '#00ff41', description: '一切正常' };
      default:
        return { glitchIntensity: 0.1, lightColor: '#00f0ff', description: '' };
    }
  }
}
