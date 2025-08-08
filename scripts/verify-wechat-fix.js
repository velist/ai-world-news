// 验证微信分享修复效果脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 验证微信分享修复效果...\n');

// 检查项目
const checks = [
  {
    name: '分享图片文件',
    items: [
      { file: '../public/wechat-share-300.png', desc: '微信分享PNG图片' },
      { file: '../public/wechat-share-300.svg', desc: '微信分享SVG图片' },
      { file: '../public/wechat-thumb.png', desc: '原有缩略图' }
    ]
  },
  {
    name: '测试页面',
    items: [
      { file: '../public/wechat-share-test-fixed.html', desc: '修复版测试页面' }
    ]
  },
  {
    name: '核心代码文件',
    items: [
      { file: '../src/pages/Index.tsx', desc: '首页Meta标签' },
      { file: '../src/pages/NewsDetailPage.tsx', desc: '新闻详情页Meta标签' },
      { file: '../src/hooks/useWeChatShare.ts', desc: '微信分享Hook' },
      { file: '../src/services/wechatService.ts', desc: '微信分享服务' },
      { file: '../src/services/subscriptionShareService.ts', desc: '订阅分享服务' }
    ]
  }
];

let allPassed = true;

// 检查文件存在性
checks.forEach(category => {
  console.log(`📋 检查 ${category.name}:`);
  
  category.items.forEach(item => {
    const filePath = path.join(__dirname, item.file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    
    if (!exists) allPassed = false;
    
    console.log(`  ${status} ${item.desc}: ${item.file}`);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const size = Math.round(stats.size / 1024 * 100) / 100;
      console.log(`     大小: ${size} KB`);
    }
  });
  
  console.log('');
});

// 检查代码内容
console.log('📝 检查代码修复内容:');

const codeChecks = [
  {
    file: '../src/pages/NewsDetailPage.tsx',
    patterns: [
      'wechat-share-300.png',
      'wxcard:imgUrl',
      'og:image:width.*300',
      'v=2025080802'
    ],
    desc: '新闻详情页Meta标签'
  },
  {
    file: '../src/pages/Index.tsx',
    patterns: [
      'wechat-share-300.png',
      'wxcard:title',
      'v=2025080802'
    ],
    desc: '首页Meta标签'
  },
  {
    file: '../src/hooks/useWeChatShare.ts',
    patterns: [
      'wechat-share-300.png',
      'og:image:width.*300',
      'og:image:type.*png'
    ],
    desc: '微信分享Hook'
  }
];

codeChecks.forEach(check => {
  const filePath = path.join(__dirname, check.file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`  📄 ${check.desc}:`);
    
    check.patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      const found = regex.test(content);
      const status = found ? '✅' : '❌';
      
      if (!found) allPassed = false;
      
      console.log(`    ${status} 包含: ${pattern}`);
    });
  } else {
    console.log(`  ❌ 文件不存在: ${check.file}`);
    allPassed = false;
  }
  
  console.log('');
});

// 生成验证报告
console.log('📊 验证结果总结:');
console.log(`整体状态: ${allPassed ? '✅ 通过' : '❌ 存在问题'}`);

if (allPassed) {
  console.log(`
✅ 微信分享功能修复验证通过！

🎯 修复内容:
• 创建了标准的微信分享图片 (300x300px PNG)
• 更新了所有页面的Meta标签配置
• 优化了微信分享服务的图片处理逻辑
• 添加了版本号防止缓存问题
• 创建了测试验证页面

📋 下一步:
1. 部署到生产环境
2. 在微信中测试分享功能
3. 访问测试页面验证效果: /wechat-share-test-fixed.html
4. 检查分享卡片是否显示正确的标题、描述和图片

🔗 测试URL:
• 主页: https://news.aipush.fun/
• 测试页面: https://news.aipush.fun/wechat-share-test-fixed.html
• 新闻详情: https://news.aipush.fun/#/news/[新闻ID]
`);
} else {
  console.log(`
❌ 验证发现问题，请检查上述失败项目。

🔧 可能的解决方案:
1. 确保所有文件都已正确创建和修改
2. 检查代码中的图片URL引用
3. 验证Meta标签配置是否完整
4. 重新运行修复脚本
`);
}

console.log('\n🏁 验证完成');
