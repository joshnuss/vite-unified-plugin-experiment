<script lang="ts">
  let { data } = $props()
  let { post } = $derived(data)
</script>

<h1>{post.title}</h1>
{@html post.body}

<pre>{JSON.stringify(post, null, 2)}</pre>
