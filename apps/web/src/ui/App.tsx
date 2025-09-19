import { useEffect, useMemo, useState } from 'react';
import { renderMarkdown, baseCss } from '@md2pdf/renderer';
import { FileText, Download, Moon, Sun, Eye, Edit3 } from 'lucide-react';

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
  const [md, setMd] = useState<string>(`# Markdown Preview & PDF Export

Welcome to the **Markdown to PDF** converter! 

## Features

- ✨ **Real-time preview** with GitHub Flavored Markdown
- 📊 **Mermaid diagrams** support
- 🧮 **Math equations** with KaTeX
- 📄 **PDF export** with one click
- 🎨 **Beautiful styling** with Tailwind CSS

## Try it out

Edit this text and see the live preview on the right!

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote with **bold** and *italic* text.

### Task List
- [x] Set up the project
- [x] Add Tailwind CSS
- [ ] Add more features
- [ ] Deploy to production

### Math Example
$$E = mc^2$$

### Mermaid Diagram
\`\`\`mermaid
graph TD;
    A[Start] --> B{Decision?};
    B -->|Yes| C[Action 1];
    B -->|No| D[Action 2];
    C --> E[End];
    D --> E[End];
\`\`\`
`);
  
  const debounced = useDebounced(md, 300);
  const [html, setHtml] = useState<string>('');
  const [assets, setAssets] = useState<{ cssHrefs: string[]; inlineCss: string[]; jsModules: string[] }>({ 
    cssHrefs: [], 
    inlineCss: [baseCss], 
    jsModules: [] 
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchPreview(debounced);
        if (!alive) return;
        setHtml(res.html);
        setAssets(res.assets);
      } catch (error) {
        console.error('Preview error:', error);
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
      } catch (error) {
        console.error('Mermaid error:', error);
      }
    })();
  }, [mermaidModules, html]);

  async function downloadPdf() {
    try {
      setLoading(true);
      const r = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md }),
      });
      if (!r.ok) {
        throw new Error('Export failed');
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const getGridCols = () => {
    switch (viewMode) {
      case 'edit': return 'grid-cols-1';
      case 'preview': return 'grid-cols-1';
      default: return 'grid-cols-2';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Markdown to PDF</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'edit' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                  title="Edit only"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'split' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                  title="Split view"
                >
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-4 bg-current rounded-sm" />
                    <div className="w-1.5 h-4 bg-current rounded-sm" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'preview' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                  title="Preview only"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Download PDF Button */}
              <button
                onClick={downloadPdf}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                {loading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto p-4 grid ${getGridCols()} gap-4 h-[calc(100vh-5rem)]`}>
        {/* Editor Panel */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex flex-col bg-card rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/50">
              <h2 className="font-medium text-sm text-muted-foreground">Markdown Editor</h2>
            </div>
            <textarea
              value={md}
              onChange={(e) => setMd(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-foreground font-mono text-sm resize-none border-none outline-none editor-scrollbar"
              placeholder="Start typing your markdown here..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex flex-col bg-card rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
              <h2 className="font-medium text-sm text-muted-foreground">Live Preview</h2>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Rendering...
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-6">
              {/* Inject CSS assets */}
              {assets.cssHrefs.map((h) => (
                <link key={h} rel="stylesheet" href={h} />
              ))}
              {assets.inlineCss.concat([baseCss]).map((c, i) => (
                <style key={i} dangerouslySetInnerHTML={{ __html: c }} />
              ))}
              
              {/* Rendered content */}
              <article 
                className="markdown-body prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}