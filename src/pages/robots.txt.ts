import type { APIContext } from 'astro';
import { url } from '../lib/utils';

export function GET({ site }: APIContext) {
  const sitemap = site ? new URL(url('/sitemap-index.xml'), site).href : '';
  const body = ['User-agent: *', 'Allow: /', sitemap && `Sitemap: ${sitemap}`, ''].filter(Boolean).join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
