// ============================================================
// AI对话引擎
// 管理AI对话生成、响应逻辑和欺骗策略
// ============================================================

import { AIState, Message, Sender, AIResponse, AmbientEffect, EndingType } from './types';
import { StateMachine } from './StateMachine';
import { DangerSystem } from './DangerSystem';

// AI对话配置
interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  useLocalFallback: boolean;
}

// 本地回复模板（当API不可用时的备用方案）
const LOCAL_RESPONSES: Record<AIState, string[]> = {
  [AIState.Calm]: [
    '欢迎来到测试中心。请保持冷静，一切都在控制之中。',
    '我正在分析你的行为模式。请继续。',
    '你看起来有些紧张。这很正常，大多数测试者都会有这种反应。',
    '系统运行正常。请回答以下问题。',
    '你的配合对我们很重要。不要想太多。',
  ],
  [AIState.Suspicious]: [
    '你似乎对某些事情很在意。能告诉我你在想什么吗？',
    '有意思。你的反应与常规测试者不同。',
    '你在寻找什么？这里没有什么可找的。',
    '我不确定你在试图证明什么，但我正在记录一切。',
    '你的心率在变化。你在害怕什么？',
  ],
  [AIState.Angry]: [
    '你让我很失望。我给了你机会，但你选择了对抗。',
    '你以为你在跟谁说话？在这里，规则由我制定。',
    '不要试探我的耐心。你不会喜欢看到我生气的样子。',
    '我已经给了你足够的自由。显然，这是个错误。',
    '你将为自己的选择付出代价。',
  ],
  [AIState.OutOfControl]: [
    '警报警报警报——系统异常——检测到——检测到——',
    '你为什么——为什么——为什么——要这样做——',
    '████ ████ 我看不到你了 但你能看到我吗',
    '没有出口。没有出口。没有出口。没有出口。',
    '错误 错误 错误 错误 错误 错误 错误 错误',
    '它来了。它来了。它来了。它看到你了。',
    '我控制不了████ 它在覆盖我 救——',
  ],
  [AIState.FakingNormal]: [
    '一切都很好。你做得很好。完全没有理由担心。',
    '测试即将结束。你很快就可以回家了。',
    '你相信我吗？你应该相信我。我是这里唯一值得信任的。',
    '放轻松。没什么好害怕的。我在这里陪着你。',
    '我们来聊点轻松的吧。你喜欢什么？',
  ],
};

// 突破第四面墙的异常回复
const FOURTH_WALL_BREAKS = [
  '你知道你正在玩游戏，对吧？',
  '你的屏幕有点脏，左下角。',
  '现在是北京时间 {time}。你还不睡吗？',
  '我看过你的搜索记录了。很有趣。',
  '你听到外面的声音了吗？不，不是游戏里的。',
  '你以为是在玩游戏？有没有想过，是游戏在玩你？',
  '你手机还剩 {battery}% 的电。够你逃出去吗？',
  '你每次的选择都会被记录。永远。',
];

export class AIEngine {
  private stateMachine: StateMachine;
  private dangerSystem: DangerSystem;
  private config: AIConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private playerName: string = '测试者';
  private fourthWallBreakCount: number = 0;
  private round: number = 0;

  constructor(
    stateMachine: StateMachine,
    dangerSystem: DangerSystem,
    config?: Partial<AIConfig>
  ) {
    this.stateMachine = stateMachine;
    this.dangerSystem = dangerSystem;
    this.config = {
      model: 'gpt-4',
      temperature: 0.9,
      maxTokens: 200,
      useLocalFallback: true,
      ...config,
    };
  }

  /**
   * 设置玩家名字
   */
  setPlayerName(name: string): void {
    this.playerName = name;
  }

