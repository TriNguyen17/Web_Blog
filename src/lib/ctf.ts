import type { MarkdownHeading } from 'astro';

/**
 * CTF categories. The key is what you write in the write-up frontmatter
 * (`category: RE`). Colours live in src/styles/global.css (`--cat-<slug>`).
 */
export const CATEGORIES = {
  RE: { label: 'RE', name: 'Reverse Engineering' },
  Forensics: { label: 'Forensics', name: 'Digital Forensics' },
  Web: { label: 'Web', name: 'Web Exploitation' },
  Crypto: { label: 'Crypto', name: 'Cryptography' },
  Pwn: { label: 'Pwn', name: 'Binary Exploitation' },
  Misc: { label: 'Misc', name: 'Miscellaneous' },
  OSINT: { label: 'OSINT', name: 'Open-Source Intelligence' },
  Blockchain: { label: 'Blockchain', name: 'Blockchain' },
  Mobile: { label: 'Mobile', name: 'Mobile' },
  Hardware: { label: 'Hardware', name: 'Hardware' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];

export const DIFFICULTIES = ['Baby', 'Easy', 'Medium', 'Hard', 'Insane'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const categorySlug = (cat: CategoryKey) => cat.toLowerCase();

export interface ChallengeMeta {
  name: string;
  id?: string;
  category: CategoryKey;
  difficulty?: Difficulty;
  points: number;
  solves?: number;
  author?: string;
}

/** A challenge heading (h2) with its sub-sections (h3). */
export interface TocEntry {
  slug: string;
  text: string;
  challenge?: ChallengeMeta;
  children: { slug: string; text: string }[];
}

export interface TocGroup {
  category: CategoryKey | null;
  items: TocEntry[];
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Match a heading against the frontmatter challenge list: by explicit `id`
 * first, then by name. Keep in sync with src/plugins/rehype-ctf-sections.mjs.
 */
export function matchChallenge(
  challenges: ChallengeMeta[],
  heading: { slug: string; text: string },
): ChallengeMeta | undefined {
  return (
    challenges.find((c) => c.id && c.id === heading.slug) ??
    challenges.find((c) => normalize(c.name) === normalize(heading.text))
  );
}

/**
 * Turn the flat heading list of a write-up into a table of contents:
 * h2 = challenge, h3 = step. Challenges are grouped by category, in the
 * order the categories first appear in the Markdown. h2 headings that are
 * not challenges (e.g. "Lời kết") end up in a trailing `category: null` group.
 */
export function buildToc(headings: MarkdownHeading[], challenges: ChallengeMeta[]) {
  const entries: TocEntry[] = [];
  for (const h of headings) {
    if (h.depth === 2) {
      entries.push({ slug: h.slug, text: h.text, challenge: matchChallenge(challenges, h), children: [] });
    } else if (h.depth === 3 && entries.length > 0) {
      entries.at(-1)!.children.push({ slug: h.slug, text: h.text });
    }
  }

  const groups = new Map<CategoryKey | null, TocEntry[]>();
  for (const entry of entries) {
    const key = entry.challenge?.category ?? null;
    if (key === null) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  const others = entries.filter((e) => !e.challenge);

  const toc: TocGroup[] = [...groups].map(([category, items]) => ({ category, items }));
  if (others.length) toc.push({ category: null, items: others });

  const missing = challenges.filter((c) => !entries.some((e) => e.challenge === c));
  return { toc, entries, missing };
}

/** Group frontmatter challenges by category, following the TOC order. */
export function buildBoard(challenges: ChallengeMeta[], entries: TocEntry[]) {
  const order: CategoryKey[] = [];
  for (const e of entries) {
    const cat = e.challenge?.category;
    if (cat && !order.includes(cat)) order.push(cat);
  }
  for (const c of challenges) if (!order.includes(c.category)) order.push(c.category);

  return order.map((category) => ({
    category,
    challenges: challenges
      .filter((c) => c.category === category)
      .map((c) => ({ ...c, slug: entries.find((e) => e.challenge === c)?.slug })),
  }));
}
