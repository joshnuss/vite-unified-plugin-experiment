import type { Plugin } from 'vite'
import type { TransformResult } from 'rollup'
import path from 'path'
import remarkRehype from 'remark-rehype'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkHTML from 'remark-html'
import rehypeStringify from 'rehype-stringify'
import { unified, type Plugin as UnifiedPlugin } from 'unified'
import type { VFile } from 'vfile'
import { read } from 'to-vfile'
import { matter } from 'vfile-matter'
import * as z from 'zod'

export async function parseMarkdown(
  path: string,
  remark: UnifiedPlugin[],
  rehype: UnifiedPlugin[]
): Promise<VFile> {
  const contents = await read(path)
  const data = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remark)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkHTML)
    .use(remarkRehype)
    .use(rehype)
    .use(rehypeStringify)
    .use(() => (tree, file) => {
      matter(file)
    })
    .process(contents)

  return data
}

export type Options<Schema> = {
  base: string
  pattern: string
  fields?: Schema
  remark?: UnifiedPlugin[]
  rehype?: UnifiedPlugin[]
  sort?: {
    field: string
    order?: 'ascending' | 'descending'
  }
}

export default function plugin<Schema extends z.Schema>(options: Options<Schema>): Plugin {
  return {
    name: 'vite-plugin-markdown',
    config() {
      return {
        resolve: {
          alias: {
            [`$${options.base}`]: path.resolve(`./src/${options.base}`)
          },
        }
      }
    },

    async transform(content, file): Promise<TransformResult> {
      if (!path.extname(file).match(/^\.md/)) {
        return
      }


      const {
        data: { matter },
        value: body
      } = await parseMarkdown(file, options.remark || [], options.rehype || [])

      let attributes: Schema | unknown

      if (options.fields) {
        attributes = options.fields.parse(matter)
      }

      let constants: string[] = []

      if (attributes) {
        constants = Object.entries(attributes).map(
          ([key, value]) => `export const ${key} = "${value}"`
        )
      }

      return {
        code: `
          export const id = "${path.basename(file, '.md')}"
          export const body = \`${body}\`
          ${constants.join('\n')}
        `
      }
    }
  }
}
