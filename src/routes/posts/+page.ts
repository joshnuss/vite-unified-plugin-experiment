export async function load() {
  const posts = await Promise.all(
    Object.values(import.meta.glob('$posts/*.md')).map((content) => content())
  );

  return { posts };
}
