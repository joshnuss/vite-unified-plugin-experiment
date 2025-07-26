# vite unified plugin

experiment to create a framework-agnostic vite plugin for working with markdown

## Benefits

- Based on `unified`
- Supports `remark` & `rehype` plugins
- Simple API
  - Loading a single post `await get_post(slug)`
  - Loading multiple posts `await list_posts()`
- Can have multiple directories (blog, docs) with separate config
- Frontmatter is typed with Zod
- Supports Shiki via rehype
- It automatically adds as alias for each collection, for example `base: 'posts'` adds an alias `import ... from '#posts'`
- Can sort content, for example based on date

## Config example

The plugin API looks like this:

```javascript
// in vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import collection from './src/lib/plugin'
import * as z from 'zod'

export default defineConfig({
  plugins: [
    collection({
      base: 'posts',
      pattern: '*.md',
      fields: z.object({
        title: z.string().nonempty(),
        banner: z.url(),
        summary: z.string().optional(),
        date: z.iso.date(),
        tags: z.array(z.string()).optional(),
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

## Usage example

For example in SvelteKit

### To load a list of posts:

```javascript
// in src/routes/posts/+page.svelte
import { list_posts } from '#posts'

export async function load() {
  return {
    posts: await list_posts()
  }
}
```

Under the hoods this uses `import.meta.glob(...)`

### To load a single post:

```javascript
// in src/routes/posts/[slug]/+page.svelte
import { error, type ServerLoad } from '@sveltejs/kit'
import { get_post } from '#posts'

export const load: ServerLoad = async ({ params }) => {
  try {
    return {
      post: await get_post(params.slug)
    }
  } catch (err) {
    error(404)
  }
}
```

Under the hoods this uses `await import(...)`
