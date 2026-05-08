// ============================================================
// 游戏状态管理 Hook
// 使用 Zustand 管理全局游戏状态
// ============================================================

'use client';

import { create } from 'zustand';
import {
  GameState,
  Message,
  AIState,
  EndingType,
  AmbientEffect,
  Sender,
  Choice,
  GameSave,
} from '@/engine/types';
import { StoryManager } from '@/engine/StoryManager';
import { StateMachine } from '@/engine/StateMachine';
import { DangerSystem } from '@/engine/DangerSystem';
import { AIEngine } from '@/engine/AIEngine';
import { generateId } from '@/utils/effects';

interface GameStore extends GameState {
  // 引擎实例
  storyManager: StoryManager;
  stateMachine: StateMachine;
  dangerSystem: DangerSystem;
  aiEngine: AIEngine;

  // 当前可用选项
  currentChoices: Choice[];

  // 动作
  startGame: (playerName?: string) => void;
  sendMessage: (text: string) => Promise<void>;
  selectChoice: (choiceId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  setAITyping: (typing: boolean) => void;
  setShowChoices: (show: boolean) => void;
  resetGame: () => void;

  // 存档
  saveGame: () => GameSave;
  loadGame: (save: GameSave) => void;

  // 杂项
  setPlayerName: (name: string) => void;
  setAmbientEffect: (effect: AmbientEffect) => void;
  setGameOver: (endingType: EndingType) => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // 初始化引擎
  const storyManager = new StoryManager('lab_entrance');
  const stateMachine = new StateMachine(AIState.Calm);
  const dangerSystem = new DangerSystem();
  const aiEngine = new AIEngine(stateMachine, dangerSystem);

  return {
    // 初始状态
    currentSceneId: 'lab_entrance',
    dangerLevel: 0,
    aiState: AIState.Calm,
    messages: [],
    visitedScenes: [],
    playerChoices: [],
    isGameOver: false,
    endingType: null,
    isAITyping: false,
    showChoices: false,
    ambientEffect: {},
    playerName: '',
    playCount: 0,
    isMuted: false,
    currentChoices: [],

    // 引擎
    storyManager,
    stateMachine,
    dangerSystem,
    aiEngine,

    // === 动作 ===

    startGame: (playerName) => {
      const store = get();
      store.storyManager.reset('lab_entrance');
      store.stateMachine.setState(AIState.Calm);
      store.dangerSystem.reset();
      store.aiEngine.reset();

      if (playerName) {
        store.aiEngine.setPlayerName(playerName);
      }

      const scene = store.storyManager.enterScene('lab_entrance');
      const sceneMessages = store.storyManager.getSceneMessages(0, AIState.Calm);
      const choices = store.storyManager.getAvailableChoices(0, AIState.Calm);

      set({
        currentSceneId: 'lab_entrance',
        dangerLevel: 0,
        aiState: AIState.Calm,
        messages: sceneMessages,
        visitedScenes: ['lab_entrance'],
        playerChoices: [],
        isGameOver: false,
        endingType: null,
        isAITyping: false,
        showChoices: true,
        ambientEffect: scene?.ambientEffect || {},
        playerName: playerName || '',
        playCount: store.playCount + 1,
        currentChoices: choices,
      });
    },

    sendMessage: async (text) => {
      const store = get();
      if (store.isGameOver || store.isAITyping) return;

      // 添加玩家消息
      const playerMsg: Message = {
        id: generateId(),
        sender: Sender.Player,
        content: text,
        timestamp: Date.now(),
      };
      store.addMessage(playerMsg);

      // AI思考中
      set({ isAITyping: true, showChoices: false });

      // 模拟AI思考延迟
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1500));

      // AI响应
      const response = await store.aiEngine.processInput(text);
      const newDanger = store.dangerSystem.value;
      const newState = store.stateMachine.state;

      // 添加AI消息
      const aiMsg: Message = {
        id: generateId(),
        sender: Sender.AI,
        content: response.content,
        timestamp: Date.now(),
        isGlitch: newDanger > 60,
        isUrgent: newDanger > 70,
      };
      store.addMessage(aiMsg);

      // 更新状态
      const newChoices = store.storyManager.getAvailableChoices(newDanger, newState);

      set({
        dangerLevel: newDanger,
        aiState: newState,
        isAITyping: false,
        showChoices: response.shouldShowChoices !== false && newChoices.length > 0,
        ambientEffect: { ...store.ambientEffect, ...response.effect },
        currentChoices: newChoices,
      });

      // 检查是否触发结局
      if (response.forceEnding) {
        store.setGameOver(response.forceEnding);
      }

      // 检查是否达到危险值上限
      if (store.dangerSystem.isDeadly) {
        store.setGameOver(EndingType.DangerDeath);
      }
    },

