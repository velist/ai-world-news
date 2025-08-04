console.log('开始测试RSS聚合...');

import Parser from 'rss-parser';
const parser = new Parser();

async function testRSS() {
  try {
    console.log('正在测试机器之心RSS...');
    const feed = await parser.parseURL('https://www.jiqizhixin.com/rss');
    console.log(`成功获取 ${feed.items.length} 条新闻`);
    console.log('第一条新闻标题:', feed.items[0]?.title);
    
    // 测试AI关键词过滤
    const aiKeywords = ['AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT'];
    const aiNews = feed.items.filter(item => {
      const text = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
      return aiKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    });
    
    console.log(`AI相关新闻: ${aiNews.length} 条`);
    
    if (aiNews.length > 0) {
      console.log('第一条AI新闻:', aiNews[0].title);
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testRSS();