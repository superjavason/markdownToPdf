import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { renderMarkdown } from '@md2pdf/renderer';
import puppeteer from 'puppeteer';

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// OpenAPI UI
const openapiPath = resolve(process.cwd(), 'openapi.yaml');
const openapiDoc = YAML.parse(readFileSync(openapiPath, 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.post('/api/preview', async (req, res) => {
  try {
    const { markdown, options } = req.body ?? {};
    if (typeof markdown !== 'string') {
      return res.status(400).json({ message: 'markdown must be string' });
    }
    const result = await renderMarkdown(markdown, options);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'internal error' });
  }
});

app.post('/api/pdf', upload.none(), async (req, res) => {
  try {
    const { markdown, options } = req.body ?? {};
    if (typeof markdown !== 'string') {
      return res.status(400).json({ message: 'markdown must be string' });
    }
    const { html, assets } = await renderMarkdown(markdown, options);

    const htmlDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    ${assets.cssHrefs.map((h) => `<link rel="stylesheet" href="${h}" />`).join('\n    ')}
    ${assets.inlineCss.map((c) => `<style>${c}</style>`).join('\n    ')}
    <style>body{margin:0} .markdown-body{margin:0 auto; padding:24px;}</style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.min.js"></script>
  </head>
  <body>
    <article class="markdown-body">${html}</article>
    <script>
      if (window.mermaid && window.mermaid.initialize) {
        window.mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
        setTimeout(() => window.mermaid.run({ querySelector: '.language-mermaid, .mermaid' }), 0);
      }
    </script>
  </body>
</html>`;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlDoc, { waitUntil: 'networkidle0' });
    // 等待 mermaid 将所有 .mermaid 节点渲染为 <svg>（若不存在 .mermaid 则立即通过）
    try {
      await page.waitForFunction(
        () => {
          const nodes = Array.from(document.querySelectorAll('.mermaid')) as Element[];
          if (nodes.length === 0) return true;
          return nodes.every((n) => n.querySelector('svg'));
        },
        { timeout: 5000 }
      );
    } catch {
      // 忽略等待超时，继续生成 PDF（避免因单个图失败阻断整体导出）
    }
    const pdfBuffer = await page.pdf({ printBackground: true, format: 'A4' });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'internal error' });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3030;
app.listen(port, () => {
  console.log(`md2pdf server on http://localhost:${port} (docs at /docs)`);
});


