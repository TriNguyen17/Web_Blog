/**
 * Write-up sidebar:
 *  - expand / collapse challenges (manually or "expand all / collapse all")
 *  - scroll spy: highlight the section being read and auto-expand its challenge
 *  - keep the active link visible inside the sidebar
 *  - mobile drawer (open / close / Esc / backdrop, focus handling)
 *  - reading progress (sidebar % + top progress bar)
 */
export function initToc() {
  const toc = document.getElementById('toc');
  if (!toc) return;

  const scroller = toc.querySelector<HTMLElement>('[data-toc-scroll]')!;
  const percent = toc.querySelector<HTMLElement>('[data-toc-percent]');
  const progressBar = document.querySelector<HTMLElement>('[data-read-progress]');
  const fab = document.querySelector<HTMLButtonElement>('[data-toc-open]');
  const backdrop = document.querySelector<HTMLElement>('.toc-backdrop');
  const mobile = matchMedia('(max-width: 1023px)');

  const items = [...toc.querySelectorAll<HTMLLIElement>('[data-toc-item]')];
  const links = [...toc.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];

  /* ---------------- expand / collapse ---------------- */
  // Items opened by the user stay open; items opened by the scroll spy
  // close again when the reader moves on.
  const pinned = new Set<HTMLLIElement>();

  function setExpanded(item: HTMLLIElement, expanded: boolean) {
    item.dataset.expanded = String(expanded);
    const toggle = item.querySelector<HTMLButtonElement>(':scope > .toc__row .toc__toggle');
    if (toggle?.tagName === 'BUTTON') {
      toggle.setAttribute('aria-expanded', String(expanded));
      const name = item.querySelector('.toc__link')?.textContent?.trim() ?? '';
      toggle.setAttribute('aria-label', `${expanded ? 'Thu gọn' : 'Mở rộng'} ${name}`);
    }
  }

  // The challenge being read, its auto-expanded state, and whether the user
  // collapsed it by hand (then the scroll spy must not reopen it).
  let currentItem: HTMLLIElement | null = null;
  let autoItem: HTMLLIElement | null = null;
  let dismissed: HTMLLIElement | null = null;

  for (const item of items) {
    item.querySelector('button.toc__toggle')?.addEventListener('click', () => {
      const expanded = item.dataset.expanded !== 'true';
      setExpanded(item, expanded);
      if (expanded) {
        pinned.add(item);
      } else {
        pinned.delete(item);
        if (item === currentItem) dismissed = item;
      }
    });
  }

  toc.querySelector('[data-toc-expand-all]')?.addEventListener('click', () => {
    items.forEach((item) => {
      setExpanded(item, true);
      pinned.add(item);
    });
  });
  toc.querySelector('[data-toc-collapse-all]')?.addEventListener('click', () => {
    items.forEach((item) => setExpanded(item, false));
    pinned.clear();
    dismissed = currentItem;
  });

  /* ---------------- scroll spy ---------------- */
  const targets = links
    .map((link) => document.getElementById(link.dataset.tocLink!))
    .filter((el): el is HTMLElement => el !== null)
    // Sidebar order (grouped by category) may differ from document order.
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

  let activeId: string | null = null;
  let lockUntil = 0;
  // Last heading the reader jumped to via a link. Near the bottom of the page
  // the last few headings can't reach the activation line, so the clicked one
  // wins there until the reader scrolls by hand.
  let clickedId: string | null = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function revealInSidebar(link: HTMLElement) {
    if (mobile.matches && toc!.dataset.open !== 'true') return;
    const box = scroller.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    if (r.top < box.top + 48 || r.bottom > box.bottom - 48) {
      scroller.scrollTo({
        top: scroller.scrollTop + (r.top - box.top) - box.height / 3,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    }
  }

  function setActive(id: string | null) {
    if (id === activeId) return;
    activeId = id;

    for (const link of links) {
      if (link.dataset.tocLink === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    const link = links.find((l) => l.dataset.tocLink === id);
    const item = link?.closest<HTMLLIElement>('[data-toc-item]') ?? null;
    items.forEach((i) => i.classList.toggle('is-active', i === item));

    if (item !== currentItem) {
      if (autoItem && !pinned.has(autoItem)) setExpanded(autoItem, false);
      autoItem = null;
      dismissed = null;
      currentItem = item;
    }
    if (item && item !== dismissed && item.dataset.expanded !== 'true') {
      setExpanded(item, true);
      autoItem = item;
    }

    if (link) requestAnimationFrame(() => revealInSidebar(link));
  }

  // Activation line: a heading counts as "current" once its top passes this
  // many px below the viewport top. It must sit at (or below) where an anchor
  // jump actually settles a heading — which is scroll-padding-top (on <html>)
  // plus the heading's own scroll-margin-top — or a freshly clicked target
  // would never register as passed. Measured once; refreshed on resize.
  let activationLine = 160;
  function measureActivationLine() {
    const spt = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const smt = targets[0] ? parseFloat(getComputedStyle(targets[0]).scrollMarginTop) || 0 : 0;
    activationLine = spt + smt + 12;
  }

  function currentTarget() {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      const clicked = clickedId ? document.getElementById(clickedId) : null;
      const top = clicked?.getBoundingClientRect().top;
      if (clicked && top !== undefined && top >= 0 && top < window.innerHeight) return clicked;
      return targets.at(-1) ?? null;
    }

    let current: HTMLElement | null = null;
    for (const t of targets) {
      if (t.getBoundingClientRect().top - activationLine <= 0) current = t;
      else break;
    }
    return current;
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (percent) percent.textContent = `${Math.round(ratio * 100)}%`;
    if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
  }

  // Desktop: once the footer scrolls into view, shrink the sticky sidebar so
  // it ends at the footer instead of being pushed up under the site header.
  const footer = document.querySelector<HTMLElement>('.site-footer');
  function fitToFooter() {
    if (mobile.matches || !footer) {
      toc!.style.height = '';
      return;
    }
    const overlap = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top);
    toc!.style.height = overlap > 0 ? `calc(100dvh - var(--header-h) - ${overlap}px)` : '';
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateProgress();
      fitToFooter();
      if (performance.now() < lockUntil) return;
      setActive(currentTarget()?.id ?? null);
    });
  }

  // When a TOC / board link is clicked, highlight the target right away and
  // ignore intermediate headings during the smooth scroll.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const id = a ? decodeURIComponent(a.hash.slice(1)) : '';
    if (!id || !targets.some((t) => t.id === id)) return;
    clickedId = id;
    setActive(id);
    lockUntil = performance.now() + 1000;
  });
  // Scrolling by hand hands control back to the scroll spy.
  const releaseClick = () => (clickedId = null);
  window.addEventListener('wheel', releaseClick, { passive: true });
  window.addEventListener('touchstart', releaseClick, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) releaseClick();
  });
  window.addEventListener('scrollend', () => {
    lockUntil = 0;
    onScroll();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measureActivationLine();
      onScroll();
    },
    { passive: true },
  );
  measureActivationLine();
  onScroll();

  /* ---------------- mobile drawer ---------------- */
  const isFocusable = (el: HTMLElement) =>
    el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const focusables = () =>
    [...toc!.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(isFocusable);

  function setOpen(open: boolean) {
    toc!.dataset.open = String(open);
    fab?.setAttribute('aria-expanded', String(open));
    if (backdrop) backdrop.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      toc!.setAttribute('role', 'dialog');
      toc!.setAttribute('aria-modal', 'true');
      // Wait a frame so the drawer is visible (and therefore focusable).
      requestAnimationFrame(() => {
        const active = toc!.querySelector<HTMLElement>('[aria-current="location"]');
        const target = active && isFocusable(active) ? active : focusables()[0];
        target?.focus({ preventScroll: true });
        if (target) revealInSidebar(target);
      });
    } else {
      toc!.removeAttribute('role');
      toc!.removeAttribute('aria-modal');
    }
  }

  // Keep Tab / Shift+Tab inside the open drawer.
  toc.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || toc.dataset.open !== 'true' || !mobile.matches) return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  fab?.addEventListener('click', () => setOpen(true));
  document.querySelectorAll('[data-toc-close]').forEach((el) => el.addEventListener('click', () => {
    setOpen(false);
    fab?.focus();
  }));
  toc.addEventListener('click', (e) => {
    if (mobile.matches && (e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toc.dataset.open === 'true') {
      setOpen(false);
      fab?.focus();
    }
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches) setOpen(false);
    fitToFooter();
  });
}
