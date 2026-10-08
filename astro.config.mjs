// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified, rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeCtfSections from './src/plugins/rehype-ctf-sections.mjs';

/**
 * Domain + sub-path of the deployed site.
 *
 * - GitHub Pages: the workflow in .github/workflows/deploy.yml sets SITE_URL and
 *   BASE_PATH automatically (e.g. https://<user>.github.io + /<repo>).
 * - Vercel / Netlify: the production URL is detected from their env variables.
 * - Anything else: set SITE_URL (and BASE_PATH if the site lives in a sub-folder).
 */
function resolveSite() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.NETLIFY && process.env.URL) return process.env.URL;
  return 'http://localhost:4321';
}

export default defineConfig({
  site: resolveSite(),
  base: process.env.BASE_PATH || '/',

  integrations: [mdx(), sitemap()],

  markdown: {
    // Keep the remark/rehype pipeline so standard rehype plugins work.
    processor: unified({
      rehypePlugins: [
        // Give headings their ids first, so the CTF plugin can read them.
        rehypeHeadingIds,
        // Wrap every challenge (h2) and step (h3) of a write-up in <section>s
        // and inject the challenge meta (category, difficulty, points).
        rehypeCtfSections,
      ],
    }),
    shikiConfig: {
      // Dual theme: colours are emitted as CSS variables and switched
      // by [data-theme] in src/styles/code.css. The "-default" GitHub themes
      // keep every token at 4.5:1 or more on the code block backgrounds.
      themes: { light: 'github-light-default', dark: 'github-dark-default' },
      defaultColor: false,
      langAlias: { nasm: 'asm', x86asm: 'asm' },
    },
  },
});
