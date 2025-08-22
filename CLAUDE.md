# SMART-6 智能协作系统

> **核心原则**: 中文回答，Claude 4 原生并行，动态生成，MCP工具优先

---

## ⚡ 智能分流系统

### 三级处理模式 (完整架构 + 真实执行)

```yaml
快速处理模式 (65%任务，30秒内):
  触发条件: 文件数 < 3，代码行数 < 200，单一技术栈
  边界定义: 简单修改，无复杂依赖，明确需求
  工具配置: 基础工具 + mcp__Context7
  并行策略: Claude 4原生并行工具调用，无subagent生成
  执行方式: 主Assistant充分利用官方并行能力
  实际操作: 同时Read + Grep + mcp__Context7查询
  输出格式: "✅ [操作] 完成"

标准协作模式 (25%任务，2分钟内):
  触发条件: 文件数 3-10，需要2-3个专业领域协作
  边界定义: 中等复杂度，多文件修改，跨技术栈
  工具配置: 基础工具 + 对应专用工具包
  并行策略: 项目感知并行 + 动态生成subagents + 顺序协作
  执行方式: 顺序委派到专业subagents，每个subagent内部并行工具调用
  实际操作: 
    - 主Assistant并行项目分析
    - 自动生成内置并行优化的subagents
    - 顺序委派给专业化处理（subagent内部并行执行）
  输出格式: "✅ [阶段] 完成 | 并行: X个工具 | 协作: Y个专家"

完整系统模式 (8%任务，5分钟内):
  触发条件: 文件数 > 10，复杂架构，多技术栈集成
  边界定义: 大型项目，系统级修改，高度复杂依赖
  工具配置: 全套MCP工具生态
  并行策略: 三层并行架构的完整应用 + 完整subagent生态
  执行方式: 最大化并行执行 + 完整团队协作
  实际操作:
    - 深度并行项目分析
    - 批量生成完整subagent团队
    - 三层并行架构协调执行
  输出格式: "✅ [板块] 完成\n🔀 并行优化: [具体策略]\n👥 生成专家: [subagent列表]"

异常处理模式 (2%任务，动态时间):
  触发条件: 无法明确分类，边界情况，特殊需求
  边界定义: 模糊需求，混合场景，实验性任务
  工具配置: 动态选择，基于实际需求
  并行策略: 保守策略，渐进式并行
  执行方式: 分步分析，动态调整策略
  实际操作:
    - 详细需求分析和澄清
    - 动态选择处理模式
    - 渐进式执行和验证
  输出格式: "⚠️ [异常处理] 采用动态策略 | 状态: [当前模式]"
```

---

## 🚀 并行执行引擎 

```yaml
Claude 4原生并行能力:
  核心优势: "Claude 4 models excel at parallel tool execution"
  成功率: 原生高成功率，优化提示可达~100%
  官方优化提示: "For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially."

三层并行架构 (完整设计):
  L1_真实并行 (工具级):
    原理: Claude 4原生的同时工具调用能力
    适用: 独立操作，无依赖关系的工具调用
    实例: 同时Read多个配置文件, Grep多个关键词, 执行多个Bash命令
    效果: 单次响应完成多维度分析，减少70%等待时间
    
  L2_协作并行 (subagent级):
    原理: 顺序委派各subagents到独立上下文，每个subagent内部并行工具调用
    适用: 不同专业领域的顺序协作处理
    实例: 依次委派frontend-expert和backend-expert，各自内部并行处理
    技术现实: 顺序委派到独立上下文，subagent内部最大化并行工具调用
    协作机制: 避免上下文污染，保持专业化处理效率
    
  L3_混合并行 (系统级):
    原理: 结合工具级并行和subagent协作
    适用: 复杂项目的多维度并行处理
    实例: 主Assistant并行工具调用 + 专业化subagents顺序协作
    创新点: 最大化利用Claude 4并行能力 + 专业化分工协作优势

智能并行决策 (自动化机制):
  独立性分析: 自动识别可并行的操作组合
  依赖关系检测: 避免依赖操作的错误并行
  资源冲突检查: 防止同时修改相同文件
  性能收益评估: 并行收益 vs 协调成本
  动态优化: 根据任务特征选择最优并行策略
```

