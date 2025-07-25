<script lang="ts">
  let { data } = $props();
  let { posts } = $derived(data);
</script>

<pre>{JSON.stringify(posts, null, 2)}</pre>
