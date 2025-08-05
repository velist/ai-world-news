import { readFileSync, writeFileSync } from 'fs';

console.log('最终清理：移除所有"点击查看原文>"内容...');

// 读取新闻数据
const newsData = JSON.parse(readFileSync('public/news-data.json', 'utf8'));
const originalCount = newsData.total;

// 过滤掉"点击查看原文>"内容
const cleanedNews = newsData.data.filter(item => {
  const hasContent = item.content && 
                    item.content.trim() !== '' && 
                    item.content !== '点击查看原文>' &&
                    item.content.length > 10;
  
  if (!hasContent) {
    console.log(`移除无内容新闻: ${item.title}`);
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

console.log(`\n最终清理完成:`);
console.log(`  原始新闻数: ${originalCount}`);
console.log(`  清理后新闻数: ${cleanedNews.length}`);
console.log(`  移除无内容新闻: ${originalCount - cleanedNews.length}条`);

// 显示最终新闻列表
console.log('\n最终新闻列表:');
cleanedNews.forEach((item, index) => {
  console.log(`${index + 1}. ${item.title}`);
  console.log(`   来源: ${item.source}`);
  console.log(`   分类: ${item.category}`);
  console.log(`   内容长度: ${item.content.length}字符`);
  console.log('');
});

// 重新生成RSS feed
import('./scripts/generate-feed.js').then(() => {
  console.log('RSS feed已重新生成');
}).catch(error => {
  console.error('重新生成RSS feed失败:', error.message);
});