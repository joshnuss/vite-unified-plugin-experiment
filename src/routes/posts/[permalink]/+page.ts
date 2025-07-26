import { error, type ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ params }) => {
  try {
    const post = await import(`#posts/${params.permalink}.md`)

    return { post }
  } catch (err) {
    console.log(err)
    error(404)
  }
}
