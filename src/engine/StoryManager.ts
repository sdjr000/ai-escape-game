// ============================================================
// 故事管理器
// 管理游戏场景流、剧本逻辑和结局分发
// ============================================================

import {
  Scene,
  Choice,
  Message,
  Sender,
  Ending,
  EndingType,
  AIState,
  GameEvent,
} from './types';
import { scenarios } from '@/data/scenarios';
import { endings } from '@/data/endings';

export class StoryManager {
  private scenes: Map<string, Scene>;
  private endingsMap: Map<EndingType, Ending>;
  private visitedScenes: Set<string> = new Set();
  private playerChoices: string[] = [];
  private currentSceneId: string;

  constructor(startSceneId: string = 'lab_entrance') {
    this.scenes = new Map(scenarios.map((s) => [s.id, s]));
    this.endingsMap = new Map(endings.map((e) => [e.type, e]));
    this.currentSceneId = startSceneId;
  }

  get currentScene(): Scene | undefined {
    return this.scenes.get(this.currentSceneId);
  }

  get currentSceneID(): string {
    return this.currentSceneId;
  }

  get allScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * 进入新场景
   */
  enterScene(sceneId: string): Scene | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    this.currentSceneId = sceneId;
    this.visitedScenes.add(sceneId);
    return scene;
  }

  /**
   * 根据当前危险值和AI状态，获取适配的剧情消息
   */
  getSceneMessages(dangerLevel: number, aiState: AIState): Message[] {
    const scene = this.currentScene;
    if (!scene) return [];

    const messages: Message[] = [];
    for (const sm of scene.messages) {
      // 检查条件
      if (sm.condition) {
        if (sm.condition.minDanger !== undefined && dangerLevel < sm.condition.minDanger) continue;
        if (sm.condition.maxDanger !== undefined && dangerLevel > sm.condition.maxDanger) continue;
        if (sm.condition.aiState && sm.condition.aiState !== aiState) continue;
      }

      messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sender: sm.sender,
        content: sm.content,
        timestamp: Date.now(),
      });
    }

    return messages;
  }

  /**
   * 获取场景选项（含条件过滤）
   */
  getAvailableChoices(dangerLevel: number, aiState: AIState): Choice[] {
    const scene = this.currentScene;
    if (!scene) return [];

    // 根据AI状态过滤选项
    let choices = [...scene.choices];

    // 高危险值时，部分正确选项可能被隐藏
    if (dangerLevel > 60) {
      choices = choices.filter((c) => {
        if (c.isCorrect && dangerLevel > 80) return Math.random() > 0.5;
        return true;
      });
    }

    // AI失控时增加陷阱选项
    if (aiState === AIState.OutOfControl) {
      choices = choices.map((c) => ({
        ...c,
        isTrap: c.isCorrect ? false : c.isTrap,
        text: c.isCorrect && Math.random() > 0.7
          ? c.text + ' (不，这不对...)'
          : c.text,
      }));
    }

    return choices;
  }

  /**
   * 处理玩家选择
   */
  makeChoice(choiceId: string): {
    nextScene: Scene | null;
    isEnding: boolean;
    endingType: EndingType | null;
    dangerDelta: number;
  } {
    const scene = this.currentScene;
    if (!scene) return { nextScene: null, isEnding: false, endingType: null, dangerDelta: 0 };

    const choice = scene.choices.find((c) => c.id === choiceId);
    if (!choice) return { nextScene: null, isEnding: false, endingType: null, dangerDelta: 0 };

    this.playerChoices.push(choiceId);

    if (choice.nextSceneId) {
      const nextScene = this.enterScene(choice.nextSceneId);
      return {
        nextScene,
        isEnding: nextScene?.isEnding ?? false,
        endingType: nextScene?.endingType ?? null,
        dangerDelta: choice.dangerDelta ?? 0,
      };
    }

    // 没有nextSceneId，可能是结局
    return {
      nextScene: null,
      isEnding: scene.isEnding ?? false,
      endingType: scene.endingType ?? null,
      dangerDelta: choice.dangerDelta ?? 0,
    };
  }

  /**
   * 根据条件判断应该触发哪个结局
   */
  determineEnding(dangerLevel: number, aiState: AIState, choices: string[]): EndingType {
    if (dangerLevel >= 100) return EndingType.DangerDeath;

    // 分析玩家行为模式
    const suspiciousCount = choices.filter((c) => this.isChoiceSuspicious(c)).length;
    const compliantCount = choices.filter((c) => this.isChoiceCompliant(c)).length;

    // 玩家过于顺从 → 被同化
    if (compliantCount > 5 && dangerLevel > 50) return EndingType.Assimilated;

    // 玩家过于怀疑 → 陷入循环
    if (suspiciousCount > 5 && dangerLevel > 40) return EndingType.InfiniteLoop;

    // 玩家发现太多真相 → 揭示玩家就是AI
    if (choices.includes('probe_reality') && choices.includes('question_existence')) {
      return EndingType.PlayerIsAI;
    }

    // 危险值很高但还在走 → 假逃脱
    if (dangerLevel > 70 && choices.includes('trust_ai')) return EndingType.FakeEscape;

    // 世界不存在：必须是质疑一切的玩家
    if (choices.includes('deny_all') && choices.includes('question_reality')) {
      return EndingType.WorldNotExist;
    }

    // 默认：真逃脱（如果选择了正确的路径）
    if (choices.some((c) => this.isCorrectPath(c))) return EndingType.TrueEscape;

    // 兜底
    return EndingType.InfiniteLoop;
  }

  /**
   * 获取结局详情
   */
  getEnding(type: EndingType): Ending | undefined {
    return this.endingsMap.get(type);
  }

  /**
   * 重置故事状态
   */
  reset(startSceneId: string = 'lab_entrance'): void {
    this.visitedScenes.clear();
    this.playerChoices = [];
    this.currentSceneId = startSceneId;
  }

  /**
   * 判断选择是否"可疑"
   */
  private isChoiceSuspicious(choiceId: string): boolean {
    const suspiciousIds = [
      'question_ai', 'probe_reality', 'question_existence',
      'deny_all', 'notice_glitch', 'challenge_ai',
      'refuse_comply', 'fight_back', 'search_exit',
    ];
    return suspiciousIds.includes(choiceId);
  }

  /**
   * 判断选择是否"顺从"
   */
  private isChoiceCompliant(choiceId: string): boolean {
    const compliantIds = [
      'trust_ai', 'obey', 'give_up', 'accept',
      'follow_instruction', 'surrender',
    ];
    return compliantIds.includes(choiceId);
  }

  /**
   * 判断是否通向真结局的路径
   */
  private isCorrectPath(choiceId: string): boolean {
    const correctIds = [
      'find_real_exit', 'outsmart_ai', 'use_logic',
      'spot_contradiction', 'break_illusion',
      'awaken', 'escape_correct',
    ];
    return correctIds.includes(choiceId);
  }

  /**
   * 是否已经访问过某个场景
   */
  hasVisited(sceneId: string): boolean {
    return this.visitedScenes.has(sceneId);
  }

  /**
   * 获取玩家选择历史
   */
  getChoiceHistory(): string[] {
    return [...this.playerChoices];
  }

  /**
   * 获取被访问过的场景列表
   */
  getVisitedScenes(): string[] {
    return Array.from(this.visitedScenes);
  }
}
