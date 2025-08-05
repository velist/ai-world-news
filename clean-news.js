import { readFileSync, writeFileSync } from 'fs';

console.log('清理无意义内容...');

// 读取新闻数据
const newsData = JSON.parse(readFileSync('public/news-data.json', 'utf8'));
const originalCount = newsData.total;

// 过滤掉无意义内容的新闻
const cleanedNews = newsData.data.filter(item => {
  const hasContent = item.content && 
                    item.content.trim() !== '' && 
                    item.content !== '点击查看原文>' &&
                    item.content.length > 10;
  
  if (!hasContent) {
    console.log(`移除无意义内容新闻: ${item.title}`);
  }
  
  return hasContent;
});

// 更新数据
const cleanedData = {
  ...newsData,
  total: cleanedNews.length,
  data: cleanedNews
};

// 保存清理后的数据
writeFileSync('public/news-data.json', JSON.stringify(cleanedData, null, 2), 'utf8');

console.log(`清理完成:`);
console.log(`  原始新闻数: ${originalCount}`);
console.log(`  清理后新闻数: ${cleanedNews.length}`);
console.log(`  移除无意义内容: ${originalCount - cleanedNews.length}条`);

// 重新生成RSS feed
import('./generate-feed.js').then(() => {
  console.log('RSS feed已重新生成');
}).catch(error => {
  console.error('重新生成RSS feed失败:', error.message);
});