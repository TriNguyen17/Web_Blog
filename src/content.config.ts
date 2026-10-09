import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS, DIFFICULTIES } from './lib/ctf';

/**
 * A date written as YYYY-MM-DD (optionally with a time). Anything else is
 * rejected: `05/10/2025` would otherwise be read as month/day (10 May).
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const date = () =>
  z.preprocess(
    (v) => (typeof v === 'string' && ISO_DATE.test(v.trim()) ? new Date(v.trim()) : v),
    z.date({
      error: (issue) =>
        issue.input === undefined ? 'Required' : 'Ngày phải viết dạng YYYY-MM-DD, ví dụ 2025-10-20',
    }),
  );

/**
 * CTF write-ups: one Markdown/MDX file per competition.
 *   src/content/writeups/<slug>.md            or
 *   src/content/writeups/<slug>/index.md      (+ images next to it)
 */
const writeups = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writeups' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: date(),
      updatedDate: date().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      ctf: z.object({
        name: z.string(),
        url: z.url().optional(),
        /** Competition dates, free text: "18–19/10/2025". */
        date: z.string().optional(),
        format: z.string().optional(),
        team: z.string().optional(),
        /** e.g. "12/356". */
        rank: z.string().optional(),
      }),
      /** Challenge board. `name` must match the `## heading` of the challenge. */
      challenges: z
        .array(
          z.object({
            name: z.string(),
            /** Optional: the heading id, if the heading text differs from `name`. */
            id: z.string().optional(),
            category: z.enum(CATEGORY_KEYS),
            difficulty: z.enum(DIFFICULTIES).optional(),
            points: z.number().int().nonnegative(),
            solves: z.number().int().nonnegative().optional(),
            author: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

/**
 * Photo posts: one file per post / album.
 *   src/content/photos/<slug>/index.md + images/
 */
const photos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/photos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: date(),
      draft: z.boolean().default(false),
      /** Tags of the post, applied to every photo (#daily, #travel, #friends...). */
      tags: z.array(z.string()).default([]),
      location: z.string().optional(),
      /** Card image; defaults to the first photo. */
      cover: image().optional(),
      photos: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
            /** Extra tags for this photo only. */
            tags: z.array(z.string()).default([]),
            /** Defaults to the post's pubDate. */
            date: date().optional(),
          }),
        )
        .min(1),
    }),
});

export const collections = { writeups, photos };
