import { renderMarkdown } from '../packages/renderer/dist/index.js';

const md = `
```mermaid
graph TD;
  A-->B;
```
`;

const { html } = await renderMarkdown(md);
console.log(html);


