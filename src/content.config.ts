import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Mirrors keystatic.config.ts. Keystatic writes YAML; Astro reads + validates it here.
const bi = z.object({ zh: z.string().default(''), en: z.string().default('') });
const biReq = z.object({ zh: z.string().min(1), en: z.string().default('') });

const category = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '*.yaml', base: `./src/content/${dir}` }),
    schema: z.object({ name: z.string(), zh: z.string(), order: z.number().default(0) }),
  });

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) => {
    const caption = bi.optional();
    const block = z.discriminatedUnion('discriminant', [
      z.object({ discriminant: z.literal('section'), value: z.object({ heading: bi, text: bi }) }),
      z.object({ discriminant: z.literal('fullImage'), value: z.object({ image: image(), caption }) }),
      z.object({ discriminant: z.literal('twoUp'), value: z.object({ left: image(), right: image(), caption }) }),
      z.object({ discriminant: z.literal('threeUp'), value: z.object({ a: image(), b: image(), c: image(), caption }) }),
      z.object({
        discriminant: z.literal('textImage'),
        value: z.object({ image: image(), text: bi, imageSide: z.enum(['left', 'right']).default('right') }),
      }),
      z.object({ discriminant: z.literal('quote'), value: z.object({ text: bi, author: z.string().default('') }) }),
    ]);
    return z.object({
      internalName: z.string().optional(),
      status: z.enum(['published', 'draft']).default('draft'),
      featured: z.boolean().default(false),
      order: z.number().default(10),
      title: biReq,
      summary: biReq,
      client: z.string().default(''),
      year: z.number(),
      role: bi.optional(),
      services: z.array(bi).default([]),
      liveUrl: z.string().url().nullish(),
      cover: image(),
      coverPortrait: z.boolean().default(false),
      hero: image(),
      heroVideo: z.string().nullish(),
      challenge: bi.optional(),
      solution: bi.optional(),
      result: bi.optional(),
      fields: z.array(z.string()).default([]),
      platforms: z.array(z.string()).default([]),
      industries: z.array(z.string()).default([]),
      projectTypes: z.array(z.string()).default([]),
      body: z.array(block).default([]),
    });
  },
});

const settings = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './src/content/settings' }),
  schema: ({ image }) =>
    z.object({
      email: z.string(),
      available: z.boolean().default(true),
      location: bi.optional(),
      about: bi.optional(),
      services: z.array(z.object({ title: bi, description: bi })).default([]),
      experience: z.array(z.object({ period: z.string(), company: z.string(), role: bi })).default([]),
      clients: z.array(z.object({ name: z.string(), logo: image().nullish() })).default([]),
      socials: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      resume: z.string().nullish(),
    }),
});

export const collections = {
  projects,
  settings,
  fields: category('fields'),
  platforms: category('platforms'),
  industries: category('industries'),
  projectTypes: category('project-types'),
};
