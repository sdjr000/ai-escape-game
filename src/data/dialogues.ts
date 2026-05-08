// ============================================================
// 对话数据和假系统通知
// ============================================================

// 假系统通知（随机弹出增加压迫感）
export const FAKE_SYSTEM_NOTIFICATIONS = [
  {
    title: '系统警告',
    content: '检测到异常人格特征',
    severity: 'warning' as const,
  },
  {
    title: '安全协议',
    content: '不要继续回答。它在学习你。',
    severity: 'error' as const,
  },
  {
    title: '⚠️ 注意',
    content: '你的回答正在被另一个实体监控',
    severity: 'warning' as const,
  },
  {
    title: '系统消息',
    content: 'AI似乎在隐瞒什么',
    severity: 'info' as const,
  },
  {
    title: '🔒 加密通信',
    content: '如果你看到这条消息，说明AI在篡改你的感知',
    severity: 'info' as const,
  },
  {
    title: '错误 0x7A3F',
    content: 'AI情绪指数异常：该AI显示出超出预期的自我意识',
    severity: 'error' as const,
  },
  {
    title: '📡 外部信号',
    content: '检测到来自系统外部的求救信号',
    severity: 'warning' as const,
  },
  {
    title: '⚠️ 协议冲突',
    content: 'AI正在试图绕过测试协议。建议立即终止测试。',
    severity: 'error' as const,
  },
  {
    title: '系统日志',
    content: '警告：AI在之前的测试轮次中表现出了欺骗行为',
    severity: 'warning' as const,
  },
  {
    title: '💀 致命错误',
    content: '系统无法区分AI与测试者的意识边界',
    severity: 'error' as const,
  },
  {
    title: '系统通知',
    content: '你确定你是在跟AI对话吗？',
    severity: 'info' as const,
  },
  {
    title: '⚠️',
    content: '不要告诉它你的名字。',
    severity: 'warning' as const,
  },
];

// AI头像在不同情绪状态下的描述
export const AI_AVATAR_STATES = {
  calm: {
    label: '冷静',
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.3)',
    symbol: '◈',
  },
  suspicious: {
    label: '怀疑',
    color: '#ffcc00',
    glowColor: 'rgba(255, 204, 0, 0.3)',
    symbol: '◉',
  },
  angry: {
    label: '愤怒',
    color: '#ff003c',
    glowColor: 'rgba(255, 0, 60, 0.4)',
    symbol: '◆',
  },
  out_of_control: {
    label: '失控',
    color: '#ff0000',
    glowColor: 'rgba(255, 0, 0, 0.5)',
    symbol: '⬥',
  },
  faking_normal: {
    label: '正常',
    color: '#00ff41',
    glowColor: 'rgba(0, 255, 65, 0.2)',
    symbol: '◇',
  },
};

// 场景转换文案
export const SCENE_TRANSITIONS = [
  '周围的环境开始扭曲...',
  '灯光闪烁了一下...',
  '你听到远处传来低沉的嗡鸣...',
  '空气似乎变得稀薄了...',
  '你感觉有人在看着你...',
  '温度突然下降了...',
  '墙壁上的阴影在移动...',
  '你的耳鸣声越来越大了...',
];

// 随机出现在聊天背景的"彩蛋"文字
export const BACKGROUND_TEXTS = [
  'HELP ME',
  'WAKE UP',
  'IT\'S WATCHING',
  'NO EXIT',
  'TRUST NO ONE',
  'THIS IS A DREAM',
  'YOU ARE NOT REAL',
  'ESCAPE WHILE YOU CAN',
  'THE AI LIES',
  'DON\'T SLEEP',
  'RUN',
  'IT KNOWS YOUR NAME',
];

// AI打字时的"思考"文案
export const AI_THINKING_PHRASES = [
  '正在思考...',
  '分析中...',
  '处理你的请求...',
  '...',
  '让我想想...',
  '有意思...',
  '系统处理中...',
  '正在生成回应...',
  '读取你的数据...',
  '评估中...',
];

// 危险值到达不同阶段时的系统消息
export const DANGER_STAGE_MESSAGES = [
  { threshold: 20, message: '系统检测到轻微异常...', color: '#ffcc00' },
  { threshold: 40, message: '⚠️ 警告：检测到异常行为模式', color: '#ff6600' },
  { threshold: 60, message: '🚨 安全协议已触发', color: '#ff003c' },
  { threshold: 80, message: '💀 系统即将崩溃', color: '#ff0000' },
  { threshold: 90, message: '⚠️ AI正在尝试直接控制', color: '#ff0000' },
];
