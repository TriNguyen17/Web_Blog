import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getFeed } from '../lib/posts';
import { SITE } from '../config';
import { url } from '../lib/utils';

export async function GET(context: APIContext) {
  const feed = await getFeed();
  // Include the base path (/Web_Blog on GitHub Pages) so the channel <link>
  // points at the blog's home page, not the bare domain.
  const site = new URL(url('/'), context.site ?? 'http://localhost:4321');
  const self = new URL(url('/rss.xml'), site).href;

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${SITE.lang}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
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
