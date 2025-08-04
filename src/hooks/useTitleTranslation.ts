import { useLanguage } from '@/hooks/useLanguage';

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
        title = title.replace(/\s*-\s*[A-Za-z\s\.]+\.(com|org|net|ai|co|io)$/i, '');
        title = title.replace(/\s*\|\s*[A-Za-z\s\.]+$/i, '');
        title = title.replace(/\s*—\s*[A-Za-z\s\.]+$/i, '');
        title = title.replace(/\s*–\s*[A-Za-z\s\.]+$/i, '');
        
        // 移除常见的英文媒体名称
        title = title.replace(/\s*-\s*(Reuters|Bloomberg|TechCrunch|The Verge|Wired|Ars Technica|Engadget|CNET|ZDNet|Fortune|Forbes|Wall Street Journal|New York Times|Washington Post|BBC|CNN|NBC|ABC|CBS|NPR|Associated Press|AP News|Business Insider|Axios|Politico|The Guardian|Financial Times|Economist|Time|Newsweek|USA Today|LA Times|Chicago Tribune|Boston Globe|MIT Technology Review|Harvard Business Review|McKinsey|Deloitte|PwC|KPMG|Ernst & Young|Accenture|IBM|Microsoft|Google|Apple|Amazon|Meta|Tesla|SpaceX|OpenAI|Anthropic|DeepMind|Nvidia|Intel|AMD|Qualcomm|Samsung|Sony|Huawei|Alibaba|Tencent|Baidu|ByteDance|TikTok|Twitter|Facebook|Instagram|LinkedIn|YouTube|Netflix|Spotify|Uber|Lyft|Airbnb|PayPal|Visa|Mastercard|American Express|JPMorgan|Goldman Sachs|Morgan Stanley|Bank of America|Wells Fargo|Citigroup|HSBC|Barclays|Deutsche Bank|Credit Suisse|UBS|ING|Santander|BNP Paribas|Societe Generale|UniCredit|Intesa Sanpaolo|Banco Santander|BBVA|CaixaBank|Nordea|Swedbank|DNB|Danske Bank|ABN AMRO|Rabobank|Commonwealth Bank|ANZ|Westpac|NAB|Royal Bank of Canada|TD Bank|Bank of Montreal|Scotiabank|CIBC|National Bank of Canada|Manulife|Sun Life|Great-West Lifeco|Power Corporation|Brookfield|Shopify|Canadian National Railway|Canadian Pacific Railway|Enbridge|TC Energy|Suncor|Canadian Natural Resources|Nutrien|Barrick Gold|Newmont|Franco-Nevada|Wheaton Precious Metals|Kirkland Lake Gold|Yamana Gold|Kinross Gold|Eldorado Gold|Iamgold|Centerra Gold|Alamos Gold|Torex Gold|B2Gold|Pan American Silver|First Majestic Silver|Hecla Mining|Coeur Mining|Fortuna Silver|MAG Silver|Endeavour Silver|First Quantum Minerals|Lundin Mining|Teck Resources|Hudbay Minerals|Capstone Mining|Taseko Mines|Copper Mountain Mining|Gibraltar Mines|Highland Copper|Trilogy Metals|Northern Dynasty Minerals|Copper Fox Metals|Arizona Mining|Excelsior Mining|Florence Copper|Rosemont Copper|Resolution Copper|Morenci|Bagdad|Sierrita|Mission|Pinto Valley|Ray|Miami|Carlota|Safford|Tyrone|Chino|Santa Rita|Silver Bell|Mineral Park|Bagdad|Cyprus|Sierrita|Mission|Pinto Valley|Ray|Miami|Carlota|Safford|Tyrone|Chino|Santa Rita|Silver Bell|Mineral Park).*$/i, '');
        
        // 移除URL相关内容
        title = title.replace(/https?:\/\/[^\s]+/gi, '');
        
        // 清理多余的空格和标点
        title = title.replace(/\s+/g, ' ').trim();
        title = title.replace(/[,，。.!！?？;；:：]*$/, '');
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