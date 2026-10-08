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

  let slides: Slide[] = [];
  let pos = 0;
  let lastFocus: HTMLElement | null = null;

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

  function show(i: number) {
    pos = (i + slides.length) % slides.length;
    const slide = slides[pos];

    dialog!.classList.add('is-loading');
    img!.onload = () => dialog!.classList.remove('is-loading');
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
    show(index);
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

  // Click outside the figure closes (dialog fills the viewport).
  dialog.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.lightbox__figure, .lightbox__nav')) close();
  });

  dialog.addEventListener('close', () => {
    img!.removeAttribute('src');
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
