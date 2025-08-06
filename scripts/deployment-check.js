#!/usr/bin/env node

/**
 * 部署测试脚本
 * 在部署前验证所有微信环境修复是否正确
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 部署前检查清单
const deploymentChecklist = [
  {
    name: '404页面简化',
    file: '../public/404.html',
    checks: [
      { pattern: '微信环境直接跳转到首页', required: true },
      { pattern: '_wechat_cache_bust', required: false, shouldNotExist: true },
      { pattern: '执行备用跳转到首页', required: true },
      { pattern: 'window.location.replace(\'/\')', required: true }
    ]
  },
  {
    name: '微信环境Hook简化',
    file: '../src/hooks/useWeChatEnvironment.ts',
    checks: [
      { pattern: 'generateAntiCacheUrl', required: false, shouldNotExist: true },
      { pattern: 'optimizeURLHandling', required: false, shouldNotExist: true },
      { pattern: 'optimizePageLoading', required: false, shouldNotExist: true },
      { pattern: 'sessionStorage', required: true },
      { pattern: 'useState', required: true }
    ]
  },
  {
    name: '错误边界组件',
    file: '../src/components/ErrorBoundary.tsx',
    checks: [
      { pattern: 'class ErrorBoundary', required: true },
      { pattern: 'useGlobalErrorHandler', required: true },
      { pattern: '微信环境', required: true },
      { pattern: 'window.location.href = \'/\'', required: true }
    ]
  },
  {
    name: 'App组件集成',
    file: '../src/App.tsx',
    checks: [
      { pattern: 'ErrorBoundary', required: true },
      { pattern: 'useGlobalErrorHandler', required: true },
      { pattern: 'hasError', required: true },
      { pattern: 'useWeChatEnvironment', required: true }
    ]
  },
  {
    name: '新闻详情页优化',
    file: '../src/pages/NewsDetailPage.tsx',
    checks: [
      { pattern: 'MAX_RETRIES', required: true },
      { pattern: 'generateAntiCacheUrl', required: false, shouldNotExist: true },
      { pattern: 'setRetryCount(0)', required: true },
      { pattern: 'retryCount < MAX_RETRIES', required: true }
    ]
  },
  {
    name: '新闻Hook简化',
    file: '../src/hooks/useNews.ts',
    checks: [
      { pattern: '&r=${Math.random()}', required: false, shouldNotExist: true },
      { pattern: '&v=${Math.floor(forceTimestamp/1000)}', required: false, shouldNotExist: true },
      { pattern: '&bust=true', required: false, shouldNotExist: true },
      { pattern: '?t=${forceTimestamp}', required: true }
    ]
  }
];

// 运行部署检查
function runDeploymentCheck() {
  console.log('🚀 开始部署前检查...\n');
  
  const results = [];
  let allPassed = true;
  
  for (const item of deploymentChecklist) {
    console.log(`📋 检查: ${item.name}`);
    
    const filePath = path.join(__dirname, item.file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const itemResults = [];
      let itemPassed = true;
      
      for (const check of item.checks) {
        const hasPattern = content.includes(check.pattern);
        const passed = check.shouldNotExist ? !hasPattern : hasPattern;
        
        itemResults.push({
          check: check.pattern,
          passed,
          required: check.required,
          shouldNotExist: check.shouldNotExist
        });
        
        if (!passed && check.required) {
          itemPassed = false;
          allPassed = false;
        }
        
        console.log(`  ${passed ? '✅' : '❌'} ${check.pattern} ${check.shouldNotExist ? '(不应该存在)' : ''}`);
      }
      
      results.push({
        name: item.name,
        file: item.file,
        passed: itemPassed,
        checks: itemResults
      });
      
      console.log(`  ${itemPassed ? '✅' : '❌'} ${item.name}: ${itemPassed ? '通过' : '失败'}\n`);
      
    } catch (error) {
      console.log(`  ❌ 无法读取文件: ${item.file}`);
      console.log(`     错误: ${error.message}\n`);
      
      results.push({
        name: item.name,
        file: item.file,
        passed: false,
        error: error.message
      });
      
      allPassed = false;
    }
  }
  
  // 生成部署报告
  const report = {
    timestamp: new Date().toISOString(),
    allPassed,
    results,
    summary: {
      total: deploymentChecklist.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    }
  };
  
  // 保存报告
  const reportPath = path.join(__dirname, 'deployment-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('🎉 部署检查完成！');
  console.log(`📊 检查结果: ${report.summary.passed}/${report.summary.total} 项通过`);
  console.log(`📋 报告已保存到: ${reportPath}`);
  
  if (allPassed) {
    console.log('\n✅ 所有检查都通过，可以部署！');
    
    // 生成部署建议
    console.log('\n🚀 部署建议:');
    console.log('1. 先在测试环境部署并进行微信环境测试');
    console.log('2. 验证微信分享链接是否能正常打开');
    console.log('3. 测试页面刷新和导航是否正常');
    console.log('4. 确认没有出现无限加载或空白页面');
    console.log('5. 验证错误处理机制是否正常工作');
    
  } else {
    console.log('\n❌ 部分检查失败，请修复后再部署');
    
    const failedItems = results.filter(r => !r.passed);
    console.log('\n❌ 失败的项目:');
    failedItems.forEach(item => {
      console.log(`  • ${item.name}: ${item.file}`);
      if (item.error) {
        console.log(`    错误: ${item.error}`);
      } else {
        const failedChecks = item.checks.filter(c => !c.passed && c.required);
        failedChecks.forEach(check => {
          console.log(`    缺少: ${check.check}`);
        });
      }
    });
  }
  
  return report;
}

// 运行检查
runDeploymentCheck().catch(console.error);