import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkWikiLink from 'remark-wiki-link';
import remarkDeflist from 'remark-deflist';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import type { Options as PrettyOptions } from 'rehype-pretty-code';
import rehypeMermaid from './rehypeMermaid';

export interface RenderOptions {
  enableRawHtml?: boolean;
  baseUrl?: string;
  wikiLinkAliasDivider?: string;
  prettyCode?: PrettyOptions;
}

export interface RenderResult {
  html: string;
  assets: {
    cssHrefs: string[];
    inlineCss: string[];
    jsModules: string[];
  };
}

const defaultPretty: PrettyOptions = {
  theme: 'github-dark',
};

export async function renderMarkdown(markdown: string, options: RenderOptions = {}): Promise<RenderResult> {
  const enableRawHtml = options.enableRawHtml ?? true;

  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .use(remarkDirective)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDeflist)
    .use(remarkWikiLink, {
      aliasDivider: options.wikiLinkAliasDivider ?? '|',
      hrefTemplate: (permalink: string) => {
        const encoded = encodeURIComponent(permalink);
        return options.baseUrl ? `${options.baseUrl}#${encoded}` : `#${encoded}`;
      },
    })
    .use(remarkRehype, { allowDangerousHtml: enableRawHtml });

  if (enableRawHtml) processor.use(rehypeRaw);

  processor
    .use(rehypeMermaid)
    .use(rehypeKatex)
    .use(rehypePrettyCode, options.prettyCode ?? defaultPretty)
    .use(rehypeStringify, { allowDangerousHtml: enableRawHtml });

  const file = await processor.process(markdown);

  const cssHrefs = [
    // GitHub 样式，保证在多数平台有一致的基础排版
    'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.min.css',
    // KaTeX 样式
    'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css',
  ];

  const inlineCss: string[] = [
    // 组件包内的基础样式（打印、布局等）
    baseCss,
  ];

  const jsModules: string[] = [
    // Mermaid 运行时，用于将 <pre class="language-mermaid"> 或 ```mermaid 内容渲染为图
    // 这里采用 ESM CDN，网页端直接使用；在服务端 PDF 渲染时通过 Puppeteer 预热
    'https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs',
  ];

  return {
    html: String(file),
    assets: { cssHrefs, inlineCss, jsModules },
  };
}

export const baseCss = `
/* 统一容器类，建议在页面中包裹 markdown-body 以复用 github-markdown-css */
.markdown-body { box-sizing: border-box; min-width: 200px; max-width: 900px; margin: 0 auto; padding: 24px; }

/* 打印优化 */
@media print {
  .no-print { display: none !important; }
  .markdown-body { box-shadow: none; }
  /* 避免代码分页断裂 */
  pre, blockquote, table { break-inside: avoid; page-break-inside: avoid; }
}

/* 任务清单样式补丁（不同渲染器一致化） */
.markdown-body input[type="checkbox"] { margin-right: 0.5em; }

/* Mermaid 容器对齐 */
.markdown-body .mermaid { display: block; margin: 1rem auto; }
`;

export default { renderMarkdown };


