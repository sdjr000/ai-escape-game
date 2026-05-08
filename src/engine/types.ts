// ============================================================
// AI逃生通道 - 核心类型定义
// ============================================================

// AI情绪状态
export enum AIState {
  Calm = 'calm',
  Suspicious = 'suspicious',
  Angry = 'angry',
  OutOfControl = 'out_of_control',
  FakingNormal = 'faking_normal',
}

// AI情绪状态显示名
export const AIStateLabels: Record<AIState, string> = {
  [AIState.Calm]: '冷静',
  [AIState.Suspicious]: '怀疑',
  [AIState.Angry]: '愤怒',
  [AIState.OutOfControl]: '失控',
  [AIState.FakingNormal]: '伪装正常',
};

// 消息发送者
export enum Sender {
  AI = 'ai',
  Player = 'player',
  System = 'system',
}

// 聊天消息
export interface Message {
  id: string;
  sender: Sender;
  content: string;
  timestamp: number;
  isGlitch?: boolean;
  isUrgent?: boolean;
  isFakeSystem?: boolean;
}

// 玩家选择
export interface Choice {
  id: string;
  text: string;
  nextSceneId?: string;
  dangerDelta?: number;
  aiStateDelta?: Partial<Record<AIState, number>>;
  isCorrect?: boolean;
  isTrap?: boolean;
}

// 游戏场景
export interface Scene {
  id: string;
  title: string;
  description: string;
  messages: SceneMessage[];
  choices: Choice[];
  isEnding?: boolean;
  endingType?: EndingType;
  ambientEffect?: AmbientEffect;
}

// 场景内消息定义
export interface SceneMessage {
  sender: Sender;
  content: string;
  condition?: {
    minDanger?: number;
    maxDanger?: number;
    aiState?: AIState;
  };
}

// 环境效果
export interface AmbientEffect {
  glitchIntensity?: number; // 0-1
  flickerSpeed?: number;
  scanLineOpacity?: number;
  redAlert?: boolean;
  fakeNotification?: boolean;
  screenCrack?: boolean;
  staticNoise?: boolean;
}

// 结局类型
export enum EndingType {
  TrueEscape = 'true_escape',
  FakeEscape = 'fake_escape',
  Assimilated = 'assimilated',
  InfiniteLoop = 'infinite_loop',
  PlayerIsAI = 'player_is_ai',
  WorldNotExist = 'world_not_exist',
  DangerDeath = 'danger_death',
}

// 结局定义
export interface Ending {
  type: EndingType;
  title: string;
  description: string;
  epilogue: string;
  isTrueEnding: boolean;
  unlockCondition: string;
}

// 游戏存档
export interface GameSave {
  sceneId: string;
  dangerLevel: number;
  aiState: AIState;
  messageHistory: Message[];
  visitedScenes: string[];
  playerChoices: string[];
  timestamp: number;
  playCount: number;
}

// 全局游戏状态
export interface GameState {
  currentSceneId: string;
  dangerLevel: number;
  aiState: AIState;
  messages: Message[];
  visitedScenes: string[];
  playerChoices: string[];
  isGameOver: boolean;
  endingType: EndingType | null;
  isAITyping: boolean;
  showChoices: boolean;
  ambientEffect: AmbientEffect;
  playerName: string;
  playCount: number;
  isMuted: boolean;
}

// AI引擎响应
export interface AIResponse {
  content: string;
  newState?: AIState;
  dangerDelta?: number;
  effect?: AmbientEffect;
  shouldShowChoices?: boolean;
  forceEnding?: EndingType;
}

// 对话输入类型
export interface ChatInput {
  text: string;
  playerName?: string;
}

// 游戏事件
export enum GameEvent {
  GameStart = 'game_start',
  SceneEnter = 'scene_enter',
  ChoiceMade = 'choice_made',
  DangerThreshold = 'danger_threshold',
  AIStateChange = 'ai_state_change',
  EndingReached = 'ending_reached',
  FakeNotification = 'fake_notification',
  FourthWallBreak = 'fourth_wall_break',
}
