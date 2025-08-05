import { readFileSync, writeFileSync } from 'fs';

console.log('智能过滤非AI相关新闻（优化版）...');

// 读取新闻数据
const newsData = JSON.parse(readFileSync('public/news-data.json', 'utf8'));
const originalCount = newsData.total;

// AI关键词
const AI_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '智能',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别', '神经网络',
  'TensorFlow', 'PyTorch', '自动驾驶', '人形机器人', '智能驾驶', '智能制造',
  '智能硬件', '智能芯片', '量子计算', '区块链', '元宇宙', '虚拟现实', '增强现实',
  'OpenAI', 'Anthropic', 'DeepSeek', 'Kimi', '谷歌AI', '微软AI', '百度AI', 
  '阿里AI', '腾讯AI', '字节AI', '华为AI', '小米AI', '苹果AI', '英伟达'
];

// 明确需要过滤掉的无意义主题
const MEANINGLESS_TOPICS = [
  '性感', '内衣', '服装', '时尚', '美容', '化妆', '减肥', '健身',
  '美食', '旅游', '娱乐', '明星', '综艺', '电影', '电视剧', '音乐',
  '游戏', '体育', '足球', '篮球', '网球', '奥运会', '世界杯',
  '股市', '基金', '理财', '保险', '银行', '房地产', '汽车', '手机',
  '电商', '快递', '外卖', '餐饮', '酒店', '航空', '铁路', '地铁',
  '政治', '军事', '外交', '法律', '警察', '法院', '监狱', '犯罪'
];

// 判断是否为AI相关新闻
function isAINews(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 检查是否包含AI关键词
  const hasAIKeywords = AI_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) ||
    text.includes(keyword)
  );
  
  // 检查是否包含无意义主题关键词
  const hasMeaninglessTopics = MEANINGLESS_TOPICS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) ||
    text.includes(keyword)
  );
  
  // 必须包含AI关键词且不包含明显的无意义主题
  return hasAIKeywords && !hasMeaninglessTopics;
}

// 过滤新闻
const filteredNews = newsData.data.filter(item => {
  const isAI = isAINews(item.title, item.content);
  
  if (!isAI) {
    console.log(`移除新闻: ${item.title}`);
  } else {
    console.log(`保留新闻: ${item.title}`);
  }
  
  return isAI;
});

// 更新数据
const filteredData = {
  ...newsData,
  total: filteredNews.length,
  data: filteredNews
};

// 保存过滤后的数据
writeFileSync('public/news-data.json', JSON.stringify(filteredData, null, 2), 'utf8');

console.log(`\n过滤完成:`);
console.log(`  原始新闻数: ${originalCount}`);
console.log(`  过滤后新闻数: ${filteredNews.length}`);
console.log(`  移除无意义新闻: ${originalCount - filteredNews.length}条`);

// 显示过滤后的新闻列表
console.log('\n保留的新闻列表:');
filteredNews.forEach((item, index) => {
  console.log(`${index + 1}. ${item.title}`);
  console.log(`   来源: ${item.source}`);
  console.log(`   分类: ${item.category}`);
  console.log('');
});

// 重新生成RSS feed
import('./scripts/generate-feed.js').then(() => {
  console.log('RSS feed已重新生成');
}).catch(error => {
  console.error('重新生成RSS feed失败:', error.message);
});