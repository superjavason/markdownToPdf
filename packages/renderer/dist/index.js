// src/index.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
import remarkDirective from "remark-directive";
import remarkWikiLink from "remark-wiki-link";
import remarkDeflist from "remark-deflist";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";

// src/rehypeMermaid.ts
import { visit } from "unist-util-visit";
function getText(node) {
  return node.children.map((c) => c && c.value ? String(c.value) : "").join("");
}
function rehypeMermaid() {
  return (tree) => {
    visit(tree, "element", (node, _index, parent) => {
      if (!parent) return;
      if (node.tagName !== "code") return;
      const klass = node.properties?.className || [];
      const isMermaid = klass.includes("language-mermaid") || klass.includes("mermaid");
      if (!isMermaid) return;
      const text = getText(node);
      if (parent.tagName === "pre") {
        const pre = parent;
        pre.tagName = "div";
        pre.properties = { className: ["mermaid"] };
        pre.children = [{ type: "text", value: text }];
      } else {
        node.tagName = "div";
        node.properties = { className: ["mermaid"] };
        node.children = [{ type: "text", value: text }];
      }
    });
  };
}
var rehypeMermaid_default = rehypeMermaid;

// src/index.ts
var defaultPretty = {
  theme: "github-dark"
};
async function renderMarkdown(markdown, options = {}) {
  const enableRawHtml = options.enableRawHtml ?? true;
  const processor = unified().use(remarkParse).use(remarkFrontmatter, ["yaml", "toml"]).use(remarkDirective).use(remarkGfm).use(remarkMath).use(remarkDeflist).use(remarkWikiLink, {
    aliasDivider: options.wikiLinkAliasDivider ?? "|",
    hrefTemplate: (permalink) => {
      const encoded = encodeURIComponent(permalink);
      return options.baseUrl ? `${options.baseUrl}#${encoded}` : `#${encoded}`;
    }
  }).use(remarkRehype, { allowDangerousHtml: enableRawHtml });
  if (enableRawHtml) processor.use(rehypeRaw);
  processor.use(rehypeMermaid_default).use(rehypeKatex).use(rehypePrettyCode, options.prettyCode ?? defaultPretty).use(rehypeStringify, { allowDangerousHtml: enableRawHtml });
  const file = await processor.process(markdown);
  const cssHrefs = [
    // GitHub 样式，保证在多数平台有一致的基础排版
    "https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.min.css",
    // KaTeX 样式
    "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
  ];
  const inlineCss = [
    // 组件包内的基础样式（打印、布局等）
    baseCss
  ];
  const jsModules = [
    // Mermaid 运行时，用于将 <pre class="language-mermaid"> 或 ```mermaid 内容渲染为图
    // 这里采用 ESM CDN，网页端直接使用；在服务端 PDF 渲染时通过 Puppeteer 预热
    "https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs"
  ];
  return {
    html: String(file),
    assets: { cssHrefs, inlineCss, jsModules }
  };
}
var baseCss = `
/* \u7EDF\u4E00\u5BB9\u5668\u7C7B\uFF0C\u5EFA\u8BAE\u5728\u9875\u9762\u4E2D\u5305\u88F9 markdown-body \u4EE5\u590D\u7528 github-markdown-css */
.markdown-body { box-sizing: border-box; min-width: 200px; max-width: 900px; margin: 0 auto; padding: 24px; }

/* \u6253\u5370\u4F18\u5316 */
@media print {
  .no-print { display: none !important; }
  .markdown-body { box-shadow: none; }
  /* \u907F\u514D\u4EE3\u7801\u5206\u9875\u65AD\u88C2 */
  pre, blockquote, table { break-inside: avoid; page-break-inside: avoid; }
}

/* \u4EFB\u52A1\u6E05\u5355\u6837\u5F0F\u8865\u4E01\uFF08\u4E0D\u540C\u6E32\u67D3\u5668\u4E00\u81F4\u5316\uFF09 */
.markdown-body input[type="checkbox"] { margin-right: 0.5em; }

/* Mermaid \u5BB9\u5668\u5BF9\u9F50 */
.markdown-body .mermaid { display: block; margin: 1rem auto; }
`;
var index_default = { renderMarkdown };
export {
  baseCss,
  index_default as default,
  renderMarkdown
};
//# sourceMappingURL=index.js.map