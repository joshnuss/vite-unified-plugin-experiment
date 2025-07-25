import { error, type ServerLoad } from '@sveltejs/kit'
import * as p from '$posts/foo.md'

export const load: ServerLoad = async ({ params }) => {
  console.log(p)
  try {
    const post = await import(`$posts/${params.permalink}.md`)

    return { post }
  } catch (err) {
    console.log(err)
    error(404)
  }
}
