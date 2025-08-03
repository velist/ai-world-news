# 中国大陆搜索引擎SEO执行指南

## 🎯 优先级排序

**第一优先级** (立即执行):
1. 百度搜索资源平台 (市场份额60%+)
2. 360搜索站长平台 (市场份额15%+)
3. 搜狗搜索站长平台 (市场份额10%+)

**第二优先级** (配置完成):
4. 百度统计 (用户行为分析)
5. 关键词优化 (提升排名)

---

## 🔍 百度搜索资源平台操作指南

### 立即执行步骤：

#### 1. 注册和登录
1. 访问：https://ziyuan.baidu.com/
2. 使用百度账号登录（如无账号需先注册）
3. 完成手机号验证

#### 2. 添加网站
1. 点击"用户中心" → "站点管理"
2. 点击"添加网站"
3. 输入网站：`https://news.aipush.fun`
4. 选择网站类型：PC站

#### 3. 网站验证 - 推荐HTML标签验证
目前index.html中已预留验证位置：
```html
<meta name="baidu-site-verification" content="pending" />
```

**操作步骤**：
1. 在百度资源平台选择"HTML标签验证"
2. 复制百度提供的content值
3. 替换index.html中的"pending"为实际验证码
4. 重新部署网站
5. 在百度平台点击"完成验证"

#### 4. 提交sitemap
验证成功后：
1. 进入"普通收录" → "sitemap"
2. 提交：`https://news.aipush.fun/sitemap.xml`

#### 5. 手动提交重要页面
在"链接提交"中手动提交：
- 首页：https://news.aipush.fun
- AI分类页：https://news.aipush.fun/?category=AI
- 科技分类页：https://news.aipush.fun/?category=科技

---

## 🔍 360搜索站长平台操作指南

### 立即执行步骤：

#### 1. 注册和登录
1. 访问：http://zhanzhang.so.com/
2. 使用360账号登录（支持手机号注册）

#### 2. 添加网站
1. 点击"添加网站"
2. 输入：`https://news.aipush.fun`
3. 选择验证方式

#### 3. 网站验证
**推荐文件验证**：
1. 下载360提供的验证文件
2. 上传到网站根目录 `/public/`
3. 确保可以访问：`https://news.aipush.fun/[验证文件名]`
4. 点击验证

#### 4. 提交sitemap
1. 进入"数据提交" → "sitemap"
2. 提交：`https://news.aipush.fun/sitemap.xml`

---

## 🔍 搜狗搜索站长平台操作指南

### 立即执行步骤：

#### 1. 注册和登录
1. 访问：http://zhanzhang.sogou.com/
2. 使用搜狗账号登录

#### 2. 添加网站
1. 点击"添加网站"
2. 输入：`https://news.aipush.fun`
3. 选择网站类型

#### 3. 网站验证
**推荐HTML标签验证**：
我们可以在index.html添加搜狗验证标签：
```html
<meta name="sogou_site_verification" content="[搜狗提供的验证码]" />
```

#### 4. 提交sitemap
1. 进入"链接提交"
2. 提交sitemap URL

---

## 📊 百度统计配置

### 立即执行步骤：

#### 1. 注册百度统计
1. 访问：https://tongji.baidu.com/
2. 使用百度账号登录

#### 2. 新增网站
1. 点击"管理" → "新增网站"
2. 网站域名：`news.aipush.fun`
3. 网站名称：`AI推`
4. 行业类别：科技 > 互联网/IT
5. 网站首页：`https://news.aipush.fun`

#### 3. 获取统计代码
复制百度统计提供的代码，然后在index.html中：
```html
<!-- 百度统计 -->
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?[您的统计ID]";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

---

## 🎯 中文关键词优化策略

### 主要目标关键词
1. **核心词**: AI新闻、人工智能新闻、AI资讯
2. **长尾词**: ChatGPT新闻、OpenAI最新消息、机器学习资讯
3. **品牌词**: AI推、AI推趣、aipush
4. **行业词**: AI科技、人工智能技术、深度学习

### 关键词布局
- **标题标签**: 包含2-3个核心关键词
- **描述标签**: 自然融入长尾关键词
- **H1标签**: 主要关键词
- **H2-H6**: 相关关键词和长尾词
- **内容**: 关键词密度控制在2-8%

---

## ⚡ 立即行动清单

### 今天必须完成：
- [ ] 注册百度搜索资源平台账号
- [ ] 提交news.aipush.fun到百度
- [ ] 获取百度HTML验证码并部署
- [ ] 注册360搜索站长平台
- [ ] 注册搜狗搜索站长平台

### 本周完成：
- [ ] 完成所有平台验证
- [ ] 提交sitemap到各平台
- [ ] 配置百度统计
- [ ] 手动提交重要页面
- [ ] 监控收录情况

### 关键时间节点：
- **第1天**: 完成平台注册和网站提交
- **第3天**: 完成网站验证
- **第7天**: 开始出现收录
- **第14天**: 收录稳定，开始关键词排名
- **第30天**: SEO效果初步显现