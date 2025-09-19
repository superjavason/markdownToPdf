"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  baseCss: () => baseCss,
  default: () => index_default,
  renderMarkdown: () => renderMarkdown
});
module.exports = __toCommonJS(index_exports);
var import_unified = require("unified");
var import_remark_parse = __toESM(require("remark-parse"), 1);
var import_remark_gfm = __toESM(require("remark-gfm"), 1);
var import_remark_math = __toESM(require("remark-math"), 1);
var import_remark_frontmatter = __toESM(require("remark-frontmatter"), 1);
var import_remark_directive = __toESM(require("remark-directive"), 1);
var import_remark_wiki_link = __toESM(require("remark-wiki-link"), 1);
var import_remark_deflist = __toESM(require("remark-deflist"), 1);
var import_remark_rehype = __toESM(require("remark-rehype"), 1);
var import_rehype_raw = __toESM(require("rehype-raw"), 1);
var import_rehype_stringify = __toESM(require("rehype-stringify"), 1);
var import_rehype_katex = __toESM(require("rehype-katex"), 1);
var import_rehype_pretty_code = __toESM(require("rehype-pretty-code"), 1);

// src/rehypeMermaid.ts
var import_unist_util_visit = require("unist-util-visit");
function getText(node) {
  return node.children.map((c) => c && c.value ? String(c.value) : "").join("");
}
function rehypeMermaid() {
  return (tree) => {
    (0, import_unist_util_visit.visit)(tree, "element", (node, _index, parent) => {
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
  const processor = (0, import_unified.unified)().use(import_remark_parse.default).use(import_remark_frontmatter.default, ["yaml", "toml"]).use(import_remark_directive.default).use(import_remark_gfm.default).use(import_remark_math.default).use(import_remark_deflist.default).use(import_remark_wiki_link.default, {
    aliasDivider: options.wikiLinkAliasDivider ?? "|",
    hrefTemplate: (permalink) => {
      const encoded = encodeURIComponent(permalink);
      return options.baseUrl ? `${options.baseUrl}#${encoded}` : `#${encoded}`;
    }
  }).use(import_remark_rehype.default, { allowDangerousHtml: enableRawHtml });
  if (enableRawHtml) processor.use(import_rehype_raw.default);
  processor.use(rehypeMermaid_default).use(import_rehype_katex.default).use(import_rehype_pretty_code.default, options.prettyCode ?? defaultPretty).use(import_rehype_stringify.default, { allowDangerousHtml: enableRawHtml });
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  baseCss,
  renderMarkdown
});
//# sourceMappingURL=index.cjs.map