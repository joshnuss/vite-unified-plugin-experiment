import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import collection from './src/lib/plugin'
import * as z from 'zod'
import remarkGfm from 'remark-gfm'
import remarkCallout from '@r4ai/remark-callout'
import rehypeShiki from '@shikijs/rehype'

export default defineConfig({
  plugins: [
    collection({
      base: 'posts',
      pattern: '*.md',
      fields: z.object({
        title: z.string().nonempty(),
        banner: z.url().nonempty(),
        summary: z.string().optional(),
        date: z.iso.date(),
        tags: z.array(z.string()).optional(),
        author: z.enum(['josh', 'jonathan'])
      }),
      remark: [remarkGfm, remarkCallout],
      rehype: [
        [
          rehypeShiki,
          {
            langs: ['javascript', 'html', 'css', 'svelte'],
            themes: {
              light: 'vitesse-light',
              dark: 'vitesse-dark'
            }
          }
        ]
      ],
      sort: { field: 'date', order: 'descending' }
    }),
    sveltekit()
  ]
})
