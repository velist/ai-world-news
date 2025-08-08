// 创建微信分享专用图片脚本
// 生成符合微信要求的分享图片（300x300px PNG格式）

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG模板 - 300x300px
const svgTemplate = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="300" height="300" fill="url(#bgGradient)" rx="24"/>
  
  <!-- AI Icon Background -->
  <circle cx="150" cy="110" r="50" fill="white" fill-opacity="0.2"/>
  <circle cx="150" cy="110" r="40" fill="white" fill-opacity="0.9" filter="url(#shadow)"/>
  
  <!-- AI Text -->
  <text x="150" y="120" text-anchor="middle" fill="#667eea" font-size="32" font-weight="bold" font-family="system-ui, -apple-system, sans-serif">AI</text>
  
  <!-- News Lines -->
  <rect x="70" y="180" width="160" height="5" fill="white" fill-opacity="0.8" rx="2.5"/>
  <rect x="70" y="195" width="120" height="5" fill="white" fill-opacity="0.6" rx="2.5"/>
  <rect x="70" y="210" width="140" height="5" fill="white" fill-opacity="0.4" rx="2.5"/>
  
  <!-- Brand Text -->
  <text x="150" y="250" text-anchor="middle" fill="white" font-size="22" font-weight="600" font-family="system-ui, -apple-system, sans-serif">AI推</text>
  <text x="150" y="275" text-anchor="middle" fill="white" font-size="14" font-weight="400" font-family="system-ui, -apple-system, sans-serif" fill-opacity="0.8">最新AI资讯聚合</text>
</svg>`;

// 输出文件路径
const outputPath = path.join(__dirname, '../public/wechat-share-300.svg');

try {
  // 写入SVG文件
  fs.writeFileSync(outputPath, svgTemplate, 'utf8');
  console.log('✅ 微信分享图片创建成功:', outputPath);
  
  // 验证文件
  const stats = fs.statSync(outputPath);
  console.log('📊 文件大小:', Math.round(stats.size / 1024 * 100) / 100, 'KB');
  
  // 提示后续步骤
  console.log('\n📋 后续步骤:');
  console.log('1. 如需PNG格式，请使用在线工具转换SVG到PNG (300x300px)');
  console.log('2. 将PNG文件保存为 public/wechat-share-300.png');
  console.log('3. 更新代码中的图片引用');
  console.log('4. 测试微信分享功能');
  
} catch (error) {
  console.error('❌ 创建微信分享图片失败:', error);
}
