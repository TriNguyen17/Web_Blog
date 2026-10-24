/** Adds a copy button to every Shiki code block, and to flags in "Flag" steps. */
import { announce, copyText, liveRegion } from './announce';

const COPY_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

export function initCodeBlocks(root: ParentNode = document) {
  const blocks = root.querySelectorAll<HTMLPreElement>('pre.astro-code');
  // Create the live region up front: screen readers ignore regions that
  // appear and change in the same moment.
  if (blocks.length) liveRegion();
  for (const pre of blocks) {
    if (pre.parentElement?.classList.contains('code-wrapper')) continue;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.replaceWith(wrapper);
    wrapper.append(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.innerHTML = `${COPY_ICON}<span>sao chép</span>`;
    const lang = pre.dataset.language;
    button.setAttribute('aria-label', lang && !/^(text|plaintext|txt)$/.test(lang) ? `Sao chép code ${lang}` : 'Sao chép code');
    wrapper.append(button);

    let timer: number | undefined;
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      if (await copyText(code.replace(/\n$/, ''))) {
        button.dataset.copied = 'true';
        button.innerHTML = `${CHECK_ICON}<span>đã chép</span>`;
        announce('Đã sao chép code');
      } else {
        button.innerHTML = `${COPY_ICON}<span>lỗi</span>`;
        announce('Sao chép thất bại');
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.dataset.copied = 'false';
        button.innerHTML = `${COPY_ICON}<span>sao chép</span>`;
      }, 1800);
    });
  }
}

/** A small copy button after each flag (`FLAG{...}` code) in a Flag step. */
export function initFlagCopy(root: ParentNode = document) {
  for (const code of root.querySelectorAll<HTMLElement>('.ctf-step--flag p > code')) {
    if (code.nextElementSibling?.classList.contains('flag-copy')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'flag-copy';
    button.setAttribute('aria-label', 'Sao chép flag');
    button.innerHTML = COPY_ICON;
    code.after(button);
    button.addEventListener('click', async () => {
      const ok = await copyText(code.textContent ?? '');
      button.innerHTML = ok ? CHECK_ICON : COPY_ICON;
      announce(ok ? 'Đã sao chép flag' : 'Sao chép thất bại');
      window.setTimeout(() => (button.innerHTML = COPY_ICON), 1500);
    });
  }
}
