import { error, type ServerLoad } from '@sveltejs/kit'
import { get_post } from '#posts'

export const load: ServerLoad = async ({ params }) => {
  try {
    const post = await get_post(params.permalink)

    return { post }
  } catch (err) {
    console.log(err)
    error(404)
  }
}
