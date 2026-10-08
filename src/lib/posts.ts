import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { CATEGORIES, type CategoryKey } from './ctf';
import { slugify, url } from './utils';

export type Writeup = CollectionEntry<'writeups'>;
export type PhotoPost = CollectionEntry<'photos'>;

const visible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;
const byDateDesc = (a: { data: { pubDate: Date } }, b: { data: { pubDate: Date } }) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

export async function getWriteups() {
  return (await getCollection('writeups', visible)).sort(byDateDesc);
}

export async function getPhotoPosts() {
  return (await getCollection('photos', visible)).sort(byDateDesc);
}

export const writeupUrl = (entry: Writeup) => url(`/writeups/${entry.id}/`);
export const photoPostUrl = (entry: PhotoPost) => url(`/photos/${entry.id}/`);
export const tagUrl = (tag: string) => url(`/tags/${slugify(tag)}/`);

/** Categories used in a write-up, in board order, with counts. */
export function writeupCategories(entry: Writeup) {
  const counts = new Map<CategoryKey, number>();
  for (const c of entry.data.challenges) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  return [...counts].map(([category, count]) => ({ category, count, name: CATEGORIES[category].name }));
}

/** Common shape used by cards, the home feed, tag pages, RSS and search. */
export interface FeedItem {
  type: 'writeup' | 'photo';
  id: string;
  title: string;
  description: string;
  date: Date;
  href: string;
  tags: string[];
  cover?: ImageMetadata;
  /** Write-ups: challenge categories. Photos: number of photos. */
  categories: CategoryKey[];
  photoCount?: number;
  ctfName?: string;
}

export function writeupToFeed(entry: Writeup): FeedItem {
  return {
    type: 'writeup',
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    date: entry.data.pubDate,
    href: writeupUrl(entry),
    tags: entry.data.tags,
    cover: entry.data.cover,
    categories: writeupCategories(entry).map((c) => c.category),
    ctfName: entry.data.ctf.name,
  };
}

export function photoPostToFeed(entry: PhotoPost): FeedItem {
  return {
    type: 'photo',
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    date: entry.data.pubDate,
    href: photoPostUrl(entry),
    tags: allPhotoPostTags(entry),
    cover: entry.data.cover ?? entry.data.photos[0].src,
    categories: [],
    photoCount: entry.data.photos.length,
  };
}

export async function getFeed() {
  const [writeups, photos] = await Promise.all([getWriteups(), getPhotoPosts()]);
  return [...writeups.map(writeupToFeed), ...photos.map(photoPostToFeed)].sort(
    (a, b) => b.date.valueOf() - a.date.valueOf(),
  );
}

/** Post tags + every per-photo tag, de-duplicated. */
export function allPhotoPostTags(entry: PhotoPost) {
  return [...new Set([...entry.data.tags, ...entry.data.photos.flatMap((p) => p.tags)])];
}

/** One photo of the gallery, with the album it belongs to. */
export interface GalleryItem {
  src: ImageMetadata;
  alt: string;
  caption?: string;
  tags: string[];
  date: Date;
  albumTitle: string;
  albumHref: string;
}

export function galleryItems(entry: PhotoPost): GalleryItem[] {
  return entry.data.photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    caption: photo.caption,
    tags: [...new Set([...entry.data.tags, ...photo.tags])],
    date: photo.date ?? entry.data.pubDate,
    albumTitle: entry.data.title,
    albumHref: photoPostUrl(entry),
  }));
}

/** All tags across the blog with their posts, sorted by popularity. */
export async function getTags() {
  const feed = await getFeed();
  const tags = new Map<string, { tag: string; slug: string; items: FeedItem[] }>();
  for (const item of feed) {
    for (const tag of item.tags) {
      const slug = slugify(tag);
      if (!tags.has(slug)) tags.set(slug, { tag, slug, items: [] });
      tags.get(slug)!.items.push(item);
    }
  }
  return [...tags.values()].sort((a, b) => b.items.length - a.items.length || a.tag.localeCompare(b.tag));
}
