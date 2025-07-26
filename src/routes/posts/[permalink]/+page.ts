import { error, type ServerLoad } from '@sveltejs/kit'
import { get_post } from '#posts'

export const load: ServerLoad = async ({ params }) => {
  try {
    return {
      post: await get_post(params.permalink)
    }
  } catch (err) {
    console.error(err)
    error(404)
  }
}
