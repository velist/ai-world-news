# Mailchimp 邮件订阅配置指南

## 1. 注册 Mailchimp 账户
1. 访问 [https://mailchimp.com](https://mailchimp.com)
2. 点击 "Sign Up Free" 注册免费账户
3. 验证邮箱地址
4. 完成账户设置

## 2. 创建受众 (Audience)
1. 登录后，点击 "Audience" -> "Create Audience"
2. 填写受众信息：
   - 受众名称：AI News Subscribers
   - 默认发件人信息：你的姓名和邮箱
   - 公司信息：填写你的信息

## 3. 获取 API 密钥
1. 点击右上角头像 -> "Account"
2. 点击 "Extras" -> "API keys"
3. 点击 "Create A Key"
4. 复制生成的 API 密钥

## 4. 获取 List ID
1. 点击 "Audience" -> "Manage contacts" -> "Settings"
2. 查看 "Audience name and defaults"
3. 找到 "Audience ID" (通常是一串字母数字组合)

## 5. 更新代码配置
在 `src/components/EmailSubscribe.tsx` 文件中：

```javascript
// 替换这两行：
const response = await fetch('https://us21.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members', {
  headers: {
    'Authorization': 'apikey YOUR_API_KEY',
```

替换为：
```javascript
const response = await fetch('https://<YOUR_SERVER_PREFIX>.api.mailchimp.com/3.0/lists/<YOUR_LIST_ID>/members', {
  headers: {
    'Authorization': 'apikey <YOUR_API_KEY>',
```

注意：`<YOUR_SERVER_PREFIX>` 通常在 API 密钥页面显示，比如 `us21`

## 6. 设置邮件自动化
1. 在 Mailchimp 中创建自动化邮件
2. 设置触发器：新订阅者加入时
3. 创建邮件模板，包含 AI 新闻内容

## 7. 测试订阅功能
1. 使用测试邮箱订阅
2. 检查 Mailchimp 受众列表
3. 确认是否收到欢迎邮件

## 替代方案：Sendinblue (Brevo)

如果 Mailchimp 不适合，可以使用 Sendinblue：

1. 注册 [https://sendinblue.com](https://sendinblue.com)
2. 创建联系人列表
3. 获取 API 密钥
4. 使用类似的 API 集成

## 注意事项

- **CORS 问题**：Mailchimp API 可能有 CORS 限制，可能需要通过服务器代理
- **隐私政策**：确保你的网站有隐私政策说明
- **GDPR 合规**：如果是欧盟用户，需要遵循 GDPR 规定
- **退订功能**：Mailchimp 会自动处理退订请求

## 免费计划限制

- **Mailchimp**：最多 2000 订阅者，每月 10000 封邮件
- **Sendinblue**：每天 300 封邮件，无限订阅者
- **ConvertKit**：最多 1000 订阅者

## 推荐方案

对于个人项目或小型网站，推荐使用 **Mailchimp**，因为：
- 界面友好
- 文档完善
- 免费额度足够
- 集成简单