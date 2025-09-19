Markdown Preview + PDF (Monorepo)

- Workspace: pnpm 10.x
- Packages:
  - `packages/renderer`: universal Markdown → HTML 渲染器（GFM/CommonMark/Typora/Obsidian 扩展，KaTeX、Mermaid、Shiki）
  - `apps/server`: Express + Puppeteer，提供 `/api/preview` 与 `/api/pdf`（OpenAPI at `/docs`）
  - `apps/web`: Vite + React 前端，支持实时预览与 PDF 下载

## 快速开始

```bash
pnpm i
pnpm -C packages/renderer build




pnpm -C apps/web dev
```

- 前端: http://localhost:5173
- API 文档: http://localhost:3030/docs

## 测试内置示例

将 `all-markdown-syntax.md` 内容粘贴到左侧编辑器，即可预览所有语法渲染；点击 Download PDF 获取 PDF。

## API（OpenAPI 3.1 摘要）

- POST `/api/preview` → `{ html, assets }`
- POST `/api/pdf` → `application/pdf`

## 备注

- Mermaid 在浏览器和 Puppeteer 中均通过 ESM CDN 运行，已为 PDF 渲染加入等待。
- KaTeX 与 GitHub Markdown CSS 通过 CDN 注入，打印样式在渲染器包内 `styles.css`。

