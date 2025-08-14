import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * 多语言路由工具
 */
export const useI18nRouter = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  /**
   * 生成多语言URL
   * @param path - 路径
   * @param lang - 语言（可选，默认使用当前语言）
   */
  const createLocalizedUrl = (path: string, lang?: string): string => {
    const targetLang = lang || language;
    const basePath = path.startsWith('/') ? path : `/${path}`;
    
    // 如果是默认语言（中文），不添加语言前缀
    if (targetLang === 'zh') {
      return basePath;
    }
    
    return `/en${basePath}`;
  };
  
  /**
   * 生成当前页面的其他语言版本URL
   * @param currentPath - 当前路径
   */
  const getAlternateUrls = (currentPath: string) => {
    const cleanPath = currentPath.replace(/^\/en/, '');
    
    return {
      zh: cleanPath || '/',
      en: `/en${cleanPath || '/'}`
    };
  };
  
  /**
   * 从URL中提取语言
   * @param url - URL路径
   */
  const extractLanguageFromPath = (url: string): { language: 'zh' | 'en'; path: string } => {
    if (url.startsWith('/en/') || url === '/en') {
      return {
        language: 'en',
        path: url.replace(/^\/en/, '') || '/'
      };
    }
    
    return {
      language: 'zh',
      path: url
    };
  };
  
  return {
    createLocalizedUrl,
    getAlternateUrls,
    extractLanguageFromPath
  };
};

/**
 * 多语言SEO工具
 */
export const useI18nSEO = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { getAlternateUrls } = useI18nRouter();
  
  /**
   * 生成多语言meta标签
   * @param options - SEO选项
   */
  const generateI18nMeta = (options: {
    title?: string;
    description?: string;
    keywords?: string;
    currentPath?: string;
    ogImage?: string;
    ogType?: string;
  }) => {
    const {
      title,
      description,
      keywords,
      currentPath = '/',
      ogImage = '/favicon.svg',
      ogType = 'website'
    } = options;
    
    const siteUrl = 'https://news.aipush.fun';
    const alternateUrls = getAlternateUrls(currentPath);
    
    const metaTitle = title || t('seo.ogTitle');
    const metaDescription = description || t('seo.metaDescription');
    const metaKeywords = keywords || t('seo.keywords');
    
    return {
      title: metaTitle,
      description: metaDescription,
      keywords: metaKeywords,
      canonical: `${siteUrl}${alternateUrls[language]}`,
      alternate: {
        zh: `${siteUrl}${alternateUrls.zh}`,
        en: `${siteUrl}${alternateUrls.en}`
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${siteUrl}${alternateUrls[language]}`,
        type: ogType,
        image: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
        locale: language === 'zh' ? 'zh_CN' : 'en_US',
        site_name: t('siteName')
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        image: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: t('siteName'),
        alternateName: language === 'zh' ? 'AI Push' : 'AI推',
        url: `${siteUrl}${alternateUrls[language]}`,
        description: metaDescription,
        inLanguage: language === 'zh' ? 'zh-CN' : 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}${alternateUrls[language]}?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    };
  };
  
  /**
   * 生成hreflang标签数据
   * @param currentPath - 当前路径
   */
  const generateHreflang = (currentPath: string) => {
    const siteUrl = 'https://news.aipush.fun';
    const alternateUrls = getAlternateUrls(currentPath);
    
    return [
      {
        hreflang: 'zh',
        href: `${siteUrl}${alternateUrls.zh}`
      },
      {
        hreflang: 'en',
        href: `${siteUrl}${alternateUrls.en}`
      },
      {
        hreflang: 'x-default',
        href: `${siteUrl}${alternateUrls.zh}` // 默认使用中文版本
      }
    ];
  };
  
  return {
    generateI18nMeta,
    generateHreflang
  };
};