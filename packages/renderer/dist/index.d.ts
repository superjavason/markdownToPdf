import { Options } from 'rehype-pretty-code';

interface RenderOptions {
    enableRawHtml?: boolean;
    baseUrl?: string;
    wikiLinkAliasDivider?: string;
    prettyCode?: Options;
}
interface RenderResult {
    html: string;
    assets: {
        cssHrefs: string[];
        inlineCss: string[];
        jsModules: string[];
    };
}
declare function renderMarkdown(markdown: string, options?: RenderOptions): Promise<RenderResult>;
declare const baseCss = "\n/* \u7EDF\u4E00\u5BB9\u5668\u7C7B\uFF0C\u5EFA\u8BAE\u5728\u9875\u9762\u4E2D\u5305\u88F9 markdown-body \u4EE5\u590D\u7528 github-markdown-css */\n.markdown-body { box-sizing: border-box; min-width: 200px; max-width: 900px; margin: 0 auto; padding: 24px; }\n\n/* \u6253\u5370\u4F18\u5316 */\n@media print {\n  .no-print { display: none !important; }\n  .markdown-body { box-shadow: none; }\n  /* \u907F\u514D\u4EE3\u7801\u5206\u9875\u65AD\u88C2 */\n  pre, blockquote, table { break-inside: avoid; page-break-inside: avoid; }\n}\n\n/* \u4EFB\u52A1\u6E05\u5355\u6837\u5F0F\u8865\u4E01\uFF08\u4E0D\u540C\u6E32\u67D3\u5668\u4E00\u81F4\u5316\uFF09 */\n.markdown-body input[type=\"checkbox\"] { margin-right: 0.5em; }\n\n/* Mermaid \u5BB9\u5668\u5BF9\u9F50 */\n.markdown-body .mermaid { display: block; margin: 1rem auto; }\n";
declare const _default: {
    renderMarkdown: typeof renderMarkdown;
};

export { type RenderOptions, type RenderResult, baseCss, _default as default, renderMarkdown };
