# vite unified plugin

Experimental vite plugin for markdown blogs & docs sites.

## Benefits

- Super simple API and ultra-light setup.
- Framework agnostic. Works with Svelte, Vue, and React.
- Type safe frontmatter and dynamically typed content.

## Features

- Based on `unified`. Supports all `remark` & `rehype` plugins.
- Simple API
  - Loading a single post `await get(slug)`
  - Loading multiple posts `await list()`
- Can have multiple directories (blog, docs) with separate config
- Supports Shiki via rehype
- It adds an alias for each collection, for example a collection named `'posts'` an alias `import ... from '#posts'` is provided.
- It be configured to sort the content, for example based on in the frontmatter like `date`

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
      ],

      // set a default sort order based on `date` field
      sort: { field: 'date', direction: 'descending'}
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
import { list } from '#posts'

export async function load() {
  const posts = await list()

  return { posts }
}
```

Under the hoods this uses `import.meta.glob(...)`

### To load a single post:

```javascript
// in src/routes/posts/[slug]/+page.svelte
import { error, type ServerLoad } from '@sveltejs/kit'
import { get } from '#posts'

export const load: ServerLoad = async ({ params }) => {
  try {
    const post = await get(params.slug)

    return { post }
  } catch (err) {
    error(404)
  }
}
```

Under the hoods this uses `await import(...)`
