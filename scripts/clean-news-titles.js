// 新闻数据标题清理脚本
import fs from 'fs';
import path from 'path';

function cleanTitle(title) {
  // 移除AI思考过程和注解
  let cleaned = title
    // 移除"注："及其后的内容
    .replace(/\s*注：.*$/g, '')
    // 移除"注:"及其后的内容（中文冒号）
    .replace(/\s*注:.*$/g, '')
    // 移除换行符
    .replace(/\n/g, ' ')
    // 移除多余空格
    .replace(/\s+/g, ' ')
    // 移除首尾空格
    .trim();
  
  // 如果标题过长（超过50个字符），截取合理长度
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50) + '...';
  }
  
  return cleaned;
}

function cleanNewsData() {
  const filePath = path.join(process.cwd(), 'public', 'news-data.json');
  
  try {
    // 读取现有数据
    const rawData = fs.readFileSync(filePath, 'utf8');
    const newsData = JSON.parse(rawData);
    
    console.log('开始清理新闻标题...');
    let cleanedCount = 0;
    
    // 清理每条新闻的标题
    newsData.data = newsData.data.map(news => {
      const originalTitle = news.title;
      const cleanedTitle = cleanTitle(originalTitle);
      
      if (originalTitle !== cleanedTitle) {
        console.log(`清理标题: "${originalTitle.substring(0, 60)}..." → "${cleanedTitle}"`);
        cleanedCount++;
      }
      
      return {
        ...news,
        title: cleanedTitle
      };
    });
    
    // 更新时间戳
    newsData.timestamp = new Date().toISOString();
    
    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2), 'utf8');
    
    console.log(`✅ 清理完成！处理了 ${cleanedCount} 条标题`);
    console.log(`总共 ${newsData.data.length} 条新闻`);
    
  } catch (error) {
    console.error('清理新闻数据时出错:', error);
  }
}

// 运行清理
cleanNewsData();