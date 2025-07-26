import { list_posts } from '#posts'

export async function load() {
  return {
    posts: await list_posts()
  }
}
