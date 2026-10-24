/**
 * rehype-callouts
 *
 * GitHub-style alerts in any Markdown file:
 *
 *   > [!NOTE]
 *   > Ghi chú...
 *
 * becomes <aside class="callout callout--note" role="note"> with a title.
 * Types: NOTE, TIP, IMPORTANT, WARNING, CAUTION. Other blockquotes are left
 * untouched.
 */
const TITLES = {
  note: 'Ghi chú',
  tip: 'Mẹo',
  important: 'Quan trọng',
  warning: 'Cảnh báo',
  caution: 'Thận trọng',
};

const MARKER = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i;

function visit(node, fn) {
  if (!node.children) return;
  node.children.forEach((child, i) => {
    fn(child, i, node);
    visit(child, fn);
  });
}

export default function rehypeCallouts() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== 'element' || node.tagName !== 'blockquote') return;
      const first = node.children.find((c) => c.type === 'element');
      if (!first || first.tagName !== 'p') return;
      const text = first.children[0];
      if (!text || text.type !== 'text') return;
      const m = MARKER.exec(text.value);
      if (!m) return;

      const type = m[1].toLowerCase();
      text.value = text.value.slice(m[0].length);
      // Drop the line break / empty paragraph left behind by the marker.
      if (!text.value.trim()) {
        first.children.shift();
        if (first.children[0]?.type === 'element' && first.children[0].tagName === 'br') first.children.shift();
        if (first.children[0]?.type === 'text') first.children[0].value = first.children[0].value.replace(/^\s+/, '');
      }
      const body = first.children.length ? node.children : node.children.filter((c) => c !== first);

      parent.children[index] = {
        type: 'element',
        tagName: 'aside',
        properties: { className: ['callout', `callout--${type}`], role: 'note' },
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: { className: ['callout__title'] },
            children: [{ type: 'text', value: TITLES[type] }],
          },
          ...body,
        ],
      };
    });
  };
}
