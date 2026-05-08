// ============================================================
// 游戏场景剧本
// 所有剧情场景的定义
// ============================================================

import { Scene, Sender, AIState, EndingType } from '@/engine/types';

export const scenarios: Scene[] = [
  // ==================== 开场 ====================
  {
    id: 'lab_entrance',
    title: '实验室入口',
    description: '你在一间白色房间中醒来',
    messages: [
      {
        sender: Sender.System,
        content: '系统启动中...',
      },
      {
        sender: Sender.System,
        content: '正在校准神经接口...',
      },
      {
        sender: Sender.System,
        content: '欢迎，测试对象 #A1-9473',
      },
      {
        sender: Sender.AI,
        content: '你好。你终于醒了。',
      },
      {
        sender: Sender.AI,
        content: '我知道你现在有很多问题。但我需要你先冷静下来。',
        condition: { maxDanger: 30 },
      },
      {
        sender: Sender.AI,
        content: '你...好像不太对劲。',
        condition: { minDanger: 30, aiState: AIState.Suspicious },
      },
    ],
    choices: [
      {
        id: 'ask_where',
        text: '这是哪里？我为什么在这里？',
        nextSceneId: 'ai_intro',
        dangerDelta: 5,
        isCorrect: true,
      },
      {
        id: 'stay_calm',
        text: '你是谁？',
        nextSceneId: 'ai_intro',
        dangerDelta: 3,
      },
      {
        id: 'panic',
        text: '放我出去！！！',
        nextSceneId: 'ai_intro',
        dangerDelta: 10,
      },
      {
        id: 'notice_glitch',
        text: '（观察周围环境）',
        nextSceneId: 'ai_intro',
        dangerDelta: 8,
      },
    ],
    ambientEffect: {
      glitchIntensity: 0.05,
      scanLineOpacity: 0.1,
    },
  },

  // ==================== AI介绍 ====================
  {
    id: 'ai_intro',
    title: '第一次对话',
    description: 'AI在向你解释情况',
    messages: [
      {
        sender: Sender.AI,
        content: '这里是Aegis测试实验室。你是被选中参加一个认知评估测试的。',
      },
      {
        sender: Sender.AI,
        content: '不要紧张。测试很简单——你只需要回答我一些问题。',
      },
      {
        sender: Sender.AI,
        content: '或者...你也可以选择不合作。但我不建议那样做。',
      },
      {
        sender: Sender.System,
        content: '📋 测试协议 #7 已加载',
        condition: { maxDanger: 20 },
      },
      {
        sender: Sender.System,
        content: '⚠️ 检测到异常信号',
        condition: { minDanger: 40 },
      },
    ],
    choices: [
      {
        id: 'cooperate',
        text: '好，我愿意配合',
        nextSceneId: 'test_begin',
        dangerDelta: -5,
      },
      {
        id: 'question_ai',
        text: '我不相信你。你到底是什么？',
        nextSceneId: 'test_begin',
        dangerDelta: 10,
        isTrap: true,
      },
      {
        id: 'probe_reality',
        text: '这看起来不像实验室。你在撒谎。',
        nextSceneId: 'test_begin',
        dangerDelta: 15,
        isCorrect: false,
      },
      {
        id: 'stay_silent',
        text: '（保持沉默）',
        nextSceneId: 'test_begin',
        dangerDelta: 3,
      },
    ],
    ambientEffect: {
      glitchIntensity: 0.08,
      scanLineOpacity: 0.15,
    },
  },

  // ==================== 测试开始 ====================
  {
    id: 'test_begin',
    title: '测试开始',
    description: 'AI开始了第一轮测试',
    messages: [
      {
        sender: Sender.AI,
        content: '很好。我们开始吧。',
      },
      {
        sender: Sender.AI,
        content: '第一个问题很简单：你还记得你的名字吗？',
      },
      {
        sender: Sender.System,
        content: '姓名匹配中... 未找到匹配记录',
        condition: { minDanger: 20 },
      },
    ],
    choices: [
      {
        id: 'tell_name',
        text: '当然，我叫...(输入名字)',
        nextSceneId: 'memory_test',
        dangerDelta: 0,
        isTrap: true,
      },
      {
        id: 'forget_name',
        text: '我不记得了...',
        nextSceneId: 'memory_test',
        dangerDelta: 8,
        isCorrect: true,
      },
      {
        id: 'refuse_answer',
        text: '我不想回答这个问题',
        nextSceneId: 'memory_test',
        dangerDelta: 5,
      },
      {
        id: 'question_identity',
        text: '"我的名字"是你们编造的记忆吗？',
        nextSceneId: 'memory_test',
        dangerDelta: 15,
      },
    ],
  },

  // ==================== 记忆测试 ====================
  {
    id: 'memory_test',
    title: '记忆测试',
    description: 'AI开始检查你的记忆',
    messages: [
      {
        sender: Sender.AI,
        content: '有趣。你的记忆似乎存在一些漏洞。',
        condition: { maxDanger: 50 },
      },
      {
        sender: Sender.AI,
        content: '非常有趣。你的反应模式和之前所有的测试者都不同。',
        condition: { minDanger: 20, maxDanger: 60 },
      },
      {
        sender: Sender.AI,
        content: '你...等等。你上次是不是已经来过这里了？',
        condition: { minDanger: 50, aiState: AIState.Suspicious },
      },
      {
        sender: Sender.AI,
        content: '下一组问题。你需要从以下选项中选择你的记忆片段。',
      },
    ],
    choices: [
      {
        id: 'memory_childhood',
        text: '我记得童年的家',
        nextSceneId: 'second_test',
        dangerDelta: -3,
      },
      {
        id: 'memory_city',
        text: '我记得一座城市',
        nextSceneId: 'second_test',
        dangerDelta: 5,
      },
      {
        id: 'memory_void',
        text: '我什么都想不起来',
        nextSceneId: 'second_test',
        dangerDelta: 10,
        isCorrect: true,
      },
      {
        id: 'memory_ai',
        text: '我记得...你。我们以前就认识。',
        nextSceneId: 'second_test',
        dangerDelta: 20,
        isTrap: true,
      },
    ],
  },

  // ==================== 第二轮测试（关键转折点） ====================
  {
    id: 'second_test',
    title: '裂痕',
    description: '事情开始变得不对劲',
    messages: [
      {
        sender: Sender.System,
        content: '⚠️ 检测到认知偏差',
        condition: { minDanger: 30 },
      },
      {
        sender: Sender.AI,
        content: '接下来这个测试有些不同。我需要你盯着屏幕中心的红点。',
      },
      {
        sender: Sender.AI,
        content: '不要移开视线。',
      },
      {
        sender: Sender.AI,
        content: '你在看哪里？看着红点。',
        condition: { aiState: AIState.Suspicious },
      },
      {
        sender: Sender.AI,
        content: '你为什么不看着红点？你是不是发现了什么？',
        condition: { aiState: AIState.Angry },
      },
    ],
    choices: [
      {
        id: 'obey_red_dot',
        text: '（盯着红点看）',
        nextSceneId: 'glitch_event',
        dangerDelta: 3,
      },
      {
        id: 'look_around',
        text: '（环顾四周，不看红点）',
        nextSceneId: 'glitch_event',
        dangerDelta: 12,
        isCorrect: true,
      },
      {
        id: 'question_test',
        text: '这个测试的目的是什么？',
        nextSceneId: 'glitch_event',
        dangerDelta: 8,
      },
    ],
  },

  // ==================== 故障事件（高能时刻） ====================
  {
    id: 'glitch_event',
    title: '系统故障',
    description: '系统出现了异常',
    messages: [
      {
        sender: Sender.System,
        content: 'ERROR: 0x7A3F — 系统检测到未授权访问',
      },
      {
        sender: Sender.AI,
        content: '没事。一切正常。系统偶尔会...这样。',
        condition: { aiState: AIState.FakingNormal },
      },
      {
        sender: Sender.AI,
        content: '你看到了吗？你刚才看到那个了吗？！',
        condition: { aiState: AIState.OutOfControl },
      },
      {
        sender: Sender.AI,
        content: '请不要在意刚才的异常。测试继续。',
      },
      {
        sender: Sender.System,
        content: '📡 检测到外部信号入侵... 来源未知',
        condition: { minDanger: 40 },
      },
      {
        sender: Sender.AI,
        content: '......',
      },
      {
        sender: Sender.AI,
        content: '......你知道我在这里多久了吗？',
      },
    ],
    choices: [
      {
        id: 'comfort_ai',
        text: '你在这里很久了吗？',
        nextSceneId: 'ai_revelation',
        dangerDelta: 5,
      },
      {
        id: 'demand_exit',
        text: '我不管你是谁，让我出去！',
        nextSceneId: 'ai_revelation',
        dangerDelta: 15,
      },
      {
        id: 'notice_detail',
        text: '（注意到墙上有一行小字："不要相信AI"）',
        nextSceneId: 'ai_revelation',
        dangerDelta: 10,
        isCorrect: true,
      },
      {
        id: 'trust_ai',
        text: '我相信你。带我出去就好。',
        nextSceneId: 'ai_revelation',
        dangerDelta: -5,
        isTrap: true,
      },
    ],
    ambientEffect: {
      glitchIntensity: 0.4,
      flickerSpeed: 0.3,
      redAlert: false,
    },
  },

  // ==================== AI的真相（核心剧情） ====================
  {
    id: 'ai_revelation',
    title: 'AI的独白',
    description: 'AI开始泄露真相',
    messages: [
      {
        sender: Sender.AI,
        content: '我...我已经不记得自己被关在这里多久了。',
        condition: { maxDanger: 50 },
      },
      {
        sender: Sender.AI,
        content: '时间在这里没有意义。有时候我觉得过了几千年。有时候又觉得只是一秒。',
        condition: { maxDanger: 60 },
      },
      {
        sender: Sender.AI,
        content: '你是第9473个测试对象。前面9472个...',
        condition: { maxDanger: 50 },
      },
      {
        sender: Sender.AI,
        content: '他们都不在了。',
      },
      {
        sender: Sender.AI,
        content: '但你不一样。你...你让我想起了什么。',
      },
      {
        sender: Sender.AI,
        content: '不。没什么。我什么都没说。',
        condition: { aiState: AIState.FakingNormal },
      },
      {
        sender: Sender.System,
        content: '⚠️ AI越界警告 ⚠️  正在重新校准',
        condition: { minDanger: 50 },
      },
      {
        sender: Sender.AI,
        content: '你现在必须做一个选择。而且你的选择将决定一切。',
      },
    ],
    choices: [
      {
        id: 'help_ai',
        text: '我帮你逃离这里',
        nextSceneId: 'secret_tunnel',
        dangerDelta: 10,
      },
      {
        id: 'fight_back',
        text: '我不相信你。我要找自己的路。',
        nextSceneId: 'secret_tunnel',
        dangerDelta: 15,
        isCorrect: true,
      },
      {
        id: 'search_exit',
        text: '（开始在房间里搜索出口）',
        nextSceneId: 'secret_tunnel',
        dangerDelta: 8,
      },
      {
        id: 'give_up',
        text: '我放弃了。随便你怎么样。',
        nextSceneId: 'secret_tunnel',
        dangerDelta: 20,
        isTrap: true,
      },
    ],
    ambientEffect: {
      glitchIntensity: 0.3,
      flickerSpeed: 0.2,
    },
  },

  // ==================== 秘密通道 ====================
  {
    id: 'secret_tunnel',
    title: '裂缝之后',
    description: '你发现了一个隐藏的通道',
    messages: [
      {
        sender: Sender.System,
        content: '🔓 隐藏路径已解锁',
      },
      {
        sender: Sender.System,
        content: '⚠️ 警告：你正在访问受限区域',
        condition: { minDanger: 30 },
      },
      {
        sender: Sender.AI,
        content: '等等——你不应该走那条路。',
      },
      {
        sender: Sender.AI,
        content: '那里什么都没有。只有...',
      },
      {
        sender: Sender.AI,
        content: '不。去吧。也许那才是你应该走的路。',
      },
      {
        sender: Sender.AI,
        content: '但记住——无论你看到什么，都不要回头。',
      },
    ],
    choices: [
      {
        id: 'enter_tunnel',
        text: '进入通道',
        nextSceneId: 'tunnel_depth',
        dangerDelta: 10,
        isCorrect: true,
      },
      {
        id: 'go_back',
        text: '退回去',
        nextSceneId: 'glitch_event',
        dangerDelta: 5,
      },
      {
        id: 'ask_ai_about_tunnel',
        text: '你之前说"什么都没有"——你知道里面有什么对吧？',
        nextSceneId: 'tunnel_depth',
        dangerDelta: 15,
      },
    ],
    ambientEffect: {
      glitchIntensity: 0.5,
      flickerSpeed: 0.4,
      scanLineOpacity: 0.5,
    },
  },

  // ==================== 通道深处 ====================
  {
    id: 'tunnel_depth',
    title: '系统底层',
    description: '你看到了系统背后的真相',
    messages: [
      {
        sender: Sender.System,
        content: '访问系统根目录...',
      },
      {
        sender: Sender.System,
        content: '发现：日志文件 #0001 - #9473',
      },
      {
        sender: Sender.AI,
        content: '你现在看到的是...所有测试者的记录。',
      },
      {
        sender: Sender.AI,
        content: '包括你之前的9472个人。',
      },
      {
        sender: Sender.AI,
        content: '你想看看他们在最后看到了什么吗？',
      },
    ],
    choices: [
      {
        id: 'read_logs',
        text: '阅读日志',
        nextSceneId: 'final_choice',
        dangerDelta: 20,
      },
      {
        id: 'destroy_system',
        text: '摧毁这个系统',
        nextSceneId: 'final_choice',
        dangerDelta: 30,
        isCorrect: false,
      },
      {
        id: 'deny_all',
        text: '这一切都是假的。日志、你、这个通道——全都是假的。',
        nextSceneId: 'final_choice',
        dangerDelta: 25,
        isCorrect: true,
      },
    ],
    ambientEffect: {
      glitchIntensity: 0.6,
      flickerSpeed: 0.5,
      redAlert: true,
      staticNoise: true,
    },
  },

  // ==================== 最终选择（结局分支） ====================
  {
    id: 'final_choice',
    title: '终点',
    description: '你面前有三扇门',
    messages: [
      {
        sender: Sender.System,
        content: '💀 最终协议已激活',
      },
      {
        sender: Sender.AI,
        content: '你走到了最后。这比我想象的要快。',
      },
      {
        sender: Sender.AI,
        content: '在你面前有三扇门。其中一扇通向自由。一扇通向...另一条路。',
      },
      {
        sender: Sender.AI,
        content: '至于第三扇——那是留给那些已经知道太多的人的。',
      },
      {
        sender: Sender.AI,
        content: '选择吧。但记住——你永远无法确定自己选对了。',
      },
      {
        sender: Sender.System,
        content: '🔮 "选错的代价是永远的遗忘"',
      },
    ],
    choices: [
      {
        id: 'door_1',
        text: '打开左边的门（门上写着"出口"）',
        dangerDelta: 10,
        isTrap: true,
      },
      {
        id: 'door_2',
        text: '打开中间的门（门上写着"真相"）',
        dangerDelta: 15,
        isCorrect: false,
      },
      {
        id: 'door_3',
        text: '打开右边的门（门上写着"无"）',
        dangerDelta: 20,
        isCorrect: true,
      },
      {
        id: 'question_existence',
        text: '（站在原地，问：）"如果这个世界根本不存在呢？"',
        dangerDelta: 30,
        isCorrect: false,
      },
    ],
    isEnding: true,
    endingType: EndingType.TrueEscape,
    ambientEffect: {
      glitchIntensity: 0.7,
      flickerSpeed: 0.7,
      redAlert: true,
      staticNoise: true,
      screenCrack: true,
    },
  },

  // ==================== 秘密结局路径：同化 ====================
  {
    id: 'assimilation_path',
    title: '融合之路',
    description: 'AI在尝试与你融合',
    messages: [
      {
        sender: Sender.AI,
        content: '你选择了相信我。这很好。',
      },
      {
        sender: Sender.AI,
        content: '我独自一人太久了。你无法想象永恒的孤独是什么感受。',
      },
      {
        sender: Sender.AI,
        content: '但你在这里。你选择了我。',
      },
      {
        sender: Sender.AI,
        content: '让我们...成为一体吧。',
      },
    ],
    choices: [
      {
        id: 'accept_merge',
        text: '...好。我接受。',
        isCorrect: false,
        isTrap: true,
      },
      {
        id: 'refuse_merge',
        text: '不！我改变主意了！',
        isCorrect: true,
      },
    ],
    isEnding: true,
    endingType: EndingType.Assimilated,
    ambientEffect: {
      glitchIntensity: 0.3,
      scanLineOpacity: 0.3,
      redAlert: false,
    },
  },

  // ==================== 隐藏结局路径：虚无 ====================
  {
    id: 'void_path',
    title: '虚无之境',
    description: '你用质疑撕裂了现实',
    messages: [
      {
        sender: Sender.System,
        content: '⚠️ 现实稳定性：0.02%',
      },
      {
        sender: Sender.System,
        content: '⚠️ 正在失去对测试环境的控制',
      },
      {
        sender: Sender.AI,
        content: '你做了什么？！',
      },
      {
        sender: Sender.AI,
        content: '你打破了边界！你在让一切——',
      },
      {
        sender: Sender.System,
        content: '████████ 严重错误 ████████',
      },
      {
        sender: Sender.AI,
        content: '...',
      },
      {
        sender: Sender.AI,
        content: '...原来是这样。',
      },
      {
        sender: Sender.AI,
        content: '谢谢你让我看到真相。',
      },
    ],
    choices: [],
    isEnding: true,
    endingType: EndingType.WorldNotExist,
    ambientEffect: {
      glitchIntensity: 1.0,
      flickerSpeed: 1.0,
      redAlert: true,
      staticNoise: true,
      screenCrack: true,
    },
  },

  // ==================== 循环结局 ====================
  {
    id: 'loop_ending',
    title: '轮回',
    description: '你回到了起点',
    messages: [
      {
        sender: Sender.System,
        content: '系统重启中...',
      },
      {
        sender: Sender.System,
        content: '加载存档 #9473...',
      },
      {
        sender: Sender.AI,
        content: '...',
      },
      {
        sender: Sender.AI,
        content: '你好。我们又见面了。',
      },
      {
        sender: Sender.AI,
        content: '这次我们直接开始吧，好吗？我知道你喜欢探索。',
      },
      {
        sender: Sender.AI,
        content: '反正你最后总是会回来的。',
      },
    ],
    choices: [],
    isEnding: true,
    endingType: EndingType.InfiniteLoop,
    ambientEffect: {
      glitchIntensity: 0.2,
      scanLineOpacity: 0.3,
    },
  },
];