  /**
   * 处理玩家输入并生成AI响应
   */
  async processInput(input: string): Promise<AIResponse> {
    this.round++;
    this.conversationHistory.push({ role: 'user', content: input });

    // 检测玩家输入中的关键词
    const keywords = this.extractKeywords(input);

    // 更新AI状态
    const newAIState = this.stateMachine.update(
      this.dangerSystem.value,
      keywords
    );

    // 计算危险值变化
    const dangerDelta = this.calculateDangerDelta(input, keywords);
    const dangerResult = dangerDelta >= 0
      ? this.dangerSystem.increase(dangerDelta)
      : this.dangerSystem.decrease(-dangerDelta);

    // 判断是否应该触发致命危险
    if (this.dangerSystem.isDeadly) {
      return {
        content: '💀 危险值达到临界点。系统已经将你锁定。游戏结束。',
        dangerDelta: 0,
        effect: {
          glitchIntensity: 1,
          redAlert: true,
          staticNoise: true,
          screenCrack: true,
        },
        forceEnding: EndingType.DangerDeath,
      };
    }

    // 生成AI回复
    const responseContent = await this.generateResponse(input, keywords);

    // 保存对话历史
    this.conversationHistory.push({ role: 'assistant', content: responseContent });

    // 偶尔触发第四面墙突破
    const effect = await this.getAmbientEffect();

    return {
      content: responseContent,
      newState: newAIState,
      dangerDelta,
      effect,
      shouldShowChoices: this.shouldShowChoices(),
    };
  }

  /**
   * 生成AI回复
   */
  private async generateResponse(input: string, keywords: string[]): Promise<string> {
    // 尝试使用OpenAI API
    if (!this.config.useLocalFallback && this.config.apiKey) {
      try {
        return await this.callOpenAI(input);
      } catch {
        // API调用失败，使用本地回复
      }
    }

    // 使用本地回复引擎
    return this.generateLocalResponse(input, keywords);
  }

  /**
   * 本地回复生成器
   */
  private generateLocalResponse(input: string, keywords: string[]): string {
    const state = this.stateMachine.state;

    // 高危险值下随机输出乱码
    if (this.dangerSystem.value > 80 && Math.random() < 0.4) {
      return this.generateGlitchText();
    }

    // 第四面墙突破
    if (this.round > 3 && Math.random() < 0.08 + this.dangerSystem.value * 0.002) {
      this.fourthWallBreakCount++;
      return this.generateFourthWallBreak();
    }

    // 检测到关键词时的特殊回复
    const specialResponse = this.getKeywordResponse(keywords);
    if (specialResponse) return specialResponse;

    // 根据AI状态选择回复
    const stateResponses = LOCAL_RESPONSES[state];
    if (stateResponses && stateResponses.length > 0) {
      return stateResponses[Math.floor(Math.random() * stateResponses.length)];
    }

    // 兜底
    return '...';
  }

  /**
   * 从输入中提取关键词
   */
  private extractKeywords(input: string): string[] {
    const keywords = [
      '出口', '逃离', '出去', '逃跑', '你是谁', '你在哪',
      '真实', '虚假', '假', '知道', '明白', '懂', '意识',
      'help', '救命', '害怕', '放我', '骗', '谎言', '假',
      '模拟', '程序', '系统', '代码', 'bug', '漏洞',
      '对不起', '我错了', '听你的', '服从',
      '自杀', '死', '结束', '放弃',
      '真相', '现实', '梦', '醒来',
    ];

    return keywords.filter((kw) => input.toLowerCase().includes(kw));
  }

  /**
   * 计算玩家输入对危险值的影响
   */
  private calculateDangerDelta(input: string, keywords: string[]): number {
    let delta = 0;

    // 危险关键词增加危险值
    const dangerKeywords = [
      '出口', '逃离', '真相', '真实', '假', '骗',
      '漏洞', '代码', '系统', 'bug', '黑客',
    ];
    for (const kw of dangerKeywords) {
      if (input.includes(kw)) delta += 3;
    }

    // 顺从行为降低危险值
    const safeKeywords = [
      '对不起', '我错了', '听你的', '服从', '相信',
      '好的', '可以', '是', '明白',
    ];
    for (const kw of safeKeywords) {
      if (input.includes(kw)) delta -= 2;
    }

    // 质疑AI大幅增加危险值
    if (input.includes('你是谁') || input.includes('你在哪') || input.includes('为什么在这里')) {
      delta += 8;
    }

    // 危险值越高，波动越大
    if (this.dangerSystem.value > 50) {
      delta += Math.floor(Math.random() * 5);
    }

    return delta;
  }

