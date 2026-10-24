/** Prefix an internal path with the configured `base` (needed on GitHub Pages). */
export function url(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Dates are shown in Vietnam time, whatever the time zone of the machine
 * that builds the site (GitHub Actions runs in UTC): a date written as
 * 2025-10-20 stays 20/10/2025, also in <time datetime>.
 */
const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
});
const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

export const formatDate = (date: Date) => dateFormatter.format(date);
/** YYYY-MM-DD in Vietnam time. */
export const isoDate = (date: Date) => isoFormatter.format(date);

/**
 * Tag -> URL-safe slug ("Đà Lạt" -> "da-lat", "C++" -> "c-plus-plus").
 * Tags without any Latin letter or digit (emoji, CJK) get a short stable
 * hash instead of an empty slug.
 */
export function slugify(input: string) {
  const slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug) return slug;
  let hash = 2166136261;
  for (const ch of input.normalize('NFC')) {
    hash ^= ch.codePointAt(0)!;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `tag-${hash.toString(36)}`;
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

/** Markdown before the first `## ` heading (ignoring fenced code blocks). */
export function introBeforeH2(body = '') {
  let fence: string | null = null;
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const marker = /^\s*(```|~~~)/.exec(lines[i])?.[1];
    if (marker) fence = fence === marker ? null : (fence ?? marker);
    else if (!fence && /^##\s/.test(lines[i])) return lines.slice(0, i).join('\n');
  }
  return body;
}

/** Plain-text version of a Markdown body, for search and descriptions. */
export function stripMarkdown(body = '') {
  // Inline code is kept verbatim (`__init__`, `m**3`): park it in placeholders
  // while Markdown syntax is stripped from the rest.
  const codes: string[] = [];
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/`([^`]*)`/g, (_, code: string) => `\u0000${codes.push(code) - 1}\u0000`)
    .replace(/\[\^[^\]]*\]:?/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/^[#>\-*|\s]+/gm, ' ')
    // Emphasis markers only at word edges, so snake_case names and flags
    // (dns_3xf1l, render_template_string) stay searchable.
    .replace(/(?<![\p{L}\p{N}])[*_~]+|[*_~]+(?![\p{L}\p{N}])/gu, '')
    .replace(/\|/g, ' ')
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)])
    .replace(/\s+/g, ' ')
    .trim();
}
