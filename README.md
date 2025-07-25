# vite unified plugin

experiment to create a framework-agnostic vite plugin for working with markdown

## Benefits

- Based on `unified`
- Supports `remark` & `rehype` plugins
- Simple API
  - Loading a single post ``await import(`$posts/${slug}.md`)``
  - Loading multiple posts `import.meta.glob("$posts/*.md")`
- Can have multiple directories (blog, docs) with separate config
- Frontmatter is typed with Zod
- Supports Shiki via rehype

## Config example

The plugin API looks like this:

```javascript
// in vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import unified from './src/plugins/unified'
import * as z from 'zod'

export default defineConfig({
  plugins: [
    unified({
      base: 'src/posts/*.md',
      matter: z.object({
        title: z.string().nonempty(),
        summary: z.optional(z.string()),
        date: z.string().date()
      }),
      remark: [
        // remark plugins
      ],
      rehype: [
        // rehype plugins
      ]
    }),

    sveltekit()
  ]
})
```
