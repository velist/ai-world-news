const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 自动化部署脚本
 * 用于提交代码到GitHub并触发部署
 */

// 配置
const config = {
  // 是否自动推送到远程仓库
  autoPush: true,
  // 是否构建项目
  buildProject: true,
  // 是否生成新闻数据
  generateNews: false,
  // 提交信息前缀
  commitPrefix: '🚀 自动部署',
  // 分支名称
  branch: 'main'
};

/**
 * 执行命令并输出结果
 */
function execCommand(command, options = {}) {
  console.log(`\n📋 执行命令: ${command}`);
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ 命令执行失败: ${error.message}`);
    throw error;
  }
}

/**
 * 检查Git状态
 */
function checkGitStatus() {
  console.log('\n🔍 检查Git状态...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.trim()) {
      console.log('✅ 没有待提交的更改');
      return false;
    }
    console.log('📝 发现待提交的更改:');
    console.log(status);
    return true;
  } catch (error) {
    console.error('❌ 检查Git状态失败:', error.message);
    throw error;
  }
}

/**
 * 生成提交信息
 */
function generateCommitMessage(customMessage) {
  const timestamp = new Date().toLocaleString('zh-CN');
  const defaultMessage = `${config.commitPrefix} - ${timestamp}

✅ 自动提交更改:
- 代码优化和功能更新
- 修复问题和改进
- 部署配置更新

🕒 提交时间: ${timestamp}`;

  return customMessage || defaultMessage;
}

/**
 * 构建项目
 */
function buildProject() {
  if (!config.buildProject) {
    console.log('⏭️ 跳过项目构建');
    return;
  }
  
  console.log('\n🔨 构建项目...');
  execCommand('npm run build');
  console.log('✅ 项目构建完成');
}

/**
 * 生成新闻数据
 */
function generateNewsData() {
  if (!config.generateNews) {
    console.log('⏭️ 跳过新闻数据生成');
    return;
  }
  
  console.log('\n📰 生成新闻数据...');
  try {
    execCommand('npm run aggregate-news');
    execCommand('npm run generate-feed');
    console.log('✅ 新闻数据生成完成');
  } catch (error) {
    console.warn('⚠️ 新闻数据生成失败，继续部署:', error.message);
  }
}

/**
 * 提交代码
 */
function commitChanges(message) {
  console.log('\n📝 提交代码更改...');
  
  // 添加所有更改
  execCommand('git add .');
  
  // 提交更改
  execCommand(`git commit -m "${message}"`);
  
  console.log('✅ 代码提交完成');
}

/**
 * 推送到远程仓库
 */
function pushToRemote() {
  if (!config.autoPush) {
    console.log('⏭️ 跳过推送到远程仓库');
    return;
  }
  
  console.log('\n🚀 推送到远程仓库...');
  
  try {
    // 先拉取最新更改
    execCommand(`git pull origin ${config.branch} --no-edit`);
    
    // 推送更改
    execCommand(`git push origin ${config.branch}`);
    
    console.log('✅ 推送完成');
  } catch (error) {
    console.error('❌ 推送失败:', error.message);
    throw error;
  }
}

/**
 * 等待部署完成
 */
async function waitForDeployment() {
  console.log('\n⏳ 等待部署完成...');
  
  // 等待30秒让部署系统处理
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('✅ 部署等待完成');
}

/**
 * 验证部署
 */
async function verifyDeployment() {
  console.log('\n🔍 验证部署状态...');
  
  try {
    const https = require('https');
    const url = 'https://news.aipush.fun/';
    
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ 网站可正常访问');
          resolve(true);
        } else {
          console.warn(`⚠️ 网站返回状态码: ${res.statusCode}`);
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.warn('⚠️ 网站访问测试失败:', error.message);
        resolve(false);
      });
      
      req.setTimeout(10000, () => {
        console.warn('⚠️ 网站访问超时');
        req.destroy();
        resolve(false);
      });
    });
  } catch (error) {
    console.warn('⚠️ 部署验证失败:', error.message);
    return false;
  }
}

/**
 * 主部署流程
 */
async function deploy(customCommitMessage) {
  console.log('🚀 开始自动化部署流程...');
  console.log('⏰ 开始时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    // 1. 检查是否有更改
    const hasChanges = checkGitStatus();
    if (!hasChanges) {
      console.log('\n✅ 没有需要部署的更改');
      return;
    }
    
    // 2. 生成新闻数据（可选）
    generateNewsData();
    
    // 3. 构建项目（可选）
    buildProject();
    
    // 4. 提交代码
    const commitMessage = generateCommitMessage(customCommitMessage);
    commitChanges(commitMessage);
    
    // 5. 推送到远程仓库
    pushToRemote();
    
    // 6. 等待部署
    await waitForDeployment();
    
    // 7. 验证部署
    const deploymentSuccess = await verifyDeployment();
    
    console.log('\n🎉 部署流程完成!');
    console.log('⏰ 完成时间:', new Date().toLocaleString('zh-CN'));
    console.log('🌐 网站地址: https://news.aipush.fun/');
    
    if (deploymentSuccess) {
      console.log('✅ 部署验证成功');
    } else {
      console.log('⚠️ 部署验证未通过，请手动检查');
    }
    
  } catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const customMessage = args.join(' ');

// 如果作为模块被调用
if (require.main === module) {
  deploy(customMessage);
}

module.exports = {
  deploy,
  config
};
