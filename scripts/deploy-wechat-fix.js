#!/usr/bin/env node

/**
 * 微信分享修复部署脚本
 * 一键部署所有微信分享优化方案
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 开始部署微信分享修复方案...');

async function main() {
  try {
    // 1. 检查必要文件
    console.log('📋 检查必要文件...');
    const requiredFiles = [
      'public/wechat-share-proxy.html',
      'src/services/personalSubscriptionShareService.ts',
      'public/wechat-share-300.png'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.error(`❌ 缺少必要文件: ${file}`);
        process.exit(1);
      }
    }
    console.log('✅ 所有必要文件存在');

    // 2. 构建项目
    console.log('🔨 构建项目...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 项目构建完成');

    // 3. 验证构建产物
    console.log('🔍 验证构建产物...');
    const distFiles = [
      'dist/index.html',
      'dist/wechat-share-proxy.html',
      'dist/wechat-share-300.png'
    ];

    for (const file of distFiles) {
      if (!fs.existsSync(file)) {
        console.error(`❌ 构建产物缺失: ${file}`);
        process.exit(1);
      }
    }
    console.log('✅ 构建产物验证通过');

    // 4. 测试微信分享代理页面
    console.log('🧪 测试微信分享代理页面...');
    await testWeChatShareProxy();

    // 5. 部署到GitHub Pages
    console.log('🚀 部署到GitHub Pages...');
    execSync('npm run deploy', { stdio: 'inherit' });
    console.log('✅ 部署完成');

    // 6. 验证部署结果
    console.log('🔍 验证部署结果...');
    await verifyDeployment();

    console.log('🎉 微信分享修复方案部署成功！');
    console.log('');
    console.log('📋 测试步骤:');
    console.log('1. 在微信中打开: https://news.aipush.fun/wechat-share-proxy.html?id=news_1754649441137_1');
    console.log('2. 点击右上角分享按钮');
    console.log('3. 检查分享卡片是否显示标题、描述和图片');
    console.log('4. 分享到聊天或朋友圈进行测试');

  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

/**
 * 测试微信分享代理页面
 */
async function testWeChatShareProxy() {
  const proxyPath = 'dist/wechat-share-proxy.html';
  const content = fs.readFileSync(proxyPath, 'utf8');

  // 检查关键元素
  const checks = [
    { name: 'og:title', pattern: /<meta property="og:title"/ },
    { name: 'og:description', pattern: /<meta property="og:description"/ },
    { name: 'og:image', pattern: /<meta property="og:image"/ },
    { name: 'wechat:title', pattern: /<meta name="wechat:title"/ },
    { name: 'wxcard:title', pattern: /<meta name="wxcard:title"/ },
    { name: 'JavaScript', pattern: /updateMetaTags/ }
  ];

  for (const check of checks) {
    if (!check.pattern.test(content)) {
      throw new Error(`代理页面缺少: ${check.name}`);
    }
  }

  console.log('✅ 微信分享代理页面测试通过');
}

/**
 * 验证部署结果
 */
async function verifyDeployment() {
  const testUrls = [
    'https://news.aipush.fun/',
    'https://news.aipush.fun/wechat-share-proxy.html',
    'https://news.aipush.fun/wechat-share-300.png'
  ];

  for (const url of testUrls) {
    try {
      console.log(`测试: ${url}`);
      const response = await fetch(url);
      
      if (response.ok) {
        console.log(`✅ ${url} - 访问正常`);
      } else {
        console.log(`⚠️ ${url} - 状态码: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - 访问失败: ${error.message}`);
    }
  }
}

// 运行主函数
main();
