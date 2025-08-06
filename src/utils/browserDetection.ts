/**
 * 浏览器检测工具
 * 用于检测微信浏览器和其他移动设备
 */

/**
 * 检测是否为微信浏览器
 */
export const isWeChatBrowser = (): boolean => {
  return /micromessenger/i.test(navigator.userAgent);
};

/**
 * 检测是否为移动设备
 */
export const isMobileBrowser = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 检测是否为iOS设备
 */
export const isIOSBrowser = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * 获取浏览器类型
 */
export const getBrowserType = (): string => {
  if (isWeChatBrowser()) return 'wechat';
  if (isMobileBrowser()) return 'mobile';
  return 'desktop';
};

/**
 * 检测是否支持History API
 */
export const supportsHistoryAPI = (): boolean => {
  return !!(window.history && window.history.pushState);
};

/**
 * 获取完整的用户代理信息
 */
export const getUserAgentInfo = (): string => {
  return navigator.userAgent;
};

/**
 * 检测是否为微信环境并支持JS-SDK
 */
export const isWeChatJSReady = (): boolean => {
  return typeof (window as any).WeixinJSBridge !== 'undefined';
};

/**
 * 等待微信JS-SDK就绪
 */
export const waitForWeChatJS = (callback: () => void): void => {
  if (isWeChatJSReady()) {
    callback();
  } else {
    document.addEventListener('WeixinJSBridgeReady', callback);
  }
};

/**
 * 浏览器信息集合
 */
export const browserInfo = {
  isWeChat: isWeChatBrowser(),
  isMobile: isMobileBrowser(),
  isIOS: isIOSBrowser(),
  supportsHistory: supportsHistoryAPI(),
  type: getBrowserType(),
  userAgent: getUserAgentInfo(),
  wechatJSReady: isWeChatJSReady()
};

export default browserInfo;