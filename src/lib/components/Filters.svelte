<script lang="toString">
  let {
    contrast = $bindable(1),
    brightness = $bindable(1),
    grayscale = $bindable(0),
    accentColor = "",
  } = $props();
</script>

<div class="filters" style:accent-color={accentColor}>
  <label>
    Contrast ({contrast.toFixed(2)})
    <input type="range" bind:value={contrast} min="0" max="2" step="0.01" />
  </label>
  <label>
    Brightness ({brightness.toFixed(2)})
    <input type="range" bind:value={brightness} min="0" max="2" step="0.01" />
  </label>
  <label>
    Grayscale ({grayscale.toFixed(2)})
    <input type="range" bind:value={grayscale} min="0" max="1" step="0.01" />
  </label>
</div>

<style>
  .filters {
    display: grid;
    grid-template-columns: 1fr 2fr;

    label {
      display: grid;
      grid-column: span 2;
      grid-template-columns: subgrid;
      white-space: nowrap;
    }
  }
</style>