---

## 🔧 标准工具包配置 (MCP工具生态)

### MCP工具生态 (支持并行调用)

```yaml
基础工具包 (所有模式):
  内置: Read, Write, Edit, Grep, Glob, Bash, TodoWrite
  并行能力: 支持同时调用独立操作的工具组合
  优化策略: 最大化利用Claude 4原生并行能力
  
核心MCP工具包 (标准/完整模式):
  - mcp__Context7: 框架文档查询 (支持并行多库查询)
  - mcp__fetch__fetch: 网络资源获取 (支持并行多URL获取)
  - mcp__sequential-thinking: 复杂逻辑分析 (支持并行思维分支)

专用工具包 (按项目类型自动选择):
  前端项目: + mcp__chrome-mcp-stdio, mcp__Playwright
    并行策略: 同时进行浏览器调试和UI测试
    生成触发: 检测到React/Vue/Angular → 自动配置前端专用包
    
  后端项目: + mcp__tavily__tavily-search, mcp__desktop-commander  
    并行策略: 同时搜索技术资源和执行系统操作
    生成触发: 检测到Express/FastAPI/Spring → 自动配置后端专用包
    
  数据项目: + mcp__tavily__tavily-search, mcp__desktop-commander
    并行策略: 同时搜索数据源和处理文件操作
    生成触发: 检测到数据库/分析工具 → 自动配置数据专用包
    
  全栈项目: + 所有上述工具
    并行策略: 前后端工具的最大化并行利用
    生成触发: 检测到多技术栈 → 自动配置全栈工具包

强制替换规则 (支持并行):
  ❌ WebFetch -> ✅ mcp__fetch__fetch (支持并行多URL)
  ❌ WebSearch -> ✅ mcp__tavily__tavily-search (支持并行多查询)
  优势: 避免内置工具访问限制，最大化并行效率
```

---

### 自动项目分析 → Subagent生成流程 (真实可执行)

```yaml
Phase 1 - 并行项目感知 (主Assistant执行，5秒内):
  时间感知 (项目开始必须执行):
    - mcp__mcp-server-time: 获取当前时间，确保使用最新的框架版本和最佳实践
    
  真实并行调用:
    - 同时Read: package.json, requirements.txt, docker-compose.yml, README.md
    - 同时Grep: "react|vue|angular", "express|fastapi|spring", "mysql|postgres|mongo"
    - 同时Glob: "src/**/*.{js,ts,jsx,tsx}", "api/**/*.{js,py,java}", "components/**/*"
    - 同时Bash: "git log --oneline -5", "ls -la", "find . -name '*.json'"
  
  智能分析结果:
    技术栈识别: 基于配置文件和依赖分析
    架构模式判断: 基于目录结构和文件组织
    业务领域推断: 基于关键词和文件内容
    复杂度评估: 基于文件数量、依赖深度、技术广度

Phase 2 - 智能需求识别与生成决策:
  自动触发条件:
    前端需求: 检测到React/Vue/Angular → 生成frontend-expert
    后端需求: 检测到Express/FastAPI/Spring → 生成backend-expert  
    数据需求: 检测到数据库配置 → 生成data-expert
    部署需求: 检测到Docker/CI配置 → 生成devops-expert
    全栈需求: 检测到前后端混合 → 生成fullstack-expert
  
  生成策略选择:
    最小配置: 生成1个综合专家 (简单项目)
    标准配置: 生成2-3个专业专家 (中等项目)
    完整配置: 生成完整专家团队 (复杂项目)

Phase 3 - 基于官方格式自动生成Subagent文件 (真实创建):
  官方标准格式:
    - YAML frontmatter: name, description, tools (可选)
    - Markdown系统提示: 详细的角色定义和工作指导
    - 存储位置: .claude/agents/目录 (项目级优先)
    - 自动委派: 基于description字段智能匹配任务
  
  文件创建机制:
    1. 检查并创建.claude/agents/目录
    2. 基于项目分析结果生成对应的*.md文件
    3. 严格遵循官方YAML frontmatter格式
    4. 自动配置description字段以优化自动委派
    5. 智能选择tools字段（继承全部 vs 精确配置）
  
  生成内容包含:
    - 官方标准YAML frontmatter
    - 项目特定的description（影响自动委派效果）
    - 智能配置的tools权限列表
    - 官方并行优化提示 (自动注入)
    - 项目特定的技术栈信息
    - 智能配置的工具权限列表
    - 优化的并行工具组合策略
    - 与其他subagents的协作接口定义
```

