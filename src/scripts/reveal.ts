/**
 * Fade-in on scroll for every element marked with [data-reveal].
 * The hidden state only applies under `html.js` (see global.css), so content
 * stays visible without JavaScript.
 */
export function initReveal(root: ParentNode = document) {
  const targets = root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

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
  targets.forEach((el) => observer.observe(el));
}
