import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		date: z.string(),
		topic: z.string(),
		read: z.string(),
		state: z.enum(['New', 'Filed']),
		excerpt: z.string(),
	}),
});

export const collections = { blog };
