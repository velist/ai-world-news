// 清理无意义新闻的脚本
console.log('开始清理无意义的新闻...\n');

import { readFileSync, writeFileSync } from 'fs';

// 读取现有数据
let data;
try {
  const existingData = readFileSync('public/news-data.json', 'utf8');
  data = JSON.parse(existingData);
  console.log(`原始数据: ${data.data.length} 条新闻\n`);
} catch (error) {
  console.error('读取数据文件失败:', error.message);
  process.exit(1);
}

// 过滤掉无内容的新闻
const validNews = data.data.filter(item => {
  const hasContent = item.content && item.content.trim().length > 10;
  const hasMeaningfulTitle = item.title && 
    item.title.length > 5 && 
    !['让', '爱的', '所有', '具身智能'].some(prefix => item.title.startsWith(prefix));
  
  return hasContent && hasMeaningfulTitle;
});

// 过滤掉明显不是AI相关的新闻
const aiRelatedNews = validNews.filter(item => {
  const text = (item.title + ' ' + item.content).toLowerCase();
  
  // 明显不是AI相关的关键词
  const nonAIKeywords = [
    '性感', '内衣', '游戏', '娱乐', '体育', '音乐', '电影', '电视', '明星', '网红',
    '让创造', '爱的本质', '所有的时刻', '亚马逊', '美团', '比亚迪', '华为nova'
  ];
  
  return !nonAIKeywords.some(keyword => text.includes(keyword));
});

console.log(`过滤后: ${aiRelatedNews.length} 条有效AI新闻`);
console.log(`删除了: ${data.data.length - aiRelatedNews.length} 条无意义新闻\n`);

// 显示被删除的新闻
console.log('被删除的新闻列表:');
console.log('='.repeat(60));
data.data.forEach((item, index) => {
  const isValid = aiRelatedNews.some(valid => valid.id === item.id);
  if (!isValid) {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   分类: ${item.category}`);
    console.log(`   内容: "${item.content || ''}"`);
    console.log('---');
  }
});

// 重新排序（按发布时间）
aiRelatedNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

// 保存清理后的数据
const cleanedData = {
  success: true,
  timestamp: new Date().toISOString(),
  total: aiRelatedNews.length,
  data: aiRelatedNews
};

try {
  writeFileSync('public/news-data.json', JSON.stringify(cleanedData, null, 2), 'utf8');
  console.log('\n✅ 清理完成！数据已保存到 news-data.json');
} catch (error) {
  console.error('保存文件失败:', error.message);
}