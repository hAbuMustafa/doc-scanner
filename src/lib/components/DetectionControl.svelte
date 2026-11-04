<script lang="ts">
  let { useMLDetection = $bindable(true) } = $props();
</script>

<label>
  <input type="checkbox" bind:checked={useMLDetection} />
  {#if useMLDetection}
    Advanced Detection
  {:else}
    Basic Detection
  {/if}
</label>
