import { list } from '#posts'

export async function load() {
  const posts = await list()

  return { posts }
}
