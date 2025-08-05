import data from './public/news-data.json' with { type: 'json' };

console.log('新闻总数:', data.total);
console.log('来源分布:');
const sources = {};
data.data.forEach(item => {
  sources[item.source] = (sources[item.source] || 0) + 1;
});
Object.entries(sources).forEach(([source, count]) => {
  console.log(`  ${source}: ${count}条`);
});

console.log('分类分布:');
const categories = {};
data.data.forEach(item => {
  categories[item.category] = (categories[item.category] || 0) + 1;
});
Object.entries(categories).forEach(([category, count]) => {
  console.log(`  ${category}: ${count}条`);
});

// 检查内容质量
console.log('\n内容质量检查:');
const emptyContent = data.data.filter(item => !item.content || item.content.trim() === '' || item.content === '点击查看原文>');
console.log(`空内容或模板内容: ${emptyContent.length}条`);
console.log(`高质量内容: ${data.total - emptyContent.length}条`);

// 显示几个高质量新闻示例
console.log('\n高质量新闻示例:');
data.data.slice(0, 3).forEach((item, index) => {
  console.log(`${index + 1}. ${item.title}`);
  console.log(`   来源: ${item.source}`);
  console.log(`   内容长度: ${item.content.length}字符`);
  console.log(`   分类: ${item.category}`);
  console.log('');
});