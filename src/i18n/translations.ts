// 完整的多语言文本资源
export const translations = {
  zh: {
    // 页面标题和描述
    siteName: 'AI推',
    siteDescription: '实时AI新闻推送系统 - 人工智能资讯中心',
    
    // 头部导航
    header: {
      title: '实时AI新闻推送系统',
      subtitle: '国际新闻推送 · AI翻译 · AI点评',
      joinCommunity: '点击加入AI交流社群，一起成长',
      copySuccess: '复制成功，打开微信搜索！'
    },
    
    // 菜单项
    menu: {
      home: '首页',
      blog: '博客',
      about: '关于我们',
      services: '服务',
      contact: '联系我们',
      dailyBriefing: '每日简报',
      rssSubscribe: 'RSS订阅',
      disclaimer: '免责声明',
      websiteIntro: '网站介绍',
      gpt5Analysis: 'GPT-5定价分析'
    },
    
    // 新闻分类
    categories: {
      all: '全部',
      technology: '科技',
      business: '商业',
      research: '研究',
      product: '产品',
      policy: '政策',
      investment: '投资',
      startup: '创业',
      education: '教育'
    },
    
    // 新闻卡片
    newsCard: {
      readMore: '阅读更多',
      originalSource: '原文链接',
      publishedAt: '发布时间',
      category: '分类',
      aiTranslated: 'AI翻译',
      aiSummary: 'AI摘要',
      share: '分享',
      like: '点赞',
      comment: '评论'
    },
    
    // 时间格式
    time: {
      justNow: '刚刚',
      minutesAgo: '{0}分钟前',
      hoursAgo: '{0}小时前',
      daysAgo: '{0}天前',
      weeksAgo: '{0}周前',
      monthsAgo: '{0}个月前'
    },
    
    // 加载状态
    loading: {
      news: '新闻加载中...',
      more: '加载更多...',
      refreshing: '刷新中...',
      searching: '搜索中...',
      processing: '处理中...'
    },
    
    // 错误信息
    error: {
      networkError: '网络连接失败，请检查网络设置',
      loadFailed: '加载失败，请稍后重试',
      notFound: '内容未找到',
      serverError: '服务器错误，请稍后重试',
      translateFailed: '翻译失败，显示原文',
      imageLoadFailed: '图片加载失败'
    },
    
    // 博客相关
    blog: {
      title: 'AI推博客',
      subtitle: '深度解读AI行业动态',
      readTime: '阅读时间',
      minutes: '分钟',
      tags: '标签',
      relatedArticles: '相关文章',
      shareArticle: '分享文章',
      backToBlog: '返回博客列表',
      noArticles: '暂无文章',
      searchPlaceholder: '搜索文章...'
    },
    
    // 表单和输入
    form: {
      search: '搜索',
      email: '邮箱地址',
      subscribe: '订阅',
      send: '发送',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      edit: '编辑',
      delete: '删除',
      submit: '提交',
      reset: '重置'
    },
    
    // 通用文本
    common: {
      yes: '是',
      no: '否',
      ok: '确定',
      close: '关闭',
      next: '下一页',
      prev: '上一页',
      page: '第{0}页',
      total: '共{0}条',
      all: '全部',
      none: '暂无',
      loading: '加载中...',
      retry: '重试',
      refresh: '刷新',
      copy: '复制',
      share: '分享',
      download: '下载'
    },
    
    // SEO相关
    seo: {
      metaDescription: 'AI推专业的AI新闻资讯平台，实时推送ChatGPT、OpenAI、Google AI等人工智能新闻。智能翻译国际AI科技资讯，深度解读机器学习、深度学习前沿技术动态。',
      keywords: 'AI新闻,人工智能新闻,ChatGPT新闻,OpenAI新闻,机器学习资讯,深度学习新闻,AI科技,人工智能技术,AI推,AI资讯平台',
      ogTitle: 'AI推 - 实时AI新闻推送系统',
      ogDescription: '实时推送全球AI科技新闻，智能翻译和深度点评，为中文用户提供最新的人工智能资讯。'
    }
  },
  
  en: {
    // Page titles and descriptions
    siteName: 'AI Push',
    siteDescription: 'Real-time AI News System - Artificial Intelligence Information Center',
    
    // Header navigation
    header: {
      title: 'Real-time AI News System',
      subtitle: 'Global News · AI Translation · AI Analysis',
      joinCommunity: 'Join AI Community for Growth',
      copySuccess: 'Copied! Search in WeChat!'
    },
    
    // Menu items
    menu: {
      home: 'Home',
      blog: 'Blog',
      about: 'About',
      services: 'Services',
      contact: 'Contact',
      dailyBriefing: 'Daily Briefing',
      rssSubscribe: 'RSS Subscribe',
      disclaimer: 'Disclaimer',
      websiteIntro: 'Website Intro',
      gpt5Analysis: 'GPT-5 Pricing Analysis'
    },
    
    // News categories
    categories: {
      all: 'All',
      technology: 'Technology',
      business: 'Business',
      research: 'Research',
      product: 'Product',
      policy: 'Policy',
      investment: 'Investment',
      startup: 'Startup',
      education: 'Education'
    },
    
    // News card
    newsCard: {
      readMore: 'Read More',
      originalSource: 'Original Source',
      publishedAt: 'Published',
      category: 'Category',
      aiTranslated: 'AI Translated',
      aiSummary: 'AI Summary',
      share: 'Share',
      like: 'Like',
      comment: 'Comment'
    },
    
    // Time format
    time: {
      justNow: 'Just now',
      minutesAgo: '{0} minutes ago',
      hoursAgo: '{0} hours ago',
      daysAgo: '{0} days ago',
      weeksAgo: '{0} weeks ago',
      monthsAgo: '{0} months ago'
    },
    
    // Loading states
    loading: {
      news: 'Loading news...',
      more: 'Load more...',
      refreshing: 'Refreshing...',
      searching: 'Searching...',
      processing: 'Processing...'
    },
    
    // Error messages
    error: {
      networkError: 'Network connection failed, please check your network settings',
      loadFailed: 'Load failed, please try again later',
      notFound: 'Content not found',
      serverError: 'Server error, please try again later',
      translateFailed: 'Translation failed, showing original text',
      imageLoadFailed: 'Image load failed'
    },
    
    // Blog related
    blog: {
      title: 'AI Push Blog',
      subtitle: 'In-depth Analysis of AI Industry Trends',
      readTime: 'Read time',
      minutes: 'minutes',
      tags: 'Tags',
      relatedArticles: 'Related Articles',
      shareArticle: 'Share Article',
      backToBlog: 'Back to Blog',
      noArticles: 'No articles found',
      searchPlaceholder: 'Search articles...'
    },
    
    // Forms and inputs
    form: {
      search: 'Search',
      email: 'Email Address',
      subscribe: 'Subscribe',
      send: 'Send',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      submit: 'Submit',
      reset: 'Reset'
    },
    
    // Common text
    common: {
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      next: 'Next',
      prev: 'Previous',
      page: 'Page {0}',
      total: 'Total {0} items',
      all: 'All',
      none: 'None',
      loading: 'Loading...',
      retry: 'Retry',
      refresh: 'Refresh',
      copy: 'Copy',
      share: 'Share',
      download: 'Download'
    },
    
    // SEO related
    seo: {
      metaDescription: 'AI Push professional AI news platform, real-time ChatGPT, OpenAI, Google AI artificial intelligence news. Smart translation of international AI tech news, in-depth interpretation of machine learning and deep learning trends.',
      keywords: 'AI news,artificial intelligence news,ChatGPT news,OpenAI news,machine learning,deep learning news,AI technology,AI Push,AI news platform',
      ogTitle: 'AI Push - Real-time AI News System',
      ogDescription: 'Real-time global AI tech news, intelligent translation and in-depth analysis for latest AI insights.'
    }
  }
} as const;

// 类型定义
export type TranslationKey = keyof typeof translations.zh;
export type NestedTranslationKey<T> = T extends object ? {
  [K in keyof T]: T[K] extends object 
    ? `${string & K}.${NestedTranslationKey<T[K]>}`
    : string & K;
}[keyof T] : never;

export type AllTranslationKeys = NestedTranslationKey<typeof translations.zh>;

// 字符串插值函数
export const interpolate = (str: string, params: (string | number)[]): string => {
  return str.replace(/\{(\d+)\}/g, (match, index) => {
    const paramIndex = parseInt(index, 10);
    return params[paramIndex] !== undefined ? String(params[paramIndex]) : match;
  });
};