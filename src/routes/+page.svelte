<script lang="ts">
  import { Scanner } from "scanic";
  import { onMount } from "svelte";

  const scanner = new Scanner({ detector: "ml" });

  onMount(async () => {
    await scanner.initialize();
  });

  let canvas: HTMLCanvasElement;
  let scanResult: HTMLCanvasElement;

  async function handleFile(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((r) => (img.onload = r));

    const result = await scanner.scan(img, {
      mode: "extract",
      output: "canvas",
    });

    if (result.success) {
      scanResult = result.output as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      canvas.width = scanResult.width;
      canvas.height = scanResult.height;
      ctx.drawImage(scanResult, 0, 0);
    }

    URL.revokeObjectURL(img.src);
  }

  function setFilters() {
    if (!scanResult) return;

    const ctx = canvas.getContext("2d")!;
    ctx.filter = `contrast(${contrast}) brightness(${brightness})`;
    ctx.drawImage(scanResult, 0, 0);
    ctx.filter = "none";
  }

  let contrast = $state(1);
  let brightness = $state(1);
  let gray = $state(0);
</script>

<h1>Doc Scanner with <code>Scanic</code></h1>

<input type="file" onchange={handleFile} />

<br />
<input
  type="range"
  bind:value={contrast}
  min="0"
  max="2"
  step="0.01"
  oninput={setFilters}
/>
<input
  type="range"
  bind:value={brightness}
  min="0"
  max="2"
  step="0.01"
  oninput={setFilters}
/>
<input
  type="range"
  bind:value={gray}
  min="0"
  max="1"
  step="0.01"
  oninput={setFilters}
/>

<canvas bind:this={canvas}></canvas>
