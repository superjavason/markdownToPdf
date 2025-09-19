# Markdown Preview + PDF

现代化的 Markdown 编辑器，支持实时预览和 PDF 导出，采用 Tailwind CSS + shadcn 设计系统。

## ✨ 特性

- 🎨 **现代化 UI**：基于 Tailwind CSS + shadcn 设计系统
- 🌙 **暗色模式**：支持亮色/暗色主题切换
- ⚡ **实时预览**：支持 GitHub Flavored Markdown
- 📊 **Mermaid 图表**：流程图、序列图等
- 🧮 **数学公式**：KaTeX 渲染支持
- 📱 **响应式设计**：移动端友好
- 📄 **PDF 导出**：一键生成高质量 PDF
- 🔧 **多视图模式**：编辑/分屏/预览模式

## 🏗️ 架构

- **Workspace**: pnpm monorepo
- **packages/renderer**: 通用 Markdown → HTML 渲染器
- **apps/server**: Express API 服务（本地开发）
- **apps/web**: Vite + React 前端应用

## 🚀 本地开发

```bash
# 安装依赖
pnpm install

# 构建渲染器包
pnpm -C packages/renderer build

# 启动开发服务
pnpm -C apps/server dev  # API 服务 (http://localhost:3030)
pnpm -C apps/web dev     # 前端应用 (http://localhost:5173)
```

## 🌐 Vercel 部署

项目已配置 Vercel 部署支持：

1. **推送到 GitHub**
2. **连接 Vercel 项目**
3. **自动部署**

### 部署配置

- `vercel.json`: Vercel 部署配置
- `apps/server/api/`: Serverless Functions
- `apps/web/dist/`: 静态资源输出目录

### API 端点

- `POST /api/preview` → 渲染 Markdown 为 HTML
- `POST /api/pdf` → 生成 PDF 文件
- `GET /docs` → OpenAPI 文档

## 🛠️ 技术栈

### 前端
- **React 19** + **TypeScript**
- **Vite** 构建工具
- **Tailwind CSS** + **shadcn** 设计系统
- **Lucide React** 图标库

### 后端
- **Express.js** (本地) / **Vercel Functions** (生产)
- **Puppeteer** + **@sparticuz/chromium** (PDF 生成)
- **OpenAPI 3.1** 文档

### 渲染引擎
- **unified** + **remark** + **rehype** 生态
- **KaTeX** 数学公式
- **Mermaid** 图表渲染
- **Shiki** 代码高亮

## 📝 支持的 Markdown 语法

- ✅ GitHub Flavored Markdown (GFM)
- ✅ 表格、任务列表、删除线
- ✅ 数学公式 (KaTeX)
- ✅ Mermaid 图表
- ✅ 代码高亮 (Shiki)
- ✅ 脚注、定义列表
- ✅ 前言区 (Front Matter)
- ✅ HTML 内联支持