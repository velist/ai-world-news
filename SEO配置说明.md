# SEO API配置说明

为了实现真正的搜索引擎提交，需要配置以下环境变量：

## 环境变量设置

创建 `.env` 文件在项目根目录，添加以下配置：

```bash
# 百度推送API（推荐优先配置）
BAIDU_PUSH_TOKEN=你的百度推送Token
# 获取方式：https://ziyuan.baidu.com/linksubmit/index

# Google Search Console API  
GOOGLE_API_KEY=你的Google API密钥
# 获取方式：https://console.developers.google.com/

# Bing Webmaster API
BING_API_KEY=你的Bing API密钥  
# 获取方式：https://www.bing.com/webmasters/
```

## 获取API密钥步骤

### 百度推送API（最重要）
1. 访问 https://ziyuan.baidu.com/linksubmit/index
2. 验证网站所有权
3. 选择"主动推送"获取推送Token
4. 复制Token到环境变量

### Google Search Console
1. 访问 https://search.google.com/search-console
2. 添加并验证网站
3. 前往 https://console.developers.google.com/
4. 启用"Google Search Console API"
5. 创建服务账号并下载密钥文件

### Bing Webmaster Tools  
1. 访问 https://www.bing.com/webmasters/
2. 添加并验证网站
3. 获取API密钥

## 当前SEO优化状态

✅ **已完成:**
- sitemap.xml 已生成并修复中文URL编码
- robots.txt 已优化
- HTML meta标签完整
- 结构化数据已添加
- 搜索引擎验证码已配置

⚠️ **需要配置:**
- API密钥环境变量
- 实际的搜索引擎提交

## 手动提交方式

在API配置完成前，可以手动提交：

1. **Google**: https://www.google.com/ping?sitemap=https://news.aipush.fun/sitemap.xml
2. **Bing**: https://www.bing.com/ping?sitemap=https://news.aipush.fun/sitemap.xml  
3. **百度**: 在百度站长平台手动提交sitemap

## 验证SEO效果

运行以下命令检查SEO状态：
```bash
npm run generate-sitemap  # 更新sitemap
npm run seo-submit        # 提交到搜索引擎（需要API密钥）
```