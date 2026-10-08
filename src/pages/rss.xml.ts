import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getFeed } from '../lib/posts';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const feed = await getFeed();
  const site = context.site ?? new URL('http://localhost:4321');

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${SITE.lang}</language>`,
    items: feed.map((item) => ({
      title: item.title,
      description: item.description,
      pubDate: item.date,
      link: item.href, // already prefixed with base
      categories: [
        item.type === 'writeup' ? 'CTF Write-up' : 'Photo',
        ...item.categories,
        ...item.tags,
      ],
    })),
  });
}
