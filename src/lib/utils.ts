/** Prefix an internal path with the configured `base` (needed on GitHub Pages). */
export function url(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDate = (date: Date) => dateFormatter.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** Tag -> URL-safe slug ("Đà Lạt" -> "da-lat"). */
export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Rough reading time of a Markdown body (code counts a bit less). */
export function readingTime(body = '') {
  let codeWords = 0;
  const prose = body.replace(/```[\s\S]*?```/g, (code) => {
    codeWords += code.split(/\s+/).length;
    return ' ';
  });
  const words = prose.split(/\s+/).filter(Boolean).length + codeWords / 3;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Split a Markdown body into its `## ` (h2) sections, ignoring lines inside
 * fenced code blocks. Content before the first h2 is dropped.
 */
export function splitH2Sections(body = '') {
  const sections: { heading: string; body: string }[] = [];
  let fence: string | null = null;
  for (const line of body.split('\n')) {
    const marker = /^\s*(```|~~~)/.exec(line)?.[1];
    if (marker) fence = fence === marker ? null : (fence ?? marker);
    const h2 = !fence && /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (h2) sections.push({ heading: h2[1], body: '' });
    else if (sections.length) sections[sections.length - 1].body += `${line}\n`;
  }
  return sections;
}

/** Plain-text version of a Markdown body, for search and descriptions. */
export function stripMarkdown(body = '') {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/^[#>\-*|\s]+/gm, ' ')
    // Emphasis markers only at word edges, so snake_case names and flags
    // (dns_3xf1l, render_template_string) stay searchable.
    .replace(/(?<![\p{L}\p{N}])[*_~]+|[*_~]+(?![\p{L}\p{N}])|\|/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
