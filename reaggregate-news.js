console.log('重新聚合AI新闻...');

import { aggregateNews } from './scripts/news-service.js';

// 运行一次聚合
aggregateNews().then(count => {
  console.log(`\n聚合完成，获取到 ${count} 条新闻`);
  
  // 生成RSS feed
  import('./scripts/generate-feed.js').then(() => {
    console.log('RSS feed已重新生成');
    process.exit(0);
  }).catch(error => {
    console.error('生成RSS feed失败:', error.message);
    process.exit(1);
  });
}).catch(error => {
  console.error('聚合失败:', error.message);
  process.exit(1);
});