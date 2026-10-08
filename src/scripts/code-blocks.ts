/** Adds a "copy" button to every Shiki code block. */
const COPY_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/** One shared live region announces the copy result to screen readers. */
let announceTimer: number | undefined;

function announce(message: string) {
  const el = liveRegion();
  clearTimeout(announceTimer);
  // Clear first so the same message is announced again on a repeated copy.
  el.textContent = '';
  requestAnimationFrame(() => (el.textContent = message));
  announceTimer = window.setTimeout(() => (el.textContent = ''), 1800);
}

function liveRegion() {
  let el = document.getElementById('code-copy-status');
  if (!el) {
    el = document.createElement('span');
    el.id = 'code-copy-status';
    el.className = 'sr-only';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  return el;
}

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
    button.innerHTML = `${COPY_ICON}<span>copy</span>`;
    wrapper.append(button);

    let timer: number | undefined;
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      try {
        await navigator.clipboard.writeText(code.replace(/\n$/, ''));
        button.dataset.copied = 'true';
        button.innerHTML = `${CHECK_ICON}<span>copied</span>`;
        announce('Đã sao chép code');
      } catch {
        button.innerHTML = `${COPY_ICON}<span>failed</span>`;
        announce('Sao chép thất bại');
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.dataset.copied = 'false';
        button.innerHTML = `${COPY_ICON}<span>copy</span>`;
      }, 1800);
    });
  }
}
