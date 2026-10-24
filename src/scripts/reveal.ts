/**
 * Fade-in on scroll for elements marked with [data-reveal] that start below
 * the fold. Elements already on screen at load are left alone, so they paint
 * immediately. The hidden state is a class added here, so content stays
 * visible without JavaScript.
 */
export function initReveal(root: ParentNode = document) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const below = [...root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')].filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight,
  );
  if (!below.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  );
  for (const el of below) {
    el.classList.add('reveal-pending');
    observer.observe(el);
  }
}