    selectChoice: async (choiceId) => {
      const store = get();
      if (store.isGameOver || store.isAITyping) return;

      // 查找选择
      const choice = store.currentChoices.find((c) => c.id === choiceId);
      if (!choice) return;

      // 检查是否是结局选择
      const scene = store.storyManager.currentScene;
      if (scene?.isEnding) {
        // 直接触发结局
        store.storyManager.makeChoice(choiceId);
        store.setGameOver(scene.endingType || EndingType.InfiniteLoop);
        return;
      }

      // 处理选择
      const result = store.storyManager.makeChoice(choiceId);

      // 应用危险值变化
      if (result.dangerDelta !== 0) {
        if (result.dangerDelta > 0) {
          store.dangerSystem.increase(result.dangerDelta);
        } else {
          store.dangerSystem.decrease(-result.dangerDelta);
        }
      }

      const newDanger = store.dangerSystem.value;
      const newState = store.stateMachine.state;

      // 添加系统消息
      const sysMsg: Message = {
        id: generateId(),
        sender: Sender.System,
        content: choice.text,
        timestamp: Date.now(),
        isUrgent: choice.isTrap,
      };
      store.addMessage(sysMsg);

      if (result.isEnding) {
        store.setGameOver(result.endingType || EndingType.InfiniteLoop);
        return;
      }

      // 进入下一场景
      if (result.nextScene) {
        const sceneMessages = store.storyManager.getSceneMessages(newDanger, newState);
        const newChoices = store.storyManager.getAvailableChoices(newDanger, newState);

        // 逐条显示场景消息
        set({ isAITyping: true, showChoices: false });

        for (const msg of sceneMessages) {
          await new Promise((r) => setTimeout(r, 500 + Math.random() * 800));
          store.addMessage(msg);
        }

        set({
          currentSceneId: result.nextScene.id,
          dangerLevel: newDanger,
          aiState: newState,
          isAITyping: false,
          showChoices: newChoices.length > 0,
          ambientEffect: result.nextScene.ambientEffect || store.ambientEffect,
          currentChoices: newChoices,
          visitedScenes: [...store.visitedScenes, result.nextScene.id],
          playerChoices: [...store.playerChoices, choiceId],
        });
      } else {
        // 没有下一场景，保持当前
        set({
          dangerLevel: newDanger,
          aiState: newState,
          playerChoices: [...store.playerChoices, choiceId],
        });
      }

      // 检查危险值上限
      if (store.dangerSystem.isDeadly) {
        store.setGameOver(EndingType.DangerDeath);
      }
    },

    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    setAITyping: (typing) => set({ isAITyping: typing }),
    setShowChoices: (show) => set({ showChoices: show }),

    resetGame: () => {
      const store = get();
      store.storyManager.reset('lab_entrance');
      store.stateMachine.setState(AIState.Calm);
      store.dangerSystem.reset();
      store.aiEngine.reset();

      set({
        currentSceneId: 'lab_entrance',
        dangerLevel: 0,
        aiState: AIState.Calm,
        messages: [],
        visitedScenes: [],
        playerChoices: [],
        isGameOver: false,
        endingType: null,
        isAITyping: false,
        showChoices: false,
        ambientEffect: {},
        currentChoices: [],
      });
    },

    saveGame: () => {
      const store = get();
      return {
        sceneId: store.currentSceneId,
        dangerLevel: store.dangerLevel,
        aiState: store.aiState,
        messageHistory: store.messages,
        visitedScenes: store.visitedScenes,
        playerChoices: store.playerChoices,
        timestamp: Date.now(),
        playCount: store.playCount,
      };
    },

    loadGame: (save) => {
      const store = get();
      store.storyManager.reset(save.sceneId);
      store.storyManager.enterScene(save.sceneId);
      store.stateMachine.setState(save.aiState);
      store.dangerSystem.set(save.dangerLevel);
      store.aiEngine.setPlayerName(store.playerName);

      const scene = store.storyManager.currentScene;
      const choices = store.storyManager.getAvailableChoices(
        save.dangerLevel,
        save.aiState
      );

      set({
        currentSceneId: save.sceneId,
        dangerLevel: save.dangerLevel,
        aiState: save.aiState,
        messages: save.messageHistory,
        visitedScenes: save.visitedScenes,
        playerChoices: save.playerChoices,
        isGameOver: false,
        endingType: null,
        isAITyping: false,
        showChoices: choices.length > 0,
        ambientEffect: scene?.ambientEffect || store.ambientEffect,
        playCount: save.playCount,
        currentChoices: choices,
      });
    },

    setPlayerName: (name) => set({ playerName: name }),
    setAmbientEffect: (effect) => set({ ambientEffect: effect }),

    setGameOver: (endingType) => {
      set({
        isGameOver: true,
        endingType,
        isAITyping: false,
        showChoices: false,
      });
    },
  };
});
