import type { APIRoute } from 'astro';
import { render } from 'astro:content';
import { getPhotoPosts, getWriteups, writeupUrl, photoPostUrl, allPhotoPostTags } from '../lib/posts';
import { matchChallenge, normalizeName } from '../lib/ctf';
import { splitH2Sections, stripMarkdown } from '../lib/utils';
import type { SearchDoc } from '../scripts/search';

/**
 * Build-time search index. Each write-up produces one doc for the whole
 * article plus one doc per challenge (deep-linked to its section), so a
 * search for a challenge name jumps straight into the write-up.
 */
export const GET: APIRoute = async () => {
  const [writeups, photos] = await Promise.all([getWriteups(), getPhotoPosts()]);
  const docs: SearchDoc[] = [];

  for (const entry of writeups) {
    const href = writeupUrl(entry);
    const body = stripMarkdown(entry.body);
    docs.push({
      type: 'writeup',
      title: entry.data.title,
      url: href,
      date: entry.data.pubDate.toISOString(),
      description: entry.data.description,
      tags: entry.data.tags,
      meta: entry.data.ctf.name,
      text: body.slice(0, 4000),
    });

    // Per-challenge docs: deep link to the heading, text of its own section.
    const { headings } = await render(entry);
    const sections = splitH2Sections(entry.body);
    for (const c of entry.data.challenges) {
      const heading = headings.find((h) => h.depth === 2 && matchChallenge([c], h));
      // The rendered heading text has SmartyPants quotes / dashes, the raw
      // Markdown heading does not: compare both normalized.
      const target = normalizeName(heading?.text ?? c.name);
      const section = sections.find((s) => normalizeName(stripMarkdown(s.heading)) === target);
      docs.push({
        type: 'challenge',
        title: c.name,
        url: heading ? `${href}#${heading.slug}` : href,
        date: entry.data.pubDate.toISOString(),
        description: `${c.category} · ${c.points} pts${c.difficulty ? ` · ${c.difficulty}` : ''}`,
        tags: [c.category, ...entry.data.tags],
        meta: c.category,
        parent: entry.data.ctf.name,
        text: stripMarkdown(section?.body).slice(0, 2500),
      });
    }
  }

  for (const entry of photos) {
    docs.push({
      type: 'photo',
      title: entry.data.title,
      url: photoPostUrl(entry),
      date: entry.data.pubDate.toISOString(),
      description: entry.data.description,
      tags: allPhotoPostTags(entry),
      meta: entry.data.location ?? '',
      text: stripMarkdown(
        [entry.body, ...entry.data.photos.map((p) => p.caption ?? '')].join(' '),
      ).slice(0, 800),
    });
  }

  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json' },
  });
};
