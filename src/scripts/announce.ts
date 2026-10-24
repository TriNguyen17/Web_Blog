/** One shared live region for short status messages ("Đã sao chép…"). */
let timer: number | undefined;

export function liveRegion() {
  let el = document.getElementById('copy-status');
  if (!el) {
    el = document.createElement('span');
    el.id = 'copy-status';
    el.className = 'sr-only';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  return el;
}

export function announce(message: string) {
  const el = liveRegion();
  clearTimeout(timer);
  // Clear first so the same message is announced again on a repeated copy.
  el.textContent = '';
  requestAnimationFrame(() => (el.textContent = message));
  timer = window.setTimeout(() => (el.textContent = ''), 1800);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
