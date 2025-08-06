#!/usr/bin/env node

/**
 * 微信SPA项目最佳实践搜索脚本
 * 搜索GitHub上的成熟微信SPA项目，借鉴其路由处理方案
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub API 配置
const GITHUB_API_BASE = 'https://api.github.com';
const SEARCH_QUERIES = [
  'wechat spa react router',
  '微信浏览器 SPA 路由',
  'wechat browser react optimization',
  'micromessenger spa routing',
  '微信内嵌浏览器 SPA',
  'react router wechat optimization',
  '微信 SPA 项目 路由优化'
];

// 搜索参数
const searchOptions = {
  per_page: 50,
  sort: 'updated',
  order: 'desc'
};

/**
 * 执行GitHub搜索
 */
function searchGitHub(query) {
  return new Promise((resolve, reject) => {
    const searchQuery = encodeURIComponent(query);
    const url = `${GITHUB_API_BASE}/search/repositories?q=${searchQuery}&per_page=${searchOptions.per_page}&sort=${searchOptions.sort}&order=${searchOptions.order}`;
    
    console.log(`🔍 搜索: ${query}`);
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * 获取仓库的README内容
 */
function getRepoReadme(owner, repo) {
  return new Promise((resolve, reject) => {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`;
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/vnd.github.v3.raw'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * 分析README中的微信相关处理
 */
function analyzeWeChatHandling(readmeContent) {
  const patterns = {
    router: /router|routing/gi,
    wechat: /wechat|微信|micromessenger/gi,
    spa: /spa|single.*page/gi,
    hash: /hash.*router|hashrouter/gi,
    history: /history.*router|historyapi/gi,
    redirect: /redirect|重定向/gi,
    cache: /cache|缓存/gi,
    404: /404|not.*found/gi
  };
  
  const analysis = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = readmeContent.match(pattern);
    analysis[key] = matches ? matches.length : 0;
  }
  
  return analysis;
}

/**
 * 提取最佳实践
 */
function extractBestPractices(repo, analysis) {
  const practices = [];
  
  if (analysis.router > 0 && analysis.wechat > 0) {
    practices.push('✅ 包含微信环境路由处理');
  }
  
  if (analysis.hash > 0) {
    practices.push('✅ 使用Hash Router处理微信兼容性');
  }
  
  if (analysis.cache > 0) {
    practices.push('✅ 包含缓存控制策略');
  }
  
  if (analysis['404'] > 0) {
    practices.push('✅ 包含404页面处理');
  }
  
  if (analysis.redirect > 0) {
    practices.push('✅ 包含重定向逻辑');
  }
  
  return practices;
}

/**
 * 生成报告
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalRepos: results.length,
    bestPractices: [],
    topRepos: [],
    commonPatterns: {},
    recommendations: []
  };
  
  // 统计常见模式
  results.forEach(repo => {
    if (repo.analysis) {
      Object.entries(repo.analysis).forEach(([key, count]) => {
        if (!report.commonPatterns[key]) {
          report.commonPatterns[key] = { count: 0, repos: [] };
        }
        if (count > 0) {
          report.commonPatterns[key].count++;
          report.commonPatterns[key].repos.push(repo.name);
        }
      });
    }
  });
  
  // 生成推荐
  const topPatterns = Object.entries(report.commonPatterns)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 5);
  
  report.recommendations = topPatterns.map(([pattern, data]) => {
    const recommendations = {
      'router': '建议使用React Router进行路由管理',
      'wechat': '建议添加微信环境检测和特殊处理',
      'spa': '建议采用SPA架构设计',
      'hash': '建议在微信环境中使用Hash Router',
      'history': '建议使用History API进行路由管理',
      'redirect': '建议添加重定向逻辑处理404',
      'cache': '建议添加缓存控制策略',
      '404': '建议配置404页面处理'
    };
    
    return {
      pattern,
      count: data.count,
      recommendation: recommendations[pattern] || '建议进一步研究该模式',
      repos: data.repos.slice(0, 3)
    };
  });
  
  // 顶级仓库
  report.topRepos = results
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10)
    .map(repo => ({
      name: repo.name,
      url: repo.url,
      stars: repo.stars,
      description: repo.description,
      practices: repo.practices || []
    }));
  
  return report;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始搜索微信SPA项目最佳实践...');
  
  const allResults = [];
  
  for (const query of SEARCH_QUERIES) {
    try {
      const result = await searchGitHub(query);
      
      if (result.items && result.items.length > 0) {
        console.log(`✅ 找到 ${result.items.length} 个相关仓库`);
        
        // 处理前5个最相关的仓库
        for (const item of result.items.slice(0, 5)) {
          try {
            const readme = await getRepoReadme(item.owner.login, item.name);
            const analysis = analyzeWeChatHandling(readme);
            const practices = extractBestPractices(item, analysis);
            
            allResults.push({
              name: item.full_name,
              url: item.html_url,
              stars: item.stargazers_count,
              description: item.description,
              analysis,
              practices
            });
            
            console.log(`  📄 分析仓库: ${item.full_name} (${item.stargazers_count} stars)`);
            
            // 避免API限制
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.log(`  ❌ 分析仓库失败: ${item.full_name}`, error.message);
          }
        }
      }
      
      // 避免API限制
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`❌ 搜索失败: ${query}`, error.message);
    }
  }
  
  // 生成报告
  const report = generateReport(allResults);
  
  // 保存报告
  const reportPath = path.join(__dirname, 'wechat-spa-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n🎉 搜索完成！');
  console.log(`📊 共分析了 ${report.totalRepos} 个仓库`);
  console.log(`📋 报告已保存到: ${reportPath}`);
  
  // 显示关键发现
  console.log('\n🔍 关键发现:');
  report.recommendations.forEach(rec => {
    console.log(`  • ${rec.pattern}: ${rec.count} 个仓库 (${rec.recommendation})`);
  });
  
  // 显示顶级仓库
  console.log('\n⭐ 顶级仓库:');
  report.topRepos.forEach(repo => {
    console.log(`  • ${repo.name} (${repo.stars} stars)`);
    console.log(`    ${repo.url}`);
    if (repo.practices.length > 0) {
      console.log(`    ${repo.practices.join(', ')}`);
    }
  });
  
  return report;
}

// 运行主函数
main().catch(console.error);

export {
  searchGitHub,
  analyzeWeChatHandling,
  extractBestPractices,
  generateReport
};