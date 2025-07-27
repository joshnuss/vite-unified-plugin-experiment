import { error } from '@sveltejs/kit'
import { get } from '#posts'

export async function load({ params }) {
  try {
    const post = await get(params.permalink)

    return { post }
  } catch (err) {
    console.error(err)
    error(404)
  }
}
