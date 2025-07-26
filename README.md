# vite unified plugin

Experimental vite plugin for markdown blogs & docs sites.

## Benefits

- Super simple API and ultra-light setup.
- Framework agnostic. Works with Svelte, Vue, and React.
- Type safe frontmatter and dynamically typed content.

## Features

- Based on `unified`. Supports all `remark` & `rehype` plugins.
- Simple API
  - Loading a single post: `const post = await get(slug)`
  - Loading multiple posts: `const posts = await list()`
- Supports multiple directories (blog, docs) with separate config.
- Supports Shiki code formatting via rehype.
- Adds an alias for each collection. For example a collection in `src/docs` gets aliased as `#docs`, ie `import { get, list } from '#docs'`.
- Can be configured to sort the content. For example based on frontmatter fields like `date`.

## Config example

The plugin configuration looks like this:

```javascript
// in vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import collection from './src/lib/plugin'
import * as z from 'zod'

export default defineConfig({
  plugins: [
    collection({
      // corresponds to folder src/posts
      base: 'posts',

      // collection matches files src/posts/*.md
      pattern: '*.md',

      // frontmatter fields use a zod schema
      fields: z.object({
        title: z.string().nonempty(),
        banner: z.url(),
        summary: z.string().optional(),
        date: z.iso.date(),
        tags: z.array(z.string()).optional(),
      }),

      // optional remark plugins
      remark: [],
      // optional rehype plugins
      rehype: [],

      // order the posts based on `date` frontmatter field
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

// load all posts
export async function load() {
  const posts = await list()

  return { posts }
}
```

Under the hood this uses "import globbing" with `import.meta.glob(...)`

### To load a single post:

```javascript
// in src/routes/posts/[slug]/+page.svelte
import { error, type ServerLoad } from '@sveltejs/kit'
import { get } from '#posts'

// load post based on route params
export const load: ServerLoad = async ({ params }) => {
  try {
    const post = await get(params.slug)

    return { post }
  } catch (err) {
    error(404)
  }
}
```

Under the hood this uses a "dynamic import" with `await import(...)`
