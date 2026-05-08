import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI逃生通道',
  description: '一个高沉浸感、强压迫感的AI文字互动逃生游戏。你能从AI的控制中逃脱吗？',
  openGraph: {
    title: 'AI逃生通道',
    description: '一个高沉浸感、强压迫感的AI文字互动逃生游戏。你能从AI的控制中逃脱吗？',
    type: 'website',
  },
  other: {
    'wechat-title': 'AI逃生通道',
    'wechat-description': '你能从AI的控制中逃脱吗？',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 微信分享 JS-SDK */}
        <script
          src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"
          async
        />
        {/* 全屏沉浸 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* 禁止微信内置浏览器调整字体 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof WeixinJSBridge !== 'undefined') {
                WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
                WeixinJSBridge.on('menu:setfont', function() {
                  WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
                });
              }
            `,
          }}
        />
      </head>
      <body className="h-full w-full overflow-hidden">
        <div
          id="game-root"
          className="h-full w-full max-w-md mx-auto relative"
          style={{
            background: '#0a0a0a',
            minHeight: '-webkit-fill-available',
          }}
        >
          {children}
        </div>

        {/* 微信分享初始化脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 微信分享配置
              document.addEventListener('WeixinJSBridgeReady', function() {
                // 隐藏微信分享按钮
                if (typeof WeixinJSBridge !== 'undefined') {
                  WeixinJSBridge.call('hideOptionMenu');
                }
              });

              // 阻止微信下拉（网页内）
              document.addEventListener('touchmove', function(e) {
                if (e.target === document.documentElement || e.target === document.body) {
                  e.preventDefault();
                }
              }, { passive: false });
            `,
          }}
        />
      </body>
    </html>
  );
}
