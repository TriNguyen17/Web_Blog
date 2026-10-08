/**
 * Generic chip filter for card grids.
 *
 * A container marked [data-filter-root] holds:
 *   - buttons  [data-filter="<value>"]           (value "all" shows everything)
 *   - cards    [data-type][data-tags]            inside [data-filter-items]
 *   - optional [data-filter-empty]               empty-state element
 *
 * A chip matches a card when its value equals the card's `data-type`, is one
 * of its `data-cats` (CTF categories) or appears (slugified) in `data-tags`.
 */
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function setup(root: HTMLElement) {
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-filter-items] > *')];
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const countEl = root.querySelector<HTMLElement>('[data-filter-count]');
  if (!chips.length || !cards.length) return;

  const cardValues = new Map(
    cards.map((card) => {
      const values = new Set<string>();
      if (card.dataset.type) values.add(card.dataset.type);
      for (const cat of (card.dataset.cats ?? '').split(',')) if (cat) values.add(cat);
      for (const tag of (card.dataset.tags ?? '').split(',')) if (tag) values.add(slug(tag));
      return [card, values];
    }),
  );

  function apply(value: string, pushState = true) {
    let shown = 0;
    for (const card of cards) {
      const match = value === 'all' || cardValues.get(card)!.has(value);
      card.hidden = !match;
      if (match) shown += 1;
    }
    for (const chip of chips) chip.setAttribute('aria-pressed', String(chip.dataset.filter === value));
    if (empty) empty.hidden = shown > 0;
    if (countEl) countEl.textContent = String(shown);

    const u = new URL(location.href);
    if (value === 'all') u.searchParams.delete('filter');
    else u.searchParams.set('filter', value);
    if (pushState) history.replaceState(null, '', u);
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => apply(chip.dataset.filter!));
  }

  const initial = new URL(location.href).searchParams.get('filter');
  const valid = initial && chips.some((c) => c.dataset.filter === initial);
  apply(valid ? initial! : 'all', false);
}

export function initFilters(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-filter-root]').forEach(setup);
}
