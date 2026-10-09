/**
 * Client-side search over /search.json (generated at build time by
 * src/pages/search.json.ts). No external dependency: accent-insensitive
 * matching ("da lat" finds "Đà Lạt"), weighted by field, `#tag` filters.
 */
export interface SearchDoc {
  type: 'writeup' | 'challenge' | 'photo';
  title: string;
  url: string;
  date: string;
  description: string;
  tags: string[];
  /** Challenge category, or the CTF name of a write-up. */
  meta?: string;
  /** For challenges: title of the write-up containing it. */
  parent?: string;
  text: string;
}

interface PreparedDoc {
  doc: SearchDoc;
  title: string;
  tags: string[];
  meta: string;
  description: string;
  text: string;
}

const TYPE_LABEL: Record<SearchDoc['type'], string> = {
  writeup: 'write-up',
  challenge: 'challenge',
  photo: 'photo',
};

/** Lower-case + strip Vietnamese diacritics, keeping string length stable. */
const fold = (s: string) =>
  s
    .normalize('NFC')
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function prepare(doc: SearchDoc): PreparedDoc {
  return {
    doc: {
      ...doc,
      title: doc.title.normalize('NFC'),
      description: doc.description.normalize('NFC'),
      text: doc.text.normalize('NFC'),
    },
    title: fold(doc.title),
    tags: doc.tags.map(fold),
    meta: fold(`${doc.meta ?? ''} ${doc.parent ?? ''}`),
    description: fold(doc.description),
    text: fold(doc.text),
  };
}

function score(p: PreparedDoc, words: string[], tags: string[]) {
  for (const tag of tags) if (!p.tags.some((t) => t.startsWith(tag))) return 0;

  let total = tags.length * 6;
  for (const w of words) {
    let s = 0;
    if (p.title.includes(w)) s += p.title.startsWith(w) || p.title.includes(` ${w}`) ? 14 : 10;
    if (p.tags.some((t) => t.includes(w))) s += 6;
    if (p.meta.includes(w)) s += 4;
    if (p.description.includes(w)) s += 3;
    if (p.text.includes(w)) s += 1;
    if (s === 0) return 0; // every word must match somewhere
    total += s;
  }
  if (p.doc.type !== 'challenge') total += 0.5; // prefer whole posts on ties
  return total;
}

/** Append `text` to `parent`, wrapping every occurrence of `words` in <mark>. */
function highlight(parent: HTMLElement, text: string, words: string[]) {
  const folded = fold(text);
  const ranges: [number, number][] = [];
  for (const w of words) {
    let i = folded.indexOf(w);
    while (w && i !== -1) {
      ranges.push([i, i + w.length]);
      i = folded.indexOf(w, i + w.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);

  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start < cursor) continue;
    parent.append(text.slice(cursor, start));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(start, end);
    parent.append(mark);
    cursor = end;
  }
  parent.append(text.slice(cursor));
}

function snippet(p: PreparedDoc, words: string[]) {
  const source = p.doc.description && words.some((w) => p.description.includes(w)) ? 'description' : 'text';
  const original = source === 'description' ? p.doc.description : p.doc.text;
  const folded = source === 'description' ? p.description : p.text;
  const hit = words.map((w) => folded.indexOf(w)).find((i) => i >= 0) ?? -1;
  if (hit < 0) return p.doc.description || p.doc.text.slice(0, 140);
  const start = Math.max(0, hit - 50);
  return `${start > 0 ? '…' : ''}${original.slice(start, start + 160)}${start + 160 < original.length ? '…' : ''}`;
}