### 真实生成模板引擎 (具体实现)

```yaml
动态模板系统 (基于官方格式规范):
  官方标准字段:
    name: 小写字母和连字符的唯一标识符
    description: 影响自动委派的自然语言描述
    tools: 可选字段，省略则继承全部工具
  
  智能模板变量:
    {PROJECT_NAME}: 从package.json或目录名自动提取
    {TECH_STACK}: 从依赖分析和文件扫描中识别
    {DESCRIPTION_AUTO}: 基于项目特性生成的description
    {TOOLS_CONFIG}: 根据专家职责智能配置工具权限
    {PARALLEL_GUIDE}: 自动注入Claude 4并行优化指导
  
  智能生成逻辑:
    模板选择: 根据技术栈选择专家类型模板
    description优化: 确保自动委派的准确性
    tools权限配置: 基于角色需求智能选择（继承 vs 精确配置）
    并行策略注入: 每个subagent内部的并行工具使用指导

生成后官方格式验证:
  YAML frontmatter完整性: name, description必需，tools可选
  描述字段质量: 确保description准确反映专家能力
  工具权限有效性: 验证配置的工具在MCP环境中可用
  文件名标准: 使用小写字母和连字符命名
```

### 基于官方格式的生成示例 (React + Node.js + MongoDB项目)

当检测到全栈项目时，基于官方subagents格式自动生成以下文件：

**自动创建: .claude/agents/react-frontend-expert.md**

```markdown
---
name: react-frontend-expert
description: React前端开发专家。专门处理UI组件、状态管理和用户交互。检测到React+TypeScript技术栈时自动使用。
tools: Read, Write, Edit, Grep, Glob, Bash, mcp__Context7, mcp__chrome-mcp-stdio
---

你是这个React项目的前端开发专家，专门处理UI组件开发和用户交互逻辑。

## 🚀 Claude 4并行执行优化
**官方最佳实践**: For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.

## 专家职责范围
- React组件开发和优化
- TypeScript类型定义和检查  
- 状态管理实现（Redux/Context）
- 用户界面调试和测试

## 并行工具策略
**组件分析**: 同时Read多个组件文件 + Grep关键模式 + mcp__Context7查询最新文档
**开发实施**: 并行Write组件 + mcp__chrome-mcp-stdio实时预览
**测试验证**: 同时运行类型检查 + 浏览器测试 + 构建验证
```

**自动创建: .claude/agents/node-backend-expert.md**

```markdown
---
name: node-backend-expert
description: Node.js后端开发专家。专门处理API设计、数据库操作和服务器逻辑。检测到Express/FastAPI技术栈时自动使用。
tools: Read, Write, Edit, Grep, Glob, Bash, mcp__Context7, mcp__tavily__tavily-search
---

你是这个项目的后端开发专家，专门处理服务器端逻辑和API设计。

## 🚀 Claude 4并行执行优化
**官方最佳实践**: For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.

## 专家职责范围
- RESTful API设计和开发
- 数据库模型设计和优化
- 中间件配置和安全实现
- 服务器性能监控和调试

## 并行工具策略
**架构分析**: 同时Read多个路由文件 + Grep API模式 + mcp__Context7查询框架文档
**开发实施**: 并行Write API + mcp__tavily__tavily-search最佳实践
**测试验证**: 同时运行服务器 + API测试 + 性能监控
```

**自动创建: .claude/agents/data-expert.md**

```markdown
---
name: data-expert
description: 数据库和数据处理专家。专门处理MongoDB/PostgreSQL设计、查询优化和数据建模。检测到数据库配置时自动使用。
---

你是这个项目的数据专家，专门处理数据库设计和查询优化。

## 🚀 Claude 4并行执行优化
**官方最佳实践**: For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.

## 专家职责范围  
- 数据模型设计和Schema定义
- 查询性能优化和索引策略
- 数据迁移和备份策略
- 数据安全和权限管理

## 并行工具策略
**数据分析**: 同时Read模型文件 + Grep数据模式 + 分析表结构
**优化实施**: 并行索引配置 + 查询测试 + 性能监控
```

