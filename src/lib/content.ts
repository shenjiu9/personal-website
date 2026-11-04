import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n';

export type Project = CollectionEntry<'projects'>;
export type Dimension = 'fields' | 'platforms' | 'industries' | 'projectTypes';
export const dimensions: Dimension[] = ['fields', 'industries', 'platforms', 'projectTypes'];
/** URL query keys used by the /work filters. */
export const queryKey: Record<Dimension, string> = {
  fields: 'field',
  industries: 'industry',
  platforms: 'platform',
  projectTypes: 'type',
};

export type Category = { id: string; zh: string; en: string; order: number };

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (p) => import.meta.env.DEV || p.data.status === 'published');
  return all.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

export async function getCategories(): Promise<Record<Dimension, Map<string, Category>>> {
  const out = {} as Record<Dimension, Map<string, Category>>;
  for (const d of dimensions) {
    const items = (await getCollection(d)).sort((a, b) => a.data.order - b.data.order);
    out[d] = new Map(items.map((i) => [i.id, { id: i.id, zh: i.data.zh, en: i.data.name, order: i.data.order }]));
  }
  return out;
}

export const catName = (c: Category | undefined, lang: Lang) => (c ? (lang === 'zh' ? c.zh : c.en) : '');

export async function getSettings() {
  const [s] = await getCollection('settings');
  if (!s) throw new Error('Missing src/content/settings/site.yaml');
  return s.data;
}
