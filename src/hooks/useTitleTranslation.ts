import { useLanguage } from '@/contexts/LanguageContext';

export const useTitleTranslation = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const improveTitle = (title: string) => {
    if (!title) return '';
    
    // 如果是中文模式，处理可能的翻译问题
    if (isZh) {
      // 检测是否包含英文内容但没有完全翻译
      const hasEnglish = /[a-zA-Z]/.test(title);
      const hasChinese = /[\u4e00-\u9fa5]/.test(title);
      
      // 如果标题包含英文和中文混合，并且看起来像是不完整的翻译
      if (hasEnglish && hasChinese) {
        // 移除常见的英文网站后缀
        title = title.replace(/\s*[-–—|]\s*[A-Za-z\s\.]+\.(com|org|net|ai|co|io|gov|edu|mil).*$/i, '');
        title = title.replace(/\s*[-–—|]\s*[A-Za-z\s\.]+$/i, '');
        
        // 移除常见的英文媒体名称和来源
        const mediaNames = [
          'Reuters', 'Bloomberg', 'TechCrunch', 'The Verge', 'Wired', 'Ars Technica', 
          'Engadget', 'CNET', 'ZDNet', 'Fortune', 'Forbes', 'Wall Street Journal', 
          'New York Times', 'Washington Post', 'BBC', 'CNN', 'NBC', 'ABC', 'CBS', 'NPR',
          'Associated Press', 'AP News', 'Business Insider', 'Axios', 'Politico', 
          'The Guardian', 'Financial Times', 'Economist', 'Time', 'Newsweek', 'BizToc',
          'NaturalNews.com', 'News Directory', 'The News International', 'WebProNews'
        ];
        
        for (const media of mediaNames) {
          const regex = new RegExp(`\\s*[-–—|]\\s*${media}.*$`, 'i');
          title = title.replace(regex, '');
        }
        
        // 移除URL相关内容
        title = title.replace(/https?:\/\/[^\s]+/gi, '');
        
        // 移除数字编号（如 "新闻目录3"）
        title = title.replace(/\s*[-–—|]\s*新闻目录\s*\d*$/i, '');
        title = title.replace(/\s*[-–—|]\s*News Directory\s*\d*$/i, '');
        
        // 清理多余的空格和标点
        title = title.replace(/\s+/g, ' ').trim();
        title = title.replace(/[,，。.!！?？;；:：]*$/, '');
      }
      
      // 处理特殊的翻译问题 - 检测明显错误的翻译提示
      if (title.includes('请提供您希望翻译的英文内容') || 
          title.includes('我会为您进行专业的翻译') ||
          title.includes('请提供完整的英文文本') ||
          title.includes('请提供您需要翻译的') ||
          title.includes('请提供需要翻译的英文内容')) {
        return '新闻标题生成中...';
      }
      
      // 如果标题太长，进行合理截断
      if (title.length > 60) {
        title = title.substring(0, 57) + '...';
      }
      
      // 确保标题不为空
      if (!title.trim()) {
        return '标题获取中...';
      }
    } else {
      // 英文模式下的处理
      if (title.length > 80) {
        title = title.substring(0, 77) + '...';
      }
      
      if (!title.trim()) {
        return 'Loading title...';
      }
    }
    
    return title.trim();
  };

  const improveSummary = (summary: string) => {
    if (!summary) return isZh ? '暂无摘要' : 'No summary available';
    
    if (isZh) {
      // 中文摘要处理
      if (summary.length > 150) {
        summary = summary.substring(0, 147) + '...';
      }
    } else {
      // 英文摘要处理
      if (summary.length > 200) {
        summary = summary.substring(0, 197) + '...';
      }
    }
    
    return summary.trim();
  };

  return {
    improveTitle,
    improveSummary
  };
};