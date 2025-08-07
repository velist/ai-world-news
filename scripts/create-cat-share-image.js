import fs from 'fs';
import path from 'path';

// 创建基于猫咪logo的分享图片
const svgContent = `
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667EEA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764BA2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="300" height="300" fill="url(#bg)"/>
  
  <!-- 圆形背景衬托 -->
  <circle cx="150" cy="130" r="80" fill="rgba(255, 255, 255, 0.15)"/>
  
  <!-- 放大的猫咪 (scale 5x, center at 150,130) -->
  <g transform="translate(150, 130) scale(5, 5) translate(-16, -16)">
    <!-- 猫咪主体 -->
    <ellipse cx="16" cy="18" rx="12" ry="10" fill="#FFB366"/>
    
    <!-- 猫咪耳朵 -->
    <path d="M8 12 L12 8 L14 12 Z" fill="#FFB366"/>
    <path d="M18 12 L20 8 L24 12 Z" fill="#FFB366"/>
    
    <!-- 耳朵内部 -->
    <path d="M9.5 11 L11.5 9 L12.5 11 Z" fill="#FF9999"/>
    <path d="M19.5 11 L20.5 9 L22.5 11 Z" fill="#FF9999"/>
    
    <!-- 猫咪脸部 -->
    <ellipse cx="16" cy="16" rx="8" ry="6" fill="#FFFFFF"/>
    
    <!-- 眼镜框 -->
    <rect x="8" y="13" width="16" height="6" rx="3" fill="#333333"/>
    
    <!-- 眼镜镜片 -->
    <circle cx="12" cy="16" r="3" fill="#000000" opacity="0.8"/>
    <circle cx="20" cy="16" r="3" fill="#000000" opacity="0.8"/>
    
    <!-- 眼镜反光 -->
    <circle cx="13" cy="15" r="0.8" fill="#FFFFFF" opacity="0.6"/>
    <circle cx="21" cy="15" r="0.8" fill="#FFFFFF" opacity="0.6"/>
    
    <!-- 鼻子 -->
    <ellipse cx="16" cy="20" rx="1" ry="0.8" fill="#FF6B9D"/>
    
    <!-- 嘴巴 -->
    <path d="M14 22 Q16 23 18 22" stroke="#333333" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    
    <!-- 胡须 -->
    <line x1="10" y1="18" x2="6" y2="17" stroke="#333333" stroke-width="1" stroke-linecap="round"/>
    <line x1="10" y1="20" x2="6" y2="20" stroke="#333333" stroke-width="1" stroke-linecap="round"/>
    <line x1="22" y1="18" x2="26" y2="17" stroke="#333333" stroke-width="1" stroke-linecap="round"/>
    <line x1="22" y1="20" x2="26" y2="20" stroke="#333333" stroke-width="1" stroke-linecap="round"/>
    
    <!-- 猫咪身体下部 -->
    <ellipse cx="16" cy="26" rx="6" ry="4" fill="#FFB366"/>
    
    <!-- 小爪子 -->
    <ellipse cx="12" cy="29" rx="1.5" ry="1" fill="#FFFFFF"/>
    <ellipse cx="16" cy="29" rx="1.5" ry="1" fill="#FFFFFF"/>
    <ellipse cx="20" cy="29" rx="1.5" ry="1" fill="#FFFFFF"/>
    
    <!-- 猫咪条纹 -->
    <path d="M12 6 Q14 7 16 6 Q18 7 20 6" stroke="#FF9999" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M10 8 Q12 9 14 8" stroke="#FF9999" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M18 8 Q20 9 22 8" stroke="#FF9999" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </g>
  
  <!-- 网站标题 -->
  <text x="150" y="240" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
        text-anchor="middle" fill="white">AI推</text>
  
  <!-- 副标题 -->
  <text x="150" y="265" font-family="Arial, sans-serif" font-size="14" 
        text-anchor="middle" fill="rgba(255,255,255,0.9)">智能新闻资讯</text>
  
  <!-- 边框装饰 -->
  <rect x="5" y="5" width="290" height="290" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
</svg>
`;

// 保存SVG文件
const svgPath = path.join(process.cwd(), 'public', 'cat-share-300.svg');
fs.writeFileSync(svgPath, svgContent.trim(), 'utf8');

console.log('✅ 创建了猫咪分享图片:', svgPath);
console.log('🐱 基于网站猫咪logo的300x300分享图片');