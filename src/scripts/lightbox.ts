/**
 * Photo lightbox. Reads the data on each `.shot` button in #photo-grid, so it
 * needs no server data: the full-size src is the largest candidate of the
 * thumbnail's srcset. Supports keyboard (←/→/Esc), swipe, preloading of
 * neighbours, and only cycles through photos the tag filter left visible.
 */
interface Slide {
  button: HTMLButtonElement;
  src: string;
  alt: string;
  caption: string;
  date: string;
  dateLabel: string;
  tags: string[];
  album?: string;
  albumHref?: string;
}

/** Largest URL from an <img> srcset, falling back to src. */
function largestSrc(img: HTMLImageElement) {
  const candidates = (img.getAttribute('srcset') ?? '')
    .split(',')
    .map((part) => {
      const [url, size] = part.trim().split(/\s+/);
      return { url, width: size?.endsWith('w') ? parseInt(size) : 0 };
    })
    .filter((c) => c.url);
  if (!candidates.length) return img.currentSrc || img.src;
  return candidates.reduce((a, b) => (b.width > a.width ? b : a)).url;
}

export function initLightbox() {
  const grid = document.getElementById('photo-grid');
  const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
  const img = document.getElementById('lightbox-img') as HTMLImageElement | null;
  if (!grid || !dialog || !img) return;

  const captionEl = dialog.querySelector<HTMLElement>('[data-lb-caption]')!;
  const dateEl = dialog.querySelector<HTMLTimeElement>('[data-lb-date]')!;
  const countEl = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  const tagsEl = dialog.querySelector<HTMLElement>('[data-lb-tags]')!;
  const albumEl = dialog.querySelector<HTMLAnchorElement>('[data-lb-album]')!;
  const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-lb-prev]')!;
  const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-lb-next]')!;
  const statusEl = dialog.querySelector<HTMLElement>('[data-lb-status]');
  const stage = dialog.querySelector<HTMLElement>('.lightbox__stage')!;

  let slides: Slide[] = [];
  let pos = 0;
  let lastFocus: HTMLElement | null = null;
  // Bumped on every slide change and on close, so a photo that finishes
  // loading after the reader moved on is ignored.
  let seq = 0;

  /** Build the slide list from the buttons currently visible in the grid. */
  function collect(): Slide[] {
    const buttons = [...grid!.querySelectorAll<HTMLButtonElement>('.shot')].filter(
      (b) => !b.closest('.masonry__item')?.hasAttribute('hidden'),
    );
    return buttons.map((button) => ({
      button,
      src: largestSrc(button.querySelector('img')!),
      alt: button.dataset.alt ?? '',
      caption: button.dataset.caption ?? '',
      date: button.dataset.date ?? '',
      dateLabel: button.dataset.dateLabel ?? '',
      tags: (button.dataset.tags ?? '').split(',').filter(Boolean),
      album: button.dataset.album,
      albumHref: button.dataset.albumHref,
    }));
  }

  const preload = (i: number) => {
    const s = slides[i];
    if (s) new Image().src = s.src;
  };

  /** Put a slide's photo and text on screen (photo already loaded). */
  function render(slide: Slide, announce: boolean) {
    img!.src = slide.src;
    img!.alt = slide.alt;

    captionEl.textContent = slide.caption;
    dateEl.textContent = slide.dateLabel;
    dateEl.dateTime = slide.date;
    countEl.textContent = `${pos + 1} / ${slides.length}`;
    tagsEl.replaceChildren(
      ...slide.tags.map((tag) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        li.append(span);
        return li;
      }),
    );

    albumEl.hidden = !slide.albumHref;
    if (slide.albumHref) {
      albumEl.href = slide.albumHref;
      albumEl.textContent = `Album: ${slide.album} →`;
    }

    // Announce slide changes (not the first open: the dialog itself is announced).
    if (statusEl) statusEl.textContent = announce ? `${pos + 1} / ${slides.length}: ${slide.alt}` : '';
  }

  // The loading spinner sits over the photo being replaced (in the
  // side-by-side landscape layout the stage centre is on the caption), or at
  // the stage centre when there is none yet.
  function placeSpinner() {
    const r = img!.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      stage.style.setProperty('--spin-x', `${r.left - s.left + r.width / 2}px`);
      stage.style.setProperty('--spin-y', `${r.top - s.top + r.height / 2}px`);
    } else {
      stage.style.removeProperty('--spin-x');
      stage.style.removeProperty('--spin-y');
    }
  }

  function show(i: number, announce = true) {
    pos = (i + slides.length) % slides.length;
    const slide = slides[pos];
    const token = ++seq;
    placeSpinner();

    // Load and decode the full-size file first, then swap photo and text
    // together: the caption never sits over the previous photo, or over an
    // empty frame. A failed load still shows the slide (with its alt text).
    dialog!.classList.add('is-loading');
    const apply = () => {
      if (token !== seq) return;
      render(slide, announce);
      dialog!.classList.remove('is-loading');
    };
    const full = new Image();
    full.src = slide.src;
    full.decode().then(apply, apply);

    const many = slides.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
    preload(pos + 1);
    preload(pos - 1);
  }

  const go = (delta: number) => show(pos + delta);

  function open(button: HTMLButtonElement) {
    slides = collect();
    const index = slides.findIndex((s) => s.button === button);
    if (index < 0) return;
    lastFocus = button;
    show(index, false);
    dialog!.showModal();
  }

  function close() {
    dialog!.close();
  }

  grid.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('.shot');
    if (button) open(button);
  });

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', close);

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });

  // Click outside the figure closes (dialog fills the viewport). Not the 2nd
  // click of a double-click: that is the one that opened it landing outside.
  dialog.addEventListener('click', (e) => {
    if (e.detail > 1) return;
    if (!(e.target as HTMLElement).closest('.lightbox__figure, .lightbox__nav')) close();
  });

  // Clear the slide, so the next open starts from an empty frame (not the
  // last photo, nor its alt text over a broken image) while it loads.
  dialog.addEventListener('close', () => {
    seq++;
    dialog.classList.remove('is-loading');
    img!.src = 'data:,';
    img!.alt = '';
    captionEl.textContent = '';
    dateEl.textContent = '';
    countEl.textContent = '';
    tagsEl.replaceChildren();
    albumEl.hidden = true;
    if (statusEl) statusEl.textContent = '';
    lastFocus?.focus({ preventScroll: true });
  });

  // Touch swipe
  let touchX = 0;
  dialog.addEventListener('touchstart', (e) => (touchX = e.changedTouches[0].clientX), { passive: true });
  dialog.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );
}
