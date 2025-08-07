import fs from 'fs';
import path from 'path';

// 创建一个简单的SVG图片
const svgContent = `
<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="500" height="500" fill="url(#gradient)"/>
  
  <!-- AI推 文字 -->
  <text x="250" y="220" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
        text-anchor="middle" fill="white">AI推</text>
  
  <!-- 副标题 -->
  <text x="250" y="280" font-family="Arial, sans-serif" font-size="32" 
        text-anchor="middle" fill="rgba(255,255,255,0.9)">人工智能新闻资讯</text>
  
  <!-- 装饰元素 -->
  <circle cx="150" cy="350" r="20" fill="rgba(255,255,255,0.3)"/>
  <circle cx="350" cy="350" r="15" fill="rgba(255,255,255,0.4)"/>
  <circle cx="250" cy="380" r="25" fill="rgba(255,255,255,0.2)"/>
  
  <!-- 边框 -->
  <rect x="10" y="10" width="480" height="480" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
</svg>
`;

// 保存SVG文件
const svgPath = path.join(process.cwd(), 'public', 'wechat-share-500.svg');
fs.writeFileSync(svgPath, svgContent, 'utf8');

console.log('✅ 创建了500x500微信分享图片:', svgPath);
console.log('💡 建议使用在线工具将SVG转换为PNG格式，确保微信完全支持');
console.log('🌐 可以访问：https://svgtopng.com/ 进行转换');