# DailyFit

<div align="center">

<img src="./src/assets/logo.png" alt="DailyFit Logo" width="120" />

**一个现代化的健身管理应用，帮助您记录训练数据、追踪进度并实现健身目标**

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?logo=express)](https://expressjs.com/)
[![Mantine](https://img.shields.io/badge/Mantine-8.3.7-339AF0?logo=mantine)](https://mantine.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-8+-F69220?logo=pnpm)](https://pnpm.io/)
[![Lint](https://img.shields.io/badge/ESLint%20%2B%20Prettier%20%2B%20Husky-A020F0?logo=eslint)](#-开发指南)
[![CI/CD](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?logo=githubactions)](https://github.com/features/actions)
[![Hosting](https://img.shields.io/badge/Vercel-Frontend%20Hosting-000000?logo=vercel)](https://vercel.com/)
[![Lottie](https://img.shields.io/badge/Lottie-Animations-57B8FF?logo=lottie)](https://lottiefiles.com/)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构) • [API 文档](#-api-文档)

</div>

---

## 📋 目录

- [关于项目](#-关于项目)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
  - [环境要求](#环境要求)
  - [安装依赖](#安装依赖)
  - [开发模式](#开发模式)
  - [生产构建](#生产构建)
- [开发指南](#-开发指南)
  - [代码规范](#代码规范)
  - [项目配置](#项目配置)
  - [路由配置](#路由配置)
- [API 文档](#-api-文档)
  - [认证接口](#认证接口)
  - [仪表板接口](#仪表板接口)
  - [日志本接口](#日志本接口)
- [环境变量](#-环境变量)
- [部署](#-部署)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎯 关于项目

DailyFit 是一个全栈健身管理应用，旨在帮助用户轻松记录和管理日常训练数据。通过直观的界面和强大的数据可视化功能，用户可以追踪训练进度、分析趋势并实现健身目标。

### 核心价值

- 📊 **数据驱动**：通过图表和统计信息深入了解训练表现
- 🎨 **现代 UI**：基于 Mantine UI 构建的美观界面
- 🔒 **安全可靠**：完整的用户认证和授权系统
- 📱 **响应式设计**：完美适配桌面和移动设备
- ⚡ **高性能**：使用 Vite 构建，快速加载和热更新

---

## ✨ 功能特性

### 🔐 用户认证

- 安全的登录系统
- Token 认证机制
- 自动登录状态验证
- 路由守卫保护

### 📊 仪表板

- 训练日历热力图
- 体重趋势分析
- 个人记录追踪
- 训练统计概览
- 多维度数据可视化（ECharts）

### 📝 训练日志本

- 支持多种训练类型：
  - 💪 力量训练（重量、组数、次数）
  - 🏃 有氧运动（时长、距离、心率）
  - 🧘 功能性训练
  - 🤸 柔韧性训练
- 训练记录 CRUD 操作
- 分页和筛选功能
- 日期选择器

### 👤 个人资料

- 用户信息管理
- 个人资料编辑
- 头像上传（规划中）

### 🎨 主题系统

- 明暗主题切换
- 流畅的动画过渡
- 系统主题自动检测

### 🏠 首页

- 精美的 Landing Page 设计
- 核心功能展示卡片
- 动画效果增强用户体验
- 响应式布局适配

### 🚀 其他特性

- 路由懒加载优化
- 全局通知系统
- 模态框管理
- 404 错误页面
- 响应式布局
- Lottie 动画提升加载体验
- Vercel Serverless Function 支持

---

## 🛠 技术栈

### 前端

| 技术                | 版本     | 用途        |
| ------------------- | -------- | ----------- |
| **React**           | 19.1.1   | UI 框架     |
| **TypeScript**      | 5.9.3    | 类型安全    |
| **Vite**            | 7.1.7    | 构建工具    |
| **React Router**    | 7.9.5    | 路由管理    |
| **Mantine UI**      | 8.3.7    | UI 组件库   |
| **Zustand**         | 5.0.8    | 状态管理    |
| **Axios**           | 1.13.2   | HTTP 客户端 |
| **ECharts**         | 6.0.0    | 数据可视化  |
| **Framer Motion**   | 12.23.24 | 动画库      |
| **Day.js**          | 1.11.19  | 日期处理    |
| **React Hook Form** | 7.66.0   | 表单管理    |
| **Lottie React**    | 2.4.1    | 动画播放    |

### 后端

| 技术            | 版本   | 用途       |
| --------------- | ------ | ---------- |
| **Express**     | 4.21.2 | Web 框架   |
| **Node.js**     | -      | 运行时环境 |
| **CORS**        | 2.8.5  | 跨域支持   |
| **Body Parser** | 1.20.3 | 请求体解析 |

### 开发工具

- **pnpm** - 高性能包管理器（版本 10.20.0）
- **ESLint + Prettier + Husky** - 提交前的自动化代码质量保障
- **ESLint Flat Config** - 使用新的扁平化配置格式（`eslint.config.js`）
- **Concurrently** - 并发运行脚本
- **TypeScript ESLint** - TypeScript 代码检查
- **GitHub Actions** - 持续集成与自动化测试
- **Vercel** - 无服务器化全栈部署平台（支持 Serverless Functions）

---

## 📁 项目结构

```
DailyFit/
├── api/                    # Vercel Serverless Function
│   └── index.js            # Serverless 入口文件
├── public/                 # 静态资源
│   └── favicon.ico
├── server/                 # 后端服务
│   ├── controllers/        # 控制器
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── logbookController.js
│   ├── data/               # 数据文件（JSON）
│   │   ├── dashboard.json
│   │   ├── logbook.json
│   │   └── users.json
│   ├── middleware/         # 中间件
│   │   └── index.js
│   ├── routes/             # 路由定义
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── logbook.js
│   ├── utils/              # 工具函数
│   │   └── dataPath.js
│   └── index.js            # 服务器入口
├── src/                    # 前端源码
│   ├── assets/             # 资源文件
│   │   └── logo.png
│   ├── components/         # 组件
│   │   ├── AppShell/       # 主布局
│   │   ├── AuthGuard/      # 路由守卫
│   │   └── ThemeToggle/    # 主题切换
│   ├── pages/              # 页面组件
│   │   ├── Dashboard/      # 仪表板
│   │   ├── Home/           # 首页
│   │   ├── Logbook/        # 训练日志
│   │   ├── Login/          # 登录页
│   │   ├── Profile/        # 个人资料
│   │   └── NotFound/       # 404 页面
│   ├── router/             # 路由配置
│   │   └── index.tsx
│   ├── stores/             # 状态管理
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── utils/              # 工具函数
│   │   ├── logbook.ts
│   │   └── request.tsx
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── eslint.config.js        # ESLint 配置（Flat Config）
├── prettier.config.js      # Prettier 配置
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── pnpm-lock.yaml          # 依赖锁定文件
├── pnpm-workspace.yaml     # pnpm 工作区配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.app.json       # TypeScript 应用配置
├── tsconfig.node.json      # TypeScript Node 配置
├── vercel.json             # Vercel 部署配置
└── vite.config.ts          # Vite 配置
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 10.20.0（推荐，项目使用 `pnpm@10.20.0`）或 npm >= 9.0.0

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发模式

启动前端和后端开发服务器（同时运行）：

```bash
pnpm dev
```

或者分别启动：

```bash
# 启动前端开发服务器（默认端口 5173）
pnpm dev:client

# 启动后端服务器（默认端口 3000）
pnpm dev:server
```

访问应用：

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

### 生产构建

```bash
# 构建前端
pnpm build

# 启动生产服务器
pnpm start
```

---

## 💻 开发指南

### 代码规范

项目使用 ESLint（Flat Config 格式）和 Prettier 进行代码规范检查：

```bash
# 检查代码规范
pnpm lint

# 自动修复代码格式
pnpm format
```

Git 提交前会自动运行格式化和检查（通过 Husky）。

**配置文件位置**：

- ESLint 配置：`eslint.config.js`（使用新的扁平化配置格式）
- Prettier 配置：`prettier.config.js`

### 项目配置

#### Vite 配置

开发服务器代理配置在 `vite.config.ts` 中：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

#### TypeScript 配置

- `tsconfig.json` - 主配置文件
- `tsconfig.app.json` - 应用配置
- `tsconfig.node.json` - Node.js 配置

### 路由配置

路由定义在 `src/router/index.tsx` 中，支持：

- **公开路由**：无需认证即可访问（如 `/home`、`/login`）
- **私有路由**：需要登录认证（如 `/dashboard`、`/logbook`、`/profile`）
- **布局控制**：可选择是否使用主布局
- **懒加载**：所有页面组件使用 React.lazy 懒加载

示例路由配置：

```typescript
{
  path: '/dashboard',
  element: <DashboardPage />,
  requiresAuth: true,    // 需要认证
  hasLayout: true,       // 使用主布局
}
```

当前路由列表：

- `/` - 重定向到 `/login`
- `/home` - 首页（公开路由，使用主布局）
- `/login` - 登录页（公开路由，无布局）
- `/dashboard` - 仪表板（私有路由）
- `/logbook` - 训练日志（私有路由）
- `/profile` - 个人资料（私有路由）
- `*` - 404 页面（无布局）

### CI/CD 流程

- **GitHub Actions**：建议在 `.github/workflows/ci.yml` 中创建流水线，使用 `pnpm` 安装依赖并运行 `pnpm lint`、`pnpm test`（如有）以保障主干质量。
- **Vercel Preview**：将仓库连接到 Vercel，每次推送或 Pull Request 会自动生成预览环境，便于回归验证。
- **受保护的主分支**：结合 Husky 的本地钩子与 Actions 上的远端校验，确保格式化与静态检查双重通过后再合并。

---

## 📡 API 文档

### 基础 URL

- 开发环境：`http://localhost:3000`
- 生产环境：根据部署配置

### 认证接口

#### 用户登录

```http
POST /api/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应：**

```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

#### 验证 Token

```http
GET /api/auth/verify
Authorization: Bearer {token}
```

#### 获取用户资料

```http
GET /api/profile
Authorization: Bearer {token}
```

#### 更新用户资料

```http
PUT /api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "string",
  "name": "string"
}
```

### 仪表板接口

#### 获取仪表板数据

```http
GET /api/dashboard
Authorization: Bearer {token}
```

**响应：**

```json
{
  "trainingCalendar": [["2024-01-01", 5], ...],
  "weightTrend": [["2024-01-01", 70.5], ...],
  "personalRecords": [...],
  "statistics": {...}
}
```

### 日志本接口

#### 获取日志列表

```http
GET /api/logbook?page=1&limit=10
Authorization: Bearer {token}
```

#### 获取单条日志

```http
GET /api/logbook/:id
Authorization: Bearer {token}
```

#### 创建日志

```http
POST /api/logbook
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-01",
  "type": "strength",
  "items": [...]
}
```

#### 更新日志

```http
PUT /api/logbook/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-01",
  "type": "strength",
  "items": [...]
}
```

#### 删除日志

```http
DELETE /api/logbook/:id
Authorization: Bearer {token}
```

### 健康检查

```http
GET /api/health
```

---

## 🔧 环境变量

创建 `.env` 文件（可选）：

```env
# 服务器端口
PORT=3000

# 环境模式
NODE_ENV=development

# JWT 密钥（生产环境必须设置）
JWT_SECRET=your_secret_key_here
```

---

## 🚢 部署

### 构建生产版本

```bash
# 构建前端
pnpm build

# 构建产物在 dist/ 目录
```

### 部署步骤

1. **构建项目**

   ```bash
   pnpm build
   ```

2. **设置环境变量**

   在生产服务器上设置必要的环境变量。

3. **启动服务器**

   ```bash
   pnpm start
   ```

   或使用 PM2：

   ```bash
   pm2 start server/index.js --name dailyfit
   ```

4. **配置反向代理**（推荐）

   使用 Nginx 作为反向代理：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           root /path/to/dailyfit/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### GitHub Actions + Vercel 自动部署

项目已配置 Vercel Serverless Function，通过 `api/index.js` 将 Express 应用转换为无服务器函数。

1. **配置 Vercel 项目**
   - 在 Vercel 中导入 GitHub 仓库，选择 `pnpm` 作为包管理器。
   - 设置环境变量，与本地 `.env` 保持一致。
   - Vercel 会自动识别 `vercel.json` 配置文件。

2. **Vercel 配置说明**

   `vercel.json` 配置了：
   - **Serverless Function**：`api/index.js` 作为 API 入口
   - **静态构建**：前端构建产物在 `dist/` 目录
   - **路由重写**：`/api/*` 请求转发到 Serverless Function，其他请求返回 `index.html`

3. **创建 GitHub Actions 工作流**（示例）

   ```yaml
   name: CI

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
           with:
             version: 10.20.0
         - uses: actions/setup-node@v4
           with:
             node-version: 18
             cache: pnpm
         - run: pnpm install --frozen-lockfile
         - run: pnpm lint
         - run: pnpm build
   ```

4. **启用 Vercel Git 集成**
   - Actions 构建通过后，Vercel 根据主分支自动触发生产部署。
   - Pull Request 将自动生成 Preview URL 供验收。
   - Serverless Function 会自动部署，无需额外配置。

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork 项目**

2. **创建功能分支**

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **提交更改**

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **推送到分支**

   ```bash
   git push origin feature/AmazingFeature
   ```

5. **开启 Pull Request**

### 代码提交规范

- 使用有意义的提交信息
- 确保代码通过 ESLint 检查
- 确保代码格式符合 Prettier 规范
- 添加必要的注释和文档

---

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个 Star！**

Made with ❤️ by [fufu39](https://github.com/fufu39)

</div>
