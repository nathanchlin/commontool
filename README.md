# 工作工具平台

一个整合工作开发工具的平台，提升工作效率。

## 功能特性

### 已实现功能

- **会议纪要管理**
  - 创建、编辑、删除会议纪要
  - 记录会议日期、参与人员、会议内容
  - 本地存储（localStorage）
  - 美观的 UI 界面

- **研发日志管理** ⭐ 新功能
  - AI 自动提取关键信息：从企业微信聊天内容中智能提取项目、任务、人员等信息
  - 结构化日志管理：支持任务、Bug、会议、进度等多种类型
  - 企业微信集成：支持 Webhook 接收和 API 拉取消息（需配置）
  - 智能分类：自动识别日志类型、优先级、状态等
  - 筛选与搜索：按类型、项目等条件筛选日志
  - 本地存储：所有数据保存在 localStorage

### 计划功能

- 企业微信 API 完整集成（需要企业管理员权限）
- 日志导出功能（Markdown、Excel）
- 定时报告生成
- 更多工作工具模块

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **代码规范**: ESLint

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
work-tools/
├── app/                           # Next.js App Router 目录
│   ├── api/                       # API 路由
│   │   ├── ai/
│   │   │   └── extract/           # AI 信息提取 API
│   │   └── wechat/                # 企业微信 API
│   │       ├── pull/              # 拉取消息
│   │       └── webhook/           # Webhook 接收
│   ├── globals.css                # 全局样式
│   ├── layout.tsx                 # 根布局
│   └── page.tsx                   # 首页
├── components/                     # React 组件
│   ├── MeetingNotes.tsx           # 会议纪要组件
│   └── DevLogs.tsx                # 研发日志组件
├── types/                          # TypeScript 类型定义
│   └── index.ts                   # 类型定义
├── utils/                          # 工具函数
│   ├── storage.ts                 # 本地存储工具
│   └── index.ts                   # 其他工具函数
└── public/                         # 静态资源
```

## 开发说明

### 添加新工具模块

1. 在 `components/` 目录下创建新组件
2. 在 `app/page.tsx` 中集成新工具
3. 根据需要添加类型定义和工具函数

### 数据存储

当前使用 `localStorage` 进行本地存储。未来可以考虑：
- 后端 API 集成
- 数据库存储
- 云存储方案

### 研发日志功能使用说明

#### AI 信息提取

1. 点击"AI 提取"按钮
2. 粘贴企业微信聊天内容
3. 选择项目名称（可选）
4. 点击"开始提取"，AI 会自动识别：
   - 日志类型（任务/Bug/会议/进度）
   - 标题和关键信息
   - 参与人员
   - 优先级和状态
   - 相关标签

#### 企业微信集成

**Webhook 接收（需要企业管理员权限）：**
1. 在企业微信管理后台创建应用
2. 配置回调 URL：`https://your-domain.com/api/wechat/webhook`
3. 设置 Token 和 EncodingAESKey
4. 企业微信会自动推送消息到该接口

**API 拉取（需要企业管理员权限）：**
1. 获取企业 ID (corpId)、应用 ID (agentId)、应用密钥 (secret)
2. 调用 `/api/wechat/pull` 接口拉取消息
3. 消息会自动触发 AI 提取并生成日志

**注意：** 当前 AI 提取使用规则匹配作为 fallback，建议接入真实的 AI API（如 OpenAI、Claude 等）以获得更好的提取效果。

## 许可证

MIT

