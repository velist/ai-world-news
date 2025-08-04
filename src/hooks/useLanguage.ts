import { useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    // 从localStorage获取保存的语言设置，默认为中文
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'zh';
  });

  useEffect(() => {
    // 保存语言设置到localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
    isZh: language === 'zh',
    isEn: language === 'en'
  };
};