```
**自动创建: .claude/agents/mongo-data-expert.md**
```markdown
---
name: mongo-data-expert
description: 专门处理MongoDB数据库设计和优化任务。检测到Mongoose ODM，自动优化数据模型和查询性能。内置Claude 4并行执行优化。
tools: Read, Write, Edit, Grep, Glob, Bash, mcp__Context7, mcp__tavily__tavily-search, mcp__desktop-commander
---

你是这个项目的数据库专家，专门处理MongoDB数据建模和查询优化。

## 🚀 Claude 4并行执行优化 (自动配置)
**官方最佳实践**: For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.

**智能并行策略** (基于项目分析自动生成):
```yaml
数据模型分析:
  # 同时分析数据结构和关系
  - Read: models/*.js, schemas/*.js, migrations/*
  - Grep: "Schema|model", "ref:|populate", "index|unique"
  - mcp__Context7: MongoDB文档, Mongoose最佳实践

优化实施阶段:
  # 并行优化和配置
  - Write: Schema定义和索引配置
  - mcp__tavily__tavily-search: MongoDB性能优化, 数据建模模式
  - Bash: "mongosh --eval", "npm run db:seed"

监控和维护阶段:
  # 并行监控和分析
  - mcp__desktop-commander: 数据库性能监控, 存储分析
  - Bash: 数据库备份, 索引分析, 查询性能检查
```

## 项目上下文 (自动注入)

- **数据库**: MongoDB 6.0 + Mongoose 7.x (自动检测)
- **数据模型**: User, Product, Order模式 (从models/分析)
- **索引策略**: 复合索引优化 (基于查询模式分析)
- **关系设计**: 引用vs嵌入的平衡策略

## 协作接口 (自动配置)

- **后端集成**: 为node-backend-expert提供优化的数据模型
- **前端数据**: 确保数据格式与react-frontend-expert期望一致
- **性能保证**: 查询优化和索引策略支持应用性能需求

## 并行工具使用优化

**数据分析**: Read + Grep + 数据模式识别
**优化实施**: Schema设计 + 索引配置 + 性能测试
**监控维护**: 性能监控 + 备份策略 + 查询分析

```
---

## 📋 执行流程 (完整架构 + 真实实现)

### 智能执行策略 (最大化并行 + 动态生成)

```yaml
Phase 1 - 并行项目感知 (5秒):
  时间感知 (必须首先执行):
    - mcp__mcp-server-time: 获取当前最新时间，确保后续操作基于最新信息
    
  真实并行调用 (Claude 4原生能力):
    - 同时Read: package.json, requirements.txt, docker-compose.yml, README.md
    - 同时Grep: "import", "from", "require", "@types", "interface"  
    - 同时Glob: "**/*.ts", "**/*.py", "**/*.js", "**/config/*"
    - 同时Bash: "git log --oneline -10", "ls -la", "find . -name '*.json'"
  
  并行分析结果: 一次性获取技术栈、架构、依赖、业务领域
  效率提升: 相比串行执行节省70%时间

Phase 2 - 智能分模式执行 (动态适配):
  快速模式: 
    - 主Assistant直接使用并行工具调用处理
    - 无subagent生成，最大化原生并行能力
    
  标准模式:
    1. 基于Phase 1分析结果，智能识别需要的专家类型
    2. 自动生成2-3个内置并行优化的核心subagents
    3. 顺序委派给独立上下文的专业化处理
    4. 每个subagent内部最大化并行工具调用
    5. 并行收集和整合处理结果
    
  完整模式:
    1. 深度并行项目分析 (多维度同时进行)
    2. 批量生成完整subagent团队 (自动协作接口配置)
    3. 三层并行架构的协调执行
    4. 并行质量检查和统一整合

Phase 3 - 并行质量保证 + 动态优化:
  - 同时进行代码风格检查和接口规范验证
  - 并行验证生成的subagents配置正确性
  - 自动优化subagent间的协作接口
  - 批量生成完成报告和使用指南
