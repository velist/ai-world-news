import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块环境下获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取新闻数据
const filePath = path.join(__dirname, '..', 'public', 'news-data.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('=== 图片URL验证报告 ===\n');

data.data.forEach((item, index) => {
  console.log(`新闻 ${index + 1}: ${item.title}`);
  console.log(`图片URL: ${item.imageUrl}`);
  
  // 检查是否是默认图片
  const isDefaultImage = item.imageUrl.includes('unsplash.com/photo-1677442136019-21780ecad995');
  const isExternalImage = item.imageUrl.startsWith('http') && !item.imageUrl.includes('unsplash.com');
  
  if (isDefaultImage) {
    console.log('❌ 使用默认图片');
  } else if (isExternalImage) {
    console.log('✅ 使用外部图片');
  } else {
    console.log('⚠️ 未知图片类型');
  }
  
  console.log('---');
});

console.log(`\n总计: ${data.data.length} 条新闻`);
const defaultImageCount = data.data.filter(item => item.imageUrl.includes('unsplash.com/photo-1677442136019-21780ecad995')).length;
const externalImageCount = data.data.filter(item => item.imageUrl.startsWith('http') && !item.imageUrl.includes('unsplash.com')).length;

console.log(`默认图片: ${defaultImageCount} 条 (${(defaultImageCount/data.data.length*100).toFixed(1)}%)`);
console.log(`外部图片: ${externalImageCount} 条 (${(externalImageCount/data.data.length*100).toFixed(1)}%)`);