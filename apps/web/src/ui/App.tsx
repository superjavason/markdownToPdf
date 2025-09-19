import { useEffect, useMemo, useState } from 'react';
import { renderMarkdown, baseCss } from '@md2pdf/renderer';

async function fetchPreview(markdown: string) {
  const r = await fetch('/api/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown }),
  });
  if (!r.ok) throw new Error('preview failed');
  return (await r.json()) as Awaited<ReturnType<typeof renderMarkdown>>;
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function App() {
  const [md, setMd] = useState<string>('# Hello Markdown\n\nPaste or edit here.');
  const debounced = useDebounced(md, 300);
  const [html, setHtml] = useState<string>('');
  const [assets, setAssets] = useState<{ cssHrefs: string[]; inlineCss: string[]; jsModules: string[] }>({ cssHrefs: [], inlineCss: [baseCss], jsModules: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchPreview(debounced);
        if (!alive) return;
        setHtml(res.html);
        setAssets(res.assets);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [debounced]);

  const mermaidModules = useMemo(() => assets.jsModules, [assets]);
  useEffect(() => {
    (async () => {
      if (!mermaidModules?.length) return;
      try {
        const mod = await import(/* @vite-ignore */ mermaidModules[0]);
        if (mod?.default?.initialize) {
          mod.default.initialize({ startOnLoad: true, securityLevel: 'loose' });
          setTimeout(() => mod.default.run({ querySelector: '.language-mermaid, .mermaid' }), 0);
        }
      } catch {}
    })();
  }, [mermaidModules, html]);

  async function downloadPdf() {
    const r = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: md }),
    });
    if (!r.ok) return alert('Export failed');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh' }}>
      <section style={{ padding: 12, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button onClick={downloadPdf} disabled={loading}>Download PDF</button>
          {loading && <span>Rendering…</span>}
        </header>
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          style={{ flex: 1, width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        />
      </section>
      <section style={{ overflow: 'auto', background: '#0b0b0b0a' }}>
        {assets.cssHrefs.map((h) => (
          <link key={h} rel="stylesheet" href={h} />
        ))}
        {assets.inlineCss.concat([baseCss]).map((c, i) => (
          <style key={i} dangerouslySetInnerHTML={{ __html: c }} />
        ))}
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </div>
  );
}


