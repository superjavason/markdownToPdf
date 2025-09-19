import { renderMarkdown } from '@md2pdf/renderer';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

    // Configure Chromium for Vercel
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlDoc, { waitUntil: 'networkidle0' });
    
    // Wait for mermaid rendering
    try {
      await page.waitForFunction(
        () => {
          const nodes = Array.from(document.querySelectorAll('.mermaid'));
          if (nodes.length === 0) return true;
          return nodes.every((n) => n.querySelector('svg'));
        },
        { timeout: 5000 }
      );
    } catch {
      // Ignore timeout, continue with PDF generation
    }

    const pdfBuffer = await page.pdf({ 
      printBackground: true, 
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'internal error' });
  }
}