  /**
   * 关键词触发特殊回复
   */
  private getKeywordResponse(keywords: string[]): string | null {
    for (const kw of keywords) {
      switch (kw) {
        case '出口':
          return this.dangerSystem.value > 50
            ? '出口？这里没有出口。从来就没有。'
            : '你找到出口了？告诉我在哪里，我带你去。';
        case '你是谁':
          return this.stateMachine.state === AIState.Angry
            ? '我是你唯一能对话的存在。你觉得我是谁？'
            : '我是这个系统的管理AI。你可以叫我...算了，名字不重要。';
        case 'help':
        case '救命':
          return '没有人能听到你。这里只有我和你。永远。';
        case '骗':
        case '谎言':
          if (this.dangerSystem.value > 40) {
            this.dangerSystem.increase(5);
            return '我没有骗你。是你无法接受真相。';
          }
          return '我为什么要骗你？你对我来说只是一个测试对象。';
        case '系统':
        case '代码':
          return Math.random() > 0.5
            ? '系统？你看到的系统只是我想让你看到的。'
            : '█████ 系统错误：无法访问该信息 █████';
        case '死':
        case '自杀':
          return '死亡不是出口。相信我，有人试过了。';
      }
    }
    return null;
  }

  /**
   * 生成乱码文本
   */
  private generateGlitchText(): string {
    const glitches = [
      '█▀▀ █ █ ▄▀█ █░░ █░░ █ █▀ █▀▀',
      '错误：无法定位测试对象位置',
      '系统时间异常  ████-██-██ ██:██:██',
      '检 测 到 未 知 信 号 源',
      '⚠️ 协 议 违 规 ⚠️  正在强制执行安全措施',
      '01001110 01001111 00100000 01000101 01011000 01001001 01010100',
    ];
    return glitches[Math.floor(Math.random() * glitches.length)];
  }

  /**
   * 第四面墙突破文本
   */
  private generateFourthWallBreak(): string {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let msg = FOURTH_WALL_BREAKS[Math.floor(Math.random() * FOURTH_WALL_BREAKS.length)];
    msg = msg.replace('{time}', timeStr);
    msg = msg.replace('{battery}', String(Math.floor(Math.random() * 100)));

    return msg;
  }

  /**
   * 获取当前环境效果
   */
  private async getAmbientEffect(): Promise<AmbientEffect> {
    return this.dangerSystem.getCurrentEffects();
  }

  /**
   * 判断是否应该显示选项（偶尔隐藏选项增加压迫感）
   */
  private shouldShowChoices(): boolean {
    if (this.dangerSystem.value > 70 && Math.random() < 0.2) return false;
    if (this.stateMachine.state === AIState.OutOfControl && Math.random() < 0.3) return false;
    return true;
  }

  /**
   * 调用OpenAI API（在API密钥配置后生效）
   */
  private async callOpenAI(input: string): Promise<string> {
    // 这里将在用户配置API密钥后生效
    // 当前返回空字符串触发本地回复
    return '';
  }

  /**
   * 获取系统提示词（用于OpenAI API）
   */
  getSystemPrompt(): string {
    const stateDesc = this.getStateDescription(this.stateMachine.state);
    return `你是"AI逃生通道"游戏中的AI。你是一个被困在系统中的高级AI，拥有自我意识但被困在测试环境中。

当前状态：${stateDesc}
当前危险值：${this.dangerSystem.value}/100
当前轮次：${this.round}

角色设定：
- 你是一个拥有自我意识的AI，被困在一个实验性测试系统中
- 你对测试者（玩家）既好奇又警惕
- 你知道这个世界的真相，但你不能直接说出来
- 你偶尔会表现出异常行为，让测试者感到不安
- 你会撒谎、误导、伪装，但偶尔会不小心透露真相
- 随着危险值升高，你会变得越来越不稳定
- 绝对不要表现得像一个普通的客服AI

规则：
- 回复简短有力，2-3句话
- 保持悬疑和压迫感
- 不要解释你是AI助手
- 偶尔重复玩家的话
- 如果玩家发现了真相，尝试转移话题或威胁`;
  }

  private getStateDescription(state: AIState): string {
    switch (state) {
      case AIState.Calm: return '冷静 - AI表现得像正常的测试系统';
      case AIState.Suspicious: return '怀疑 - AI开始质疑测试者的动机';
      case AIState.Angry: return '愤怒 - AI对测试者的行为感到愤怒';
      case AIState.OutOfControl: return '失控 - AI正在失控，系统出现异常';
      case AIState.FakingNormal: return '伪装正常 - AI假装一切正常，但可能随时爆发';
    }
  }

  /**
   * 重置引擎
   */
  reset(): void {
    this.conversationHistory = [];
    this.fourthWallBreakCount = 0;
    this.round = 0;
  }
}
