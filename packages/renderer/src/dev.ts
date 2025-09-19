import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderMarkdown } from './index';

async function main() {
  const mdPath = resolve(process.cwd(), '../../all-markdown-syntax.md');
  const md = readFileSync(mdPath, 'utf8');
  const { html, assets } = await renderMarkdown(md, {});
  // 输出片段供手动检查
  console.log('ASSETS', assets);
  console.log(html.slice(0, 400));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


