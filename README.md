# 工作工具平台

一个整合工作开发工具的平台，提升工作效率。

## 功能特性

### 已实现功能

- **会议纪要管理**
  - 创建、编辑、删除会议纪要
  - 记录会议日期、参与人员、会议内容
  - 本地存储（localStorage）
  - 美观的 UI 界面

### 计划功能

- 更多工作工具模块（待扩展）

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
├── app/                    # Next.js App Router 目录
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── MeetingNotes.tsx   # 会议纪要组件
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具函数
└── public/                # 静态资源
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

## 许可证

MIT

