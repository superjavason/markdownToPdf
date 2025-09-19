import type { Root, Element, Text, Parent } from 'hast';
import { visit } from 'unist-util-visit';

function getText(node: Element): string {
  return (node.children as Array<Text | any>)
    .map((c) => (c && (c as any).value ? String((c as any).value) : ''))
    .join('');
}

export function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree as any, 'element', (node: Element, _index: number | null, parent: Parent | null) => {
      if (!parent) return;
      if (node.tagName !== 'code') return;
      const klass = (node.properties?.className as string[] | undefined) || [];
      const isMermaid = klass.includes('language-mermaid') || klass.includes('mermaid');
      if (!isMermaid) return;

      const text = getText(node);
      if ((parent as Element).tagName === 'pre') {
        const pre = parent as unknown as Element;
        pre.tagName = 'div';
        pre.properties = { className: ['mermaid'] };
        pre.children = [{ type: 'text', value: text } as unknown as Text];
      } else {
        node.tagName = 'div';
        node.properties = { className: ['mermaid'] };
        node.children = [{ type: 'text', value: text } as unknown as Text];
      }
    });
  };
}

export default rehypeMermaid;


