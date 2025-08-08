#!/usr/bin/env node

/**
 * 微信分享Worker部署脚本
 * 自动部署Cloudflare Worker来优化微信分享
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署微信分享优化Worker...');

// 检查必要文件
const requiredFiles = [
  'cloudflare-worker-wechat-share.js',
  'wrangler-wechat.toml'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ 缺少必要文件: ${file}`);
    process.exit(1);
  }
}

try {
  // 1. 检查Wrangler CLI
  console.log('📋 检查Wrangler CLI...');
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
    console.log('✅ Wrangler CLI已安装');
  } catch (error) {
    console.log('📦 安装Wrangler CLI...');
    execSync('npm install -g wrangler', { stdio: 'inherit' });
  }

  // 2. 登录检查
  console.log('🔐 检查Cloudflare登录状态...');
  try {
    execSync('wrangler whoami', { stdio: 'pipe' });
    console.log('✅ 已登录Cloudflare');
  } catch (error) {
    console.log('🔑 请先登录Cloudflare:');
    console.log('运行: wrangler login');
    process.exit(1);
  }

  // 3. 部署Worker
  console.log('🚀 部署Worker到Cloudflare...');
  execSync('wrangler deploy --config wrangler-wechat.toml', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ Worker部署成功！');

  // 4. 测试部署
  console.log('🧪 测试Worker功能...');
  await testWorkerDeployment();

  console.log('🎉 微信分享优化Worker部署完成！');
  console.log('');
  console.log('📋 后续步骤:');
  console.log('1. 在Cloudflare Dashboard中配置自定义域名');
  console.log('2. 设置DNS记录指向Worker');
  console.log('3. 在微信中测试分享功能');

} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
}

/**
 * 测试Worker部署
 */
async function testWorkerDeployment() {
  const testUrls = [
    'https://ai-news-wechat-share.your-subdomain.workers.dev/',
    'https://ai-news-wechat-share.your-subdomain.workers.dev/news/test'
  ];

  for (const url of testUrls) {
    try {
      console.log(`测试: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${url} - 响应正常`);
      } else {
        console.log(`⚠️ ${url} - 状态码: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - 测试失败: ${error.message}`);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // 脚本主逻辑已在上面执行
}
