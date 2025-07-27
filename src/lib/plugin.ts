import type { Plugin } from 'vite'
import type { TransformResult } from 'rollup'
import fs from 'fs/promises'
import path from 'path'
import remarkRehype from 'remark-rehype'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkHTML from 'remark-html'
import rehypeStringify from 'rehype-stringify'
import { unified, type PluggableList } from 'unified'
import type { VFile } from 'vfile'
import { read } from 'to-vfile'
import { matter } from 'vfile-matter'
import * as z from 'zod'
import type { ZodType } from 'zod'
import { camelCase } from 'scule'
import pluralize from 'pluralize'

export async function parseMarkdown(
  path: string,
  remark?: PluggableList,
  rehype?: PluggableList
): Promise<VFile> {
  const contents = await read(path)
  const data = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remark || [])
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkHTML)
    .use(remarkRehype)
    .use(rehype || [])
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
  remark?: PluggableList
  rehype?: PluggableList
  sort?: {
    field: string
    order?: 'ascending' | 'descending'
  }
}

export default function plugin<Schema extends z.Schema>(options: Options<Schema>): Plugin {

  return {
    name: 'vite-plugin-collection',
    config() {
      return {
        resolve: {
          alias: {
            [`#${options.base}`]: path.resolve(`./src/${options.base}`)
          },
        }
      }
    },

    resolveId(id) {
      if (id.endsWith(`src/${options.base}`)) {
        return id
      }
    },

    load(id) {
      if (id.endsWith(`src/${options.base}`)) {
        return `
          export function get(id) {
            return import(\`./${options.base}/\${id}.md\`)
          }

          export async function list() {
            const files = import.meta.glob('./${options.base}/*.md')
            const records = await Promise.all(
              Object
                .values(files)
                .map((content) => content())
            )
            return records${build_sort(options.sort)}
          }
        `
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

      await write_types(options)

      let constants: string[] = []

      if (attributes) {
        constants = Object.entries(attributes).map(
          ([key, value]) => `export const ${key} = ${JSON.stringify(value)}`
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


function build_sort<Schema>(sort: Options<Schema>['sort']): string {
  if (!sort) return ''

  const {field, order} = sort

  if (order == 'descending') {
    return `.sort((a, b) => {
      if (a.${field} > b.${field}) {
        return -1
      }
      if (a.${field} < b.${field}) {
        return 1
      }
      return 0
    })`
  }

  return `.sort((a, b) => {
    if (a.${field} < b.${field}) {
      return -1
    }
    if (a.${field} > b.${field}) {
      return 1
    }
    return 0
  })`
}

type Type = {
  name: string
  type: string
  optional: boolean
}

async function write_types<Schema>(options: Options<Schema>) {
  const typings: Type[] = [
    { name: 'id', type: 'string', optional: false },
    { name: 'body', type: 'string', optional: false },
  ]

  if (options.fields) {
    // @ts-expect-error later
    Object.entries(options.fields.shape).forEach(([key, value]) => {
      if (!value) return

      // @ts-expect-error later
      const optional = value.def.type == 'optional'
      // @ts-expect-error later
      const type = type_string(value.def)

      typings.push({ name: key, type, optional })
    })
  }

  console.log(typings)

  await write_type_definitions(typings, options)
}

function type_string(def: ZodType): string {
  const optional = def.type == 'optional'

  // @ts-expect-error later
  const type = optional ? def.innerType.def.type : def.type

  if (type == 'array') {
    // @ts-expect-error later
    const element = def.innerType.element.def.type
    return `${element}[]`
  }

  if (type == 'enum') {
    // @ts-expect-error later
    return Object.values(def.entries).map(val => JSON.stringify(val)).join(' | ')
  }

  return type
}

async function write_type_definitions<Schema>(typings: Type[], options: Options<Schema>) {
  const class_name = pluralize.singular(capitalize(camelCase(options.base)))
  let code = ''

  code += `/*
 * Types generated by Vite Plugin
 *
*/\n\n`
  code += `declare module "#${options.base}" {\n`

  code += `  export type ${class_name} = { \n`
  typings.forEach(type => {
    code += `    ${type.name}${type.optional ? '?' : ''}: ${type.type} \n`
  })
  code += `  }\n`

  code += `
  export function list(): Promise<${class_name}[]>
  export function get(id: string): Promise<${class_name}>\n`
  code += `}\n`

  await fs.writeFile('collections.d.ts', code)
}

function capitalize(str: string): string {
  if (!str) return ''

  return str[0].toUpperCase() + str.slice(1)
}
