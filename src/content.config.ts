import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS, DIFFICULTIES } from './lib/ctf';

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
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
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
      pubDate: z.coerce.date(),
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
            date: z.coerce.date().optional(),
          }),
        )
        .min(1),
    }),
});

export const collections = { writeups, photos };
