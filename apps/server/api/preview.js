import { renderMarkdown } from '@md2pdf/renderer';

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
    const result = await renderMarkdown(markdown, options);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'internal error' });
  }
}
