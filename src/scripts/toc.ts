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
  let activeChangedAt = 0;
  let lockUntil = 0;
  // Last heading the reader jumped to (link click or URL hash). Near the
  // bottom of the page a jump may not bring it up to the activation line, so
  // it wins while visible, until the reader scrolls by hand.
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

  // A step of a challenge the reader collapsed is hidden: its challenge's
  // own link stands in for it.
  function shownLink(link: HTMLElement) {
    const item = link.closest<HTMLElement>('[data-toc-item]');
    if (item && item.dataset.expanded !== 'true' && link.closest('.toc__sub')) {
      return item.querySelector<HTMLElement>('.toc__link') ?? link;
    }
    return link;
  }

  // Re-run once the sidebar's geometry has settled (footer shrink, a
  // challenge's sub-list opening), which can push the active link out of
  // view; unless the reader has scrolled the list by hand since then.
  let listInputAt = 0;
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) {
    scroller.addEventListener(type, () => (listInputAt = performance.now()), { passive: true });
  }
  function revealActive() {
    if (listInputAt > activeChangedAt) return;
    const link = links.find((l) => l.dataset.tocLink === activeId);
    if (link) revealInSidebar(shownLink(link));
  }

  function setActive(id: string | null) {
    if (id === activeId) return;
    activeId = id;
    activeChangedAt = performance.now();

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

    if (link)
      requestAnimationFrame(() => {
        fitToFooter();
        revealInSidebar(shownLink(link));
      });
  }

  // Activation line: a heading counts as "current" once its top passes this
  // many px below the viewport top. It must sit at (or below) where an anchor
  // jump actually settles a heading — the root's scroll-padding-top plus the
  // heading's scroll-margin-top — or a freshly clicked target would never
  // register as passed. Measured once; refreshed on resize.
  let activationLine = 160;
  function measureActivationLine() {
    const spt = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const smt = targets[0] ? parseFloat(getComputedStyle(targets[0]).scrollMarginTop) || 0 : 0;
    activationLine = spt + smt + 12;
  }

  function currentTarget() {
    // A heading the reader jumped to stays current while it is on screen,
    // until they scroll by hand.
    const clicked = clickedId ? document.getElementById(clickedId) : null;
    if (clicked) {
      const top = clicked.getBoundingClientRect().top;
      if (top >= 0 && top < window.innerHeight) return clicked;
    }

    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) return targets.at(-1) ?? null;

    // Over the last stretch of the page the line slides down, so headings that
    // can never scroll up to the normal line (the last challenge's steps)
    // still get their turn before the page bottom.
    const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    const zone = window.innerHeight * 0.6;
    const line = remaining < zone ? activationLine + (zone - remaining) : activationLine;

    let current: HTMLElement | null = null;
    for (const t of targets) {
      if (t.getBoundingClientRect().top - line <= 0) current = t;
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

  // When a link to a heading of this page is clicked (TOC, board, a search
  // result), highlight the target right away and ignore intermediate headings
  // during the smooth scroll.
  document.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // new tab / window
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    const id = a && a.pathname === location.pathname ? decodeURIComponent(a.hash.slice(1)) : '';
    if (!id || !targets.some((t) => t.id === id)) return;
    clickedId = id;
    setActive(id);
    lockUntil = performance.now() + 1000;
  });
  // Arriving through a URL hash (page load, Back/Forward) counts as a click.
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || !targets.some((t) => t.id === id)) return;
    clickedId = id;
    // Back/Forward between two targets that are both visible at the bottom
    // does not scroll, so apply the highlight directly.
    setActive(id);
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // Scrolling by hand hands control back to the scroll spy.
  const releaseClick = () => (clickedId = null);
  window.addEventListener('wheel', releaseClick, { passive: true });
  window.addEventListener('touchstart', releaseClick, { passive: true });
  // A press on the page scrollbar targets the root element.
  window.addEventListener('pointerdown', (e) => {
    if (e.target === document.documentElement) releaseClick();
  });
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) releaseClick();
  });
  const onScrollEnd = () => {
    lockUntil = 0;
    fitToFooter();
    onScroll();
    if (performance.now() - activeChangedAt < 2000) revealActive();
  };
  const hasScrollEnd = 'onscrollend' in window;
  if (hasScrollEnd) {
    window.addEventListener('scrollend', onScrollEnd);
  } else {
    // Safari has no scrollend yet: wait for scroll events to stop.
    let timer = 0;
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(timer);
        timer = window.setTimeout(onScrollEnd, 150);
      },
      { passive: true },
    );
  }
  // Once the current challenge's sub-list has finished opening.
  toc.addEventListener('transitionend', (e) => {
    const el = e.target as HTMLElement;
    if (e.propertyName !== 'grid-template-rows' || !el.classList.contains('toc__sub')) return;
    if (el.closest<HTMLElement>('[data-toc-item]')?.dataset.expanded !== 'true') return;
    if (activeId && el.querySelector(`[data-toc-link="${CSS.escape(activeId)}"]`)) revealActive();
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
  // While a dialog is open on top (search), Tab / Esc / clicks belong to it.
  const dialogOnTop = () => document.querySelector('dialog[open]') !== null;
  const isFocusable = (el: HTMLElement) =>
    el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const focusables = () =>
    [...toc!.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(isFocusable);

  function setOpen(open: boolean) {
    toc!.dataset.open = String(open);
    fab?.setAttribute('aria-expanded', String(open));
    if (backdrop) backdrop.hidden = !open;
    document.documentElement.classList.toggle('scroll-locked', open);
    if (open) {
      toc!.setAttribute('role', 'dialog');
      toc!.setAttribute('aria-modal', 'true');
      // Start on the section being read. The drawer becomes focusable once it
      // is visible: try for a few frames.
      let tries = 0;
      const focusIn = () => {
        let active = toc!.querySelector<HTMLElement>('[aria-current="location"]');
        // A step of a collapsed challenge: the challenge's own link stands in.
        const parent = active?.closest<HTMLElement>('[data-toc-item]');
        if (active && parent && parent.dataset.expanded !== 'true' && active.classList.contains('toc__sublink')) {
          active = parent.querySelector<HTMLElement>('.toc__link');
        }
        if (active && !isFocusable(active) && tries++ < 10) {
          requestAnimationFrame(focusIn);
          return;
        }
        const target = active && isFocusable(active) ? active : focusables()[0];
        if (target) {
          target.focus({ preventScroll: true });
          revealInSidebar(target);
        } else if (tries++ < 10) {
          requestAnimationFrame(focusIn);
        }
      };
      requestAnimationFrame(focusIn);
    } else {
      toc!.removeAttribute('role');
      toc!.removeAttribute('aria-modal');
    }
  }

  // Where the last press landed: after a click on plain text in the drawer
  // focus is on <body>, and Tab should go on from that spot.
  let pressed: Node | null = null;
  document.addEventListener('pointerdown', (e) => (pressed = e.target as Node), true);
  document.addEventListener('focusin', () => (pressed = null));

  // Keep Tab / Shift+Tab inside the open drawer, also when focus has fallen
  // out of it (e.g. to <body>).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || toc.dataset.open !== 'true' || !mobile.matches || dialogOnTop()) return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (!toc.contains(active)) {
      e.preventDefault();
      const from = pressed && toc.contains(pressed) ? pressed : null;
      const next =
        from &&
        (e.shiftKey
          ? list.filter((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING).pop()
          : list.find((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
      (next ?? (e.shiftKey ? last : first)).focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  fab?.addEventListener('click', () => setOpen(true));
  const closeDrawer = () => {
    setOpen(false);
    fab?.focus({ preventScroll: true });
  };
  document.querySelectorAll('[data-toc-close]').forEach((el) => el.addEventListener('click', closeDrawer));
  // The scrollbar gutter is painted like the backdrop while the drawer is
  // open (global.css), so a click there closes it too.
  document.addEventListener('click', (e) => {
    if (toc.dataset.open === 'true' && e.target === document.documentElement && !dialogOnTop()) closeDrawer();
  });
  toc.addEventListener('click', (e) => {
    if (mobile.matches && (e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || toc.dataset.open !== 'true') return;
    // Esc already handled by a dialog on top (search).
    if (e.defaultPrevented || dialogOnTop()) return;
    closeDrawer();
  });
  // A search result on this page was followed: get out of its way.
  document.addEventListener('search:follow', () => {
    if (toc.dataset.open === 'true') setOpen(false);
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches) setOpen(false);
    fitToFooter();
  });
}
