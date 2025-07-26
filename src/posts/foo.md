---
title: Foo
date: 2020-01-01
banner: https://placehold.co/600x400
tags:
  - test
  - bla
author: josh
---

Hello World

```javascript
x = 1 + 1
```

## some svelte codes

```svelte
<script lang="ts">
  let props = $props()
</script>

{#each props as prop}
  {prop}
{/each}
```