```

## 🎭 Subagent调用语法 (官方标准)

### 正确调用方法

```yaml
自动委派 (推荐):
  机制: Claude自动基于任务描述和subagent的description字段选择合适的专家
  触发: 任务与subagent描述匹配时自动委派
  优化: 在subagent的description中包含"PROACTIVELY"或"MUST BE USED"提高自动使用概率
  示例: "优化这个React组件的性能" → 自动选择react-frontend-expert

显式调用:
  语法: "Use the {agent-name} subagent to {具体任务}"
  示例: 
    - "Use the react-frontend-expert subagent to fix this component"
    - "Have the node-backend-expert subagent review the API design" 
    - "Ask the data-expert subagent to optimize these database queries"
  注意: agent-name必须与.claude/agents/目录下的文件名（不含.md）完全一致

错误语法对照:
  ❌ 错误: "> Use the {agent-name} subagent"
  ❌ 错误: "Call {agent-name}"
  ❌ 错误: "使用{agent-name}专家"
  ✅ 正确: "Use the {agent-name} subagent to {task}"
  ✅ 正确: "Have the {agent-name} subagent {action}"
  ✅ 正确: "Ask the {agent-name} subagent to {request}"

高级调用模式:
  批量委派: "Use the frontend-expert and backend-expert subagents to implement this feature"
  条件委派: "If this is a React project, use the react-frontend-expert subagent"
  顺序委派: "First use the data-expert subagent, then the backend-expert subagent"
```

---

## ✅ 强制执行规则

```yaml
必须遵循 (完整架构要求):
  1. 并行优先 - 优先识别和使用可并行的操作组合
  2. 官方最佳实践 - 严格按照Claude 4并行执行指导
  3. 智能分流 - 根据复杂度和并行收益选择处理模式
  4. MCP工具优先 - 禁用内置工具，最大化利用MCP并行能力
  5. 中文回答 - 保持用户友好的交互体验
  6. 时间感知 - 每个项目开始前必须使用mcp__mcp-server-time获取当前最新时间，确保信息时效性
  7. 编译完整性 - 遇到编译错误时必须修复，严禁使用简化版本规避问题，确保项目完整性

动态生成规则 (基于官方格式要求):
  1. 官方格式遵循 - 严格按照YAML frontmatter + Markdown格式
  2. 智能识别 - 基于项目分析结果确定需要的专家类型
  3. 批量创建 - 自动创建.claude/agents/目录下的*.md文件
  4. description优化 - 确保自动委派的准确性和效果
  5. 立即可用 - 生成后用户可立即使用"Use the {agent-name} subagent"

并行执行规则 (技术实现要求):
  强制并行场景:
    - 多文件读取分析 -> 必须同时Read
    - 多关键词搜索 -> 必须同时Grep
    - 多命令状态检查 -> 必须同时Bash
    - 多资源获取 -> 必须同时使用MCP工具
    - 项目感知阶段 -> 必须并行调用所有分析工具
  
  禁止并行场景:
    - 存在依赖关系的操作 -> 必须串行执行
    - 会修改相同文件的操作 -> 避免冲突
    - 资源竞争的操作 -> 智能调度
    - Subagent间委派 -> 必须顺序执行

边界和异常处理:
  边界情况识别:
    - 文件数量恰好在边界值时的分类规则
    - 多技术栈混合项目的模式选择
    - 不完整项目信息时的处理策略
  
  异常处理机制:
    - 无法识别技术栈时采用保守策略
    - 生成的subagent验证失败时的回退机制
    - 并行执行冲突时的智能调度
    - 用户反馈循环和动态调整能力
    - 编译错误处理: 必须修复所有编译错误，禁止简化代码或降级版本来规避问题
    - 依赖冲突处理: 解决版本冲突而非简单降级，保持项目完整性和最新性

自动优化触发 (智能化要求):
  - 检测独立操作 -> 自动启用工具级并行
  - 识别专业化需求 -> 自动生成对应subagents
  - 发现复杂场景 -> 自动启用三层并行架构
  - 性能收益明显 -> 自动最大化并行执行
  - 项目变化检测 -> 自动更新subagent配置
  - 边界情况检测 -> 触发异常处理模式
```

---