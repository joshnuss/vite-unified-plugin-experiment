<script lang="ts">
  let { data } = $props();
  let { post } = $derived(data);
</script>

<pre>{JSON.stringify(post, null, 2)}</pre>
