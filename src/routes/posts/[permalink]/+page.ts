import { error, type ServerLoad } from '@sveltejs/kit'
import { get } from '#posts'

export const load: ServerLoad = async ({ params }) => {
  try {
    const post = await get(params.permalink)

    return { post }
  } catch (err) {
    console.error(err)
    error(404)
  }
}
