import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import unified from './src/plugin';
import * as z from 'zod'
import remarkGfm from 'remark-gfm'
import remarkCallout from '@r4ai/remark-callout'
import rehypeShiki from '@shikijs/rehype'

export default defineConfig({
	plugins: [
    unified({
      base: 'src/posts/*.md',
      matter: z.object({
        title: z.string().nonempty(),
        banner: z.string().url().nonempty(),
        summary: z.optional(z.string()),
        date: z.string().date(),
        tags: z.optional(z.array(z.string())),
        author: z.enum(['josh', 'jonathan'])
      }),
      remark: [
        remarkGfm,
        remarkCallout
      ],
      rehype: [
        [rehypeShiki, {
          langs: ['javascript', 'html', 'css'],
          themes: {
            light: 'vitesse-light',
            dark: 'vitesse-dark'
          }
        }]
      ],
      sort: { field: 'date', order: 'descending' }
    }),
    sveltekit()
  ],
  resolve: {
    alias: {
      $posts: path.resolve('./src/posts')
    }
  }
});
