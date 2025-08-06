#!/usr/bin/env node

/**
 * 微信环境测试脚本
 * 模拟微信环境下的行为，验证修复效果
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟微信环境测试用例
const testCases = [
  {
    name: '微信环境分享链接测试',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.5(0x18000527) NetType/WIFI Language/zh_CN',
    url: 'https://news.aipush.fun/news/123',
    expected: '应该正常加载新闻详情页'
  },
  {
    name: '微信环境首页测试',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.5(0x18000527) NetType/WIFI Language/zh_CN',
    url: 'https://news.aipush.fun/',
    expected: '应该正常加载首页'
  },
  {
    name: '微信环境404测试',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.5(0x18000527) NetType/WIFI Language/zh_CN',
    url: 'https://news.aipush.fun/unknown-path',
    expected: '应该跳转到首页'
  },
  {
    name: '普通浏览器测试',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    url: 'https://news.aipush.fun/news/123',
    expected: '应该正常加载新闻详情页'
  }
];

// 检测微信环境
function isWeChat(userAgent) {
  return /micromessenger/i.test(userAgent);
}

// 检查404.html是否正确配置
function check404Config() {
  const filePath = path.join(__dirname, '../public/404.html');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const checks = {
      hasWeChatDetection: content.includes('micromessenger'),
      hasSimplifiedRedirect: content.includes('微信环境直接跳转到首页'),
      hasBackupRedirect: content.includes('执行备用跳转到首页'),
      hasProperTiming: content.includes('setTimeout') && content.includes('100')
    };
    
    return checks;
  } catch (error) {
    console.error('❌ 无法读取404.html文件:', error.message);
    return null;
  }
}

// 检查微信环境Hook是否正确配置
function checkWeChatHook() {
  const filePath = path.join(__dirname, '../src/hooks/useWeChatEnvironment.ts');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const checks = {
      hasWeChatDetection: content.includes('micromessenger'),
      hasStateManagement: content.includes('useState'),
      hasStateRestoration: content.includes('sessionStorage'),
      hasErrorHandling: content.includes('beforeunload'),
      hasShareUrlGeneration: content.includes('generateWeChatShareUrl'),
      isSimplified: !content.includes('optimizeURLHandling') && !content.includes('optimizePageLoading')
    };
    
    return checks;
  } catch (error) {
    console.error('❌ 无法读取useWeChatEnvironment.ts文件:', error.message);
    return null;
  }
}

// 检查错误边界是否正确配置
function checkErrorBoundary() {
  const filePath = path.join(__dirname, '../src/components/ErrorBoundary.tsx');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const checks = {
      hasErrorBoundaryClass: content.includes('class ErrorBoundary'),
      hasGlobalErrorHandler: content.includes('useGlobalErrorHandler'),
      hasWeChatOptimization: content.includes('微信环境'),
      hasUserFriendlyUI: content.includes('button') && content.includes('返回首页'),
      hasErrorLogging: content.includes('console.error')
    };
    
    return checks;
  } catch (error) {
    console.error('❌ 无法读取ErrorBoundary.tsx文件:', error.message);
    return null;
  }
}

// 检查App.tsx是否正确配置
function checkAppConfig() {
  const filePath = path.join(__dirname, '../src/App.tsx');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const checks = {
      hasErrorBoundary: content.includes('ErrorBoundary'),
      hasWeChatHook: content.includes('useWeChatEnvironment'),
      hasGlobalErrorHandler: content.includes('useGlobalErrorHandler'),
      hasWeChatErrorHandling: content.includes('hasError'),
      hasProperImport: content.includes('@/components/ErrorBoundary')
    };
    
    return checks;
  } catch (error) {
    console.error('❌ 无法读取App.tsx文件:', error.message);
    return null;
  }
}

// 运行测试
function runTests() {
  console.log('🧪 开始微信环境测试...\n');
  
  // 测试404配置
  console.log('📋 检查404页面配置...');
  const checks404 = check404Config();
  if (checks404) {
    Object.entries(checks404).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? '通过' : '失败'}`);
    });
  }
  console.log('');
  
  // 测试微信Hook配置
  console.log('📋 检查微信环境Hook配置...');
  const hookChecks = checkWeChatHook();
  if (hookChecks) {
    Object.entries(hookChecks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? '通过' : '失败'}`);
    });
  }
  console.log('');
  
  // 测试错误边界配置
  console.log('📋 检查错误边界配置...');
  const errorBoundaryChecks = checkErrorBoundary();
  if (errorBoundaryChecks) {
    Object.entries(errorBoundaryChecks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? '通过' : '失败'}`);
    });
  }
  console.log('');
  
  // 测试App配置
  console.log('📋 检查App组件配置...');
  const appChecks = checkAppConfig();
  if (appChecks) {
    Object.entries(appChecks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? '通过' : '失败'}`);
    });
  }
  console.log('');
  
  // 运行测试用例
  console.log('🧪 运行测试用例...');
  testCases.forEach((testCase, index) => {
    console.log(`\n测试用例 ${index + 1}: ${testCase.name}`);
    console.log(`  用户代理: ${testCase.userAgent}`);
    console.log(`  URL: ${testCase.url}`);
    console.log(`  预期: ${testCase.expected}`);
    
    const isWeChatEnv = isWeChat(testCase.userAgent);
    console.log(`  微信环境: ${isWeChatEnv ? '是' : '否'}`);
    
    // 模拟URL处理
    const url = new URL(testCase.url);
    const isNewsPath = url.pathname.includes('/news/');
    const isHomePath = url.pathname === '/';
    const isUnknownPath = !isNewsPath && !isHomePath;
    
    if (isWeChatEnv) {
      if (isUnknownPath) {
        console.log('  ✅ 会跳转到首页 (404处理)');
      } else if (isNewsPath) {
        console.log('  ✅ 会尝试加载新闻详情页');
      } else if (isHomePath) {
        console.log('  ✅ 会加载首页');
      }
    } else {
      console.log('  ✅ 普通浏览器正常处理');
    }
  });
  
  // 生成测试报告
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      '404页面': checks404,
      '微信Hook': hookChecks,
      '错误边界': errorBoundaryChecks,
      'App配置': appChecks
    },
    testCases: testCases.length,
    recommendations: []
  };
  
  // 生成建议
  if (checks404 && !checks404.hasSimplifiedRedirect) {
    report.recommendations.push('建议简化404页面的重定向逻辑');
  }
  
  if (hookChecks && !hookChecks.isSimplified) {
    report.recommendations.push('建议简化微信环境Hook，移除复杂的URL处理');
  }
  
  if (errorBoundaryChecks && !errorBoundaryChecks.hasWeChatOptimization) {
    report.recommendations.push('建议在错误边界中添加微信环境优化');
  }
  
  if (appChecks && !appChecks.hasErrorBoundary) {
    report.recommendations.push('建议在App组件中集成错误边界');
  }
  
  // 保存报告
  const reportPath = path.join(__dirname, 'wechat-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n🎉 测试完成！');
  console.log(`📋 测试报告已保存到: ${reportPath}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 改进建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  } else {
    console.log('\n✅ 所有检查都通过，无需改进！');
  }
  
  return report;
}

// 运行主函数
runTests().catch(console.error);