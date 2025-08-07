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
      // 首先过滤明显的低质量InfoQ新闻
      if (news.source === 'InfoQ中文') {
        const title = news.title || "";
        const content = news.content || "";
        
        // 过滤掉明显的广告和推广内容
        const isAdvertisement = 
          title.includes("AICon") || 
          title.includes("挑战赛") ||
          title.includes("开启") ||
          title.includes("启动") ||
          (title.includes("技术岗位") && title.includes("占比")) ||
          title.includes("秋招") ||
          title.length < 20 ||
          content.trim().length < 100;
          
        if (isAdvertisement) {
          console.log(`前端过滤掉低质量InfoQ新闻: ${title}`);
          return false;
        }
      }
      
      // 保留具有实质内容的新闻，特别是包含重要技术公司的新闻
      const title = news.title || "";
      const importantTechKeywords = [
        "谷歌", "Google", "微软", "Microsoft", "苹果", "Apple", "亚马逊", "Amazon",
        "Meta", "Facebook", "OpenAI", "ChatGPT", "AI", "人工智能", "机器学习",
        "Opal", "实验室", "算法", "深度学习", "neural", "云计算"
      ];
      
      const hasImportantTech = importantTechKeywords.some(keyword => 
        title.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasImportantTech) {
        return true;
      }
      
      // 然后应用内容安全过滤
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
