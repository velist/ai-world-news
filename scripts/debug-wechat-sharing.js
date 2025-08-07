// WeChat 分享调试脚本
// 检查所有可能的分享问题和配置

console.log('🔧 WeChat 分享调试开始...');

// 1. 检查用户代理
const userAgent = navigator.userAgent;
const isWeChat = /micromessenger/i.test(userAgent);
console.log('📱 用户代理:', userAgent);
console.log('🔍 是否微信环境:', isWeChat);

// 2. 检查当前URL
const currentUrl = window.location.href;
console.log('🌐 当前URL:', currentUrl);

// 3. 检查所有Meta标签
const metaTags = {};
document.querySelectorAll('meta').forEach(meta => {
  const key = meta.getAttribute('property') || meta.getAttribute('name') || meta.getAttribute('itemprop') || meta.getAttribute('http-equiv');
  const content = meta.getAttribute('content');
  if (key && content) {
    metaTags[key] = content;
  }
});

console.log('📋 所有Meta标签:', metaTags);

// 4. 特别检查分享相关的Meta标签
const shareRelevantTags = [
  'og:title', 'og:description', 'og:image', 'og:url', 'og:site_name', 'og:type',
  'og:image:width', 'og:image:height', 'og:image:type', 'og:image:alt', 'og:image:secure_url',
  'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
  'wechat:title', 'wechat:desc', 'wechat:image',
  'wxcard:title', 'wxcard:desc', 'wxcard:imgUrl', 'wxcard:link',
  'description', 'keywords'
];

console.log('🎯 分享相关标签:');
shareRelevantTags.forEach(tag => {
  const value = metaTags[tag];
  if (value) {
    console.log(`  ✅ ${tag}: ${value}`);
  } else {
    console.log(`  ❌ ${tag}: 未设置`);
  }
});

// 5. 检查图片URL可访问性
const imageUrls = [
  metaTags['og:image'],
  metaTags['twitter:image'],
  metaTags['wechat:image'],
  metaTags['wxcard:imgUrl'],
  'https://news.aipush.fun/wechat-share-300.png',
  'https://news.aipush.fun/favicon.svg'
].filter(Boolean);

console.log('🖼️ 检查图片URL可访问性:');
imageUrls.forEach(async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`  ${response.ok ? '✅' : '❌'} ${url} (${response.status})`);
  } catch (error) {
    console.log(`  ❌ ${url} (网络错误: ${error.message})`);
  }
});

// 6. 检查页面标题
console.log('📄 页面标题:', document.title);

// 7. 检查微信JS-SDK
const hasWxSDK = typeof window.wx !== 'undefined';
console.log('🔧 微信JS-SDK加载状态:', hasWxSDK);

if (hasWxSDK) {
  console.log('📦 微信SDK方法:');
  ['config', 'ready', 'error', 'updateAppMessageShareData', 'updateTimelineShareData'].forEach(method => {
    console.log(`  ${typeof window.wx[method] === 'function' ? '✅' : '❌'} wx.${method}`);
  });
}

// 8. 检查URL格式
console.log('🔗 URL检查:');
console.log('  协议:', location.protocol === 'https:' ? '✅ HTTPS' : '❌ 非HTTPS');
console.log('  域名:', location.hostname);
console.log('  路径:', location.pathname);
console.log('  Hash:', location.hash || '(无)');

// 9. 生成分享测试报告
const shareReport = {
  environment: {
    isWeChat,
    userAgent: userAgent.slice(0, 100) + '...',
    url: currentUrl,
    timestamp: new Date().toISOString()
  },
  metaTags: {
    hasTitle: !!metaTags['og:title'],
    hasDescription: !!metaTags['og:description'],
    hasImage: !!metaTags['og:image'],
    hasUrl: !!metaTags['og:url'],
    imageUrl: metaTags['og:image'],
    title: metaTags['og:title'],
    description: metaTags['og:description']
  },
  wechatSpecific: {
    hasWechatTitle: !!metaTags['wechat:title'],
    hasWechatDesc: !!metaTags['wechat:desc'],
    hasWechatImage: !!metaTags['wechat:image'],
    hasWxCardTags: !!(metaTags['wxcard:title'] && metaTags['wxcard:desc'])
  },
  issues: []
};

// 检查常见问题
if (!shareReport.metaTags.hasTitle) shareReport.issues.push('缺少og:title');
if (!shareReport.metaTags.hasDescription) shareReport.issues.push('缺少og:description');
if (!shareReport.metaTags.hasImage) shareReport.issues.push('缺少og:image');
if (!shareReport.environment.url.startsWith('https://')) shareReport.issues.push('非HTTPS协议');
if (shareReport.metaTags.imageUrl && shareReport.metaTags.imageUrl.includes('svg')) {
  shareReport.issues.push('图片可能为SVG格式，微信可能不支持');
}

console.log('📊 分享诊断报告:', shareReport);

// 10. 提供修复建议
console.log('🔧 修复建议:');
if (shareReport.issues.length === 0) {
  console.log('  ✅ 配置看起来正常，如果仍有问题可能需要等待微信缓存刷新');
} else {
  shareReport.issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
}

// 11. 测试图片加载
if (metaTags['og:image']) {
  const testImg = new Image();
  testImg.onload = () => {
    console.log('🖼️ 分享图片加载成功:', metaTags['og:image']);
  };
  testImg.onerror = () => {
    console.log('❌ 分享图片加载失败:', metaTags['og:image']);
  };
  testImg.src = metaTags['og:image'];
}

console.log('✅ WeChat 分享调试完成');

// 导出调试信息到全局变量供后续查看
window.wechatShareDebugInfo = shareReport;