export function initSearch() {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const list = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  if (!dialog || !input || !list || !status) return;

  let docs: PreparedDoc[] | null = null;
  let loading: Promise<void> | null = null;
  let active = 0;

  const load = () =>
    (loading ??= fetch(dialog.dataset.index!)
      .then((res) => res.json() as Promise<SearchDoc[]>)
      .then((data) => {
        docs = data.map(prepare);
      })
      .catch(() => {
        status.textContent = 'Không tải được chỉ mục tìm kiếm.';
      }));

  // ARIA combobox pattern: focus stays in the input, the highlighted result is
  // exposed through aria-activedescendant. Each result link is the option.
  const options = () => [...list.querySelectorAll<HTMLAnchorElement>('[role="option"]')];

  function select(index: number) {
    const all = options();
    if (!all.length) return;
    active = (index + all.length) % all.length;
    all.forEach((opt, i) => opt.setAttribute('aria-selected', String(i === active)));
    input!.setAttribute('aria-activedescendant', all[active].id);
    all[active].scrollIntoView({ block: 'nearest' });
  }

  function render() {
    if (!docs) return;
    const query = input!.value.trim();
    const tokens = query.split(/\s+/).filter(Boolean).map(fold);
    const tags = tokens.filter((t) => t.startsWith('#') && t.length > 1).map((t) => t.slice(1));
    const words = tokens.filter((t) => !t.startsWith('#'));

    let results: { p: PreparedDoc; s: number }[];
    if (!tokens.length) {
      results = docs.filter((p) => p.doc.type !== 'challenge').slice(0, 6).map((p) => ({ p, s: 1 }));
      status!.textContent = 'Bài viết mới nhất';
    } else {
      results = docs
        .map((p) => ({ p, s: score(p, words, tags) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || b.p.doc.date.localeCompare(a.p.doc.date))
        .slice(0, 12);
      status!.textContent = results.length
        ? `${results.length} kết quả cho “${query}”`
        : `Không tìm thấy kết quả cho “${query}”`;
    }

    list!.replaceChildren(
      ...results.map(({ p }, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'none');
        const a = document.createElement('a');
        a.href = p.doc.url;
        a.id = `search-opt-${i}`;
        a.tabIndex = -1;
        a.setAttribute('role', 'option');
        a.setAttribute('aria-selected', String(i === 0));

        const head = document.createElement('div');
        head.className = 'sr-head';
        const type = document.createElement('span');
        type.className = 'sr-type';
        type.textContent = p.doc.type === 'challenge' && p.doc.meta ? p.doc.meta : TYPE_LABEL[p.doc.type];
        const title = document.createElement('span');
        highlight(title, p.doc.title, words);
        head.append(type, title);
        if (p.doc.parent) {
          const parent = document.createElement('span');
          parent.className = 'sr-parent';
          parent.textContent = p.doc.parent;
          head.append(parent);
        }

        const text = document.createElement('p');
        text.className = 'sr-snippet';
        highlight(text, snippet(p, words), words);

        a.append(head, text);
        li.append(a);
        return li;
      }),
    );
    active = 0;
    input!.setAttribute('aria-expanded', String(results.length > 0));
    if (results.length) input!.setAttribute('aria-activedescendant', 'search-opt-0');
    else input!.removeAttribute('aria-activedescendant');
  }

  // Set when the dialog closes because a same-page result (#anchor) was
  // followed: the browser then moves the focus starting point to that heading,
  // and focus must not be pulled back to the header. The mobile menu / TOC
  // drawer underneath close too ('search:follow').
  let followedInPage = false;
  function follow(link: HTMLAnchorElement, e: MouseEvent) {
    followedInPage =
      !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) &&
      link.pathname === location.pathname &&
      link.hash !== '';
    if (followedInPage) document.dispatchEvent(new CustomEvent('search:follow'));
    dialog!.close();
  }

  async function open() {
    if (dialog!.open) return;
    followedInPage = false;
    dialog!.showModal();
    input!.select();
    if (!docs) {
      status!.textContent = 'Đang tải…';
      await load();
    }
    render();
  }

  document.querySelectorAll('[data-search-open]').forEach((btn) => btn.addEventListener('click', open));
  // If the element that opened the dialog is gone or hidden, don't leave
  // focus on <body>: fall back to the visible search button.
  // Checked a frame later: the browser restores focus (or drops it) after
  // 'close' has fired.
  dialog.addEventListener('close', () =>
    requestAnimationFrame(() => {
      if (followedInPage) return;
      const a = document.activeElement;
      if (a && a !== document.body && !dialog.contains(a) && a.getClientRects().length) return;
      const trigger = [...document.querySelectorAll<HTMLElement>('[data-search-open]')].find(
        (el) => el.getClientRects().length > 0,
      );
      trigger?.focus({ preventScroll: true });
    }),
  );
  dialog.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());

  // Click on the backdrop closes the dialog.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      select(active + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Enter') {
      const link = options()[active];
      if (link) {
        e.preventDefault();
        link.click(); // closes the dialog (below), then navigates
      }
    }
  });

  // Esc anywhere in the dialog (input or close button). preventDefault: for
  // type="search" (which would otherwise only clear the text on the first
  // Esc), and so the menu / TOC drawer underneath know the dialog took it.
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    dialog.close();
  });

  // Close when following a result (also covers same-page #anchors).
  list.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link) follow(link, e);
  });

  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const typing = target.closest('input, textarea, select, [contenteditable="true"]');
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    } else if (e.key === '/' && !typing && !dialog.open) {
      e.preventDefault();
      open();
    }
  });
}
