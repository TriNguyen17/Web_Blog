/**
 * 404 page: suggest the closest posts / challenges for the URL that was
 * requested, using the search index. The "Tìm trên blog" button opens the
 * search dialog with the words from the URL filled in.
 */
import type { SearchDoc } from './search';

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();

/** Character trigrams of a string, for fuzzy similarity. */
function grams(s: string) {
  const t = `  ${fold(s).replace(/[^a-z0-9]+/g, ' ').trim()} `;
  const out = new Set<string>();
  for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
  return out;
}

function similarity(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const g of a) if (b.has(g)) common++;
  return (2 * common) / (a.size + b.size);
}

const LABEL: Record<SearchDoc['type'], string> = { writeup: '[ctf]', challenge: '[challenge]', photo: '[ảnh]' };

export async function initSuggestions() {
  const box = document.querySelector<HTMLElement>('[data-suggest]');
  if (!box) return;
  const base = box.dataset.base ?? '/';
  let path = location.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {}
  if (path.startsWith(base)) path = path.slice(base.length);
  const parts = path.split('/').filter(Boolean);
  const query = (parts.at(-1) ?? '').replace(/\.html?$/, '').replace(/[-_]+/g, ' ').trim();
  if (!query) return;

  let docs: SearchDoc[] = [];
  try {
    docs = await (await fetch(box.dataset.index!)).json();
  } catch {
    return;
  }

  const q = grams(query);
  const ranked = docs
    .map((d) => {
      const slug = decodeURIComponent(d.url.split('#')[1] ?? d.url.replace(/\/$/, '').split('/').at(-1) ?? '');
      return { d, s: Math.max(similarity(q, grams(d.title)), similarity(q, grams(slug))) };
    })
    .filter((r) => r.s >= 0.4)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);

  box.querySelector('[data-suggest-q]')!.textContent = query;
  const list = box.querySelector<HTMLElement>('[data-suggest-list]')!;
  list.replaceChildren(
    ...ranked.map(({ d }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = d.url;
      const type = document.createElement('span');
      type.className = 'suggest__type';
      type.textContent = LABEL[d.type];
      const title = document.createElement('span');
      title.textContent = d.parent ? `${d.title} — ${d.parent}` : d.title;
      a.append(type, title);
      li.append(a);
      return li;
    }),
  );
  box.querySelector<HTMLElement>('[data-suggest-none]')!.hidden = ranked.length > 0;

  // Prefill the search box with the words from the URL.
  box.querySelector('[data-search-open]')?.addEventListener('click', () => {
    const input = document.getElementById('search-input') as HTMLInputElement | null;
    if (!input) return;
    requestAnimationFrame(() => {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    });
  });
  box.hidden = false;
}
