export const useContentFilter = () => {
  
  const isContentSafe = (title: string, content: string, category: string) => {
    const allText = `${title} ${content} ${category}`.toLowerCase();
    
    // 技术和AI相关的安全关键词 - 这些是允许的
    const techSafeKeywords = [
      "artificial intelligence", "machine learning", "deep learning", "ai model",
      "algorithm", "computer science", "technology", "innovation", "research",
      "development", "programming", "software", "hardware", "data science",
      "neural network", "automation", "robotics", "computer vision",
      "natural language processing", "blockchain", "cryptocurrency"
    ];
    
    // 检查是否包含技术相关内容
    const hasTechContent = techSafeKeywords.some(keyword => 
      allText.includes(keyword)
    );
    
    // 如果包含技术内容，通常是安全的
    if (hasTechContent) {
      return true;
    }
    
    // 基于类别的过滤
    const safeCategories = ["ai", "科技", "tech", "technology", "经济", "economy", "business"];
    if (safeCategories.some(cat => category.toLowerCase().includes(cat))) {
      return true;
    }
    
    // 默认通过，但可以根据需要调整
    return true;
  };

  const filterNews = (newsArray: any[]) => {
    return newsArray.filter(news => {
      return isContentSafe(
        news.title || "", 
        news.content || news.summary || "", 
        news.category || ""
      );
    });
  };

  return {
    isContentSafe,
    filterNews
  };
};
