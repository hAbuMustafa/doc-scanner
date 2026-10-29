<script lang="ts">
  import FlipRight from "@lucide/svelte/icons/corner-right-down";
  import FlipLeft from "@lucide/svelte/icons/corner-left-down";

  let { angle = $bindable(0) } = $props();
</script>

<div class="rotation">
  <button onclick={() => (angle -= angle === 0 ? -270 : 90)}>
    <FlipLeft />
  </button>

  <button onclick={() => (angle += angle === 270 ? -270 : 90)}>
    <FlipRight />
  </button>
</div>
