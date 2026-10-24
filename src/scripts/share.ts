/**
 * Links to sections and sharing:
 *  - [data-copy-link] on a heading "#" anchor: copy the URL of that section
 *    (and put it in the address bar). Without JS it is a normal anchor.
 *  - [data-share-copy]: copy the page URL.
 *  - [data-share-native]: Web Share sheet (shown only where supported).
 */
import { announce, copyText, liveRegion } from './announce';

export function initShare(root: ParentNode = document) {
  // Created up front: screen readers ignore a region that appears and changes at once.
  liveRegion();
  root.addEventListener('click', async (ev) => {
    const e = ev as MouseEvent;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-copy-link]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const target = new URL(a.href, location.href);
    history.replaceState(null, '', target.hash);
    const ok = await copyText(target.href);
    const name = a.getAttribute('aria-label')?.match(/“(.*)”/)?.[1] ?? '';
    announce(ok ? `Đã sao chép liên kết tới “${name}”` : 'Sao chép thất bại');
    if (ok) {
      a.dataset.copied = 'true';
      window.setTimeout(() => delete a.dataset.copied, 1500);
    }
  });

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-share-copy]')) {
    button.addEventListener('click', async () => {
      const u = new URL(location.href);
      u.hash = '';
      const ok = await copyText(u.href);
      announce(ok ? 'Đã sao chép liên kết bài viết' : 'Sao chép thất bại');
      const label = button.querySelector('span');
      if (ok && label) {
        const old = label.textContent;
        label.textContent = 'Đã chép';
        window.setTimeout(() => (label.textContent = old), 1500);
      }
    });
  }

  const shareData = { title: document.title, url: location.href.split('#')[0] };
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-share-native]')) {
    if (!('share' in navigator) || (navigator.canShare && !navigator.canShare(shareData))) continue;
    button.hidden = false;
    button.addEventListener('click', () => navigator.share(shareData).catch(() => {}));
  }
}
