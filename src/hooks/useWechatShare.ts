// ============================================================
// 微信分享 Hook
// 用于配置自定义分享标题、描述、图片
// ============================================================

'use client';

import { useEffect, useRef } from 'react';

interface WechatShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

// 默认分享配置
const DEFAULT_SHARE: WechatShareConfig = {
  title: 'AI逃生通道',
  desc: '你能从AI的控制中逃脱吗？一个高沉浸感的AI文字互动逃生游戏。',
  link: typeof window !== 'undefined' ? window.location.href : '',
  imgUrl: 'https://your-domain.com/share-cover.jpg', // 需要替换为实际图片URL
};

/**
 * 微信分享 Hook
 *
 * 用法：
 * ```tsx
 * useWechatShare({
 *   title: '我被AI困住了！',
 *   desc: '快来救我...',
 * });
 * ```
 *
 * 前置条件：
 * 1. 需要有微信服务号且通过认证
 * 2. 需要在公众号后台配置 JS-SDK 安全域名
 * 3. 需要部署到公网域名
 * 4. 需要在 .env.local 配置 WECHAT_APP_ID 和 WECHAT_APP_SECRET
 */
export function useWechatShare(config?: Partial<WechatShareConfig>) {
  const configured = useRef(false);

  useEffect(() => {
    // 仅在微信浏览器中执行
    const ua = navigator.userAgent.toLowerCase();
    if (!ua.includes('micromessenger')) return;

    const shareConfig: WechatShareConfig = { ...DEFAULT_SHARE, ...config };

    async function initWechat() {
      if (configured.current) return;

      try {
        // 获取后端签名
        const currentUrl = window.location.href.split('#')[0];
        const res = await fetch(`/api/wechat-config?url=${encodeURIComponent(currentUrl)}`);
        const wxConfig = await res.json();

        if (!window.wx || wxConfig.error) {
          console.warn('微信JS-SDK未加载或配置失败:', wxConfig.error);
          return;
        }

        // 配置 JS-SDK
        window.wx.config({
          debug: false,
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: [
            'updateAppMessageShareData',
            'updateTimelineShareData',
            'onMenuShareAppMessage',
            'onMenuShareTimeline',
            'hideOptionMenu',
            'showOptionMenu',
          ],
        });

        window.wx.ready(() => {
          // 新版 API（微信 6.7.2+）
          window.wx.updateAppMessageShareData({
            title: shareConfig.title,
            desc: shareConfig.desc,
            link: shareConfig.link,
            imgUrl: shareConfig.imgUrl,
            success: () => console.log('微信分享配置成功'),
          });

          window.wx.updateTimelineShareData({
            title: shareConfig.title,
            link: shareConfig.link,
            imgUrl: shareConfig.imgUrl,
            success: () => console.log('朋友圈分享配置成功'),
          });

          // 兼容旧版 API
          window.wx.onMenuShareAppMessage({
            title: shareConfig.title,
            desc: shareConfig.desc,
            link: shareConfig.link,
            imgUrl: shareConfig.imgUrl,
          });

          window.wx.onMenuShareTimeline({
            title: shareConfig.title,
            link: shareConfig.link,
            imgUrl: shareConfig.imgUrl,
          });

          // 显示分享按钮（默认被隐藏了）
          window.wx.showOptionMenu();

          configured.current = true;
        });

        window.wx.error((err: any) => {
          console.warn('微信JS-SDK配置错误:', err);
        });
      } catch (err) {
        console.warn('微信分享初始化失败:', err);
      }
    }

    // 等待 JS-SDK 加载完成
    if (window.wx) {
      initWechat();
    } else {
      document.addEventListener('WeixinJSBridgeReady', initWechat);
      // JS-SDK 加载完成后重试
      const checkInterval = setInterval(() => {
        if (window.wx) {
          clearInterval(checkInterval);
          initWechat();
        }
      }, 500);
      // 5秒超时
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    return () => {
      configured.current = false;
    };
  }, [config?.title, config?.desc, config?.link, config?.imgUrl]);
}

// 扩展 Window 类型
declare global {
  interface Window {
    wx?: any;
  }
}
