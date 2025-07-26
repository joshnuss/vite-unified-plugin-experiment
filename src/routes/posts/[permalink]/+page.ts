import { error, type ServerLoad } from '@sveltejs/kit'
import { get } from '#posts'

export const load: ServerLoad = async ({ params }) => {
  try {
    return {
      post: await get(params.permalink)
    }
  } catch (err) {
    console.error(err)
    error(404)
  }
}
