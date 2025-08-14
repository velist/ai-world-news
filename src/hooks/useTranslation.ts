import { useLanguage } from '@/contexts/LanguageContext';
import { translations, interpolate, type AllTranslationKeys } from '@/i18n/translations';

// 获取嵌套对象属性的辅助函数
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  /**
   * 获取翻译文本
   * @param key - 翻译键，支持嵌套路径如 'header.title'
   * @param params - 字符串插值参数
   */
  const t = (key: AllTranslationKeys | string, params: (string | number)[] = []): string => {
    const translationData = translations[language as keyof typeof translations];
    const value = getNestedValue(translationData, key);
    
    if (typeof value === 'string') {
      return params.length > 0 ? interpolate(value, params) : value;
    }
    
    // 如果找不到翻译，返回键名作为备选
    console.warn(`Translation missing for key: ${key} in language: ${language}`);
    return key;
  };
  
  /**
   * 获取复数形式的翻译
   * @param key - 翻译键
   * @param count - 数量
   * @param params - 其他插值参数
   */
  const tn = (key: string, count: number, params: (string | number)[] = []): string => {
    // 简单的复数处理逻辑
    const singularKey = key;
    const pluralKey = `${key}_plural`;
    
    const useKey = count === 1 ? singularKey : pluralKey;
    return t(useKey, [count, ...params]);
  };
  
  /**
   * 格式化时间相对显示
   * @param date - 日期对象或时间戳
   */
  const formatTimeAgo = (date: Date | number): string => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMinutes < 1) {
      return t('time.justNow');
    } else if (diffMinutes < 60) {
      return t('time.minutesAgo', [diffMinutes]);
    } else if (diffHours < 24) {
      return t('time.hoursAgo', [diffHours]);
    } else if (diffDays < 7) {
      return t('time.daysAgo', [diffDays]);
    } else if (diffWeeks < 4) {
      return t('time.weeksAgo', [diffWeeks]);
    } else {
      return t('time.monthsAgo', [diffMonths]);
    }
  };
  
  /**
   * 格式化数字显示
   * @param num - 数字
   * @param options - 格式化选项
   */
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(num);
  };
  
  /**
   * 格式化日期显示
   * @param date - 日期对象或时间戳
   * @param options - 格式化选项
   */
  const formatDate = (date: Date | number, options?: Intl.DateTimeFormatOptions): string => {
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
  };
  
  /**
   * 获取当前语言的文本方向
   */
  const getTextDirection = (): 'ltr' | 'rtl' => {
    // 大多数语言是从左到右，阿拉伯语等是从右到左
    return 'ltr';
  };
  
  /**
   * 获取语言相关的CSS类名
   */
  const getLanguageClass = (): string => {
    return `lang-${language}`;
  };
  
  return {
    t,
    tn,
    formatTimeAgo,
    formatNumber,
    formatDate,
    getTextDirection,
    getLanguageClass,
    currentLanguage: language,
    isZh: language === 'zh',
    isEn: language === 'en'
  };
};