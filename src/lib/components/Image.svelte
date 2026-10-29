<script lang="ts">
  import FlipRight from "@lucide/svelte/icons/corner-right-down";
  import FlipLeft from "@lucide/svelte/icons/corner-left-down";
  import type { Scanner } from "scanic";
  import { onMount } from "svelte";
  import Rotate from "./Rotate.svelte";
  import Filters from "./Filters.svelte";

  type PropsT = {
    file: File;
    scanner: Scanner;

    contrast: number;
    brightness: number;
    grayscale: number;

    rotation: number;
  };

  const {
    file,
    scanner,

    contrast,
    brightness,
    grayscale,

    rotation,
  }: PropsT = $props();

  let canvas: HTMLCanvasElement;
  let scanResult: HTMLCanvasElement;

  let c = $derived(contrast);
  let b = $derived(brightness);
  let g = $derived(grayscale);

  let r = $derived(rotation);

  let filters = $derived(`contrast(${c}) brightness(${b}) grayscale(${g})`);

  onMount(async () => {
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));

    const result = await scanner.scan(img, {
      mode: "extract",
      output: "canvas",
    });

    if (result.success) {
      scanResult = result.output as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      canvas.width = scanResult.width;
      canvas.height = scanResult.height;
      ctx.filter = filters;
      ctx.drawImage(scanResult, 0, 0);
      ctx.filter = "none";
    }

    URL.revokeObjectURL(img.src);
  });

  $effect(() => {
    // arbitrary access to force dependency read in case of initial check (scanResult || canvas) === null
    const f = filters;
    const rot = r;

    if (!scanResult || !canvas) return;

    const is90 = r === 90 || r === 270;
    canvas.width = is90 ? scanResult.height : scanResult.width;
    canvas.height = is90 ? scanResult.width : scanResult.height;

    const ctx = canvas.getContext("2d")!;
    ctx.filter = f;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((r * Math.PI) / 180);
    ctx.drawImage(scanResult, -scanResult.width / 2, -scanResult.height / 2);
    ctx.restore();
    ctx.filter = "none";
  });
</script>

<div class="scan-wrapper">
  <div class="controls">
    <Filters bind:contrast={c} bind:brightness={b} bind:grayscale={g} />

    <Rotate bind:angle={r} />
  </div>

  <canvas bind:this={canvas}></canvas>
</div>

<style>
  canvas {
    width: max(25vw, 30vh);
  }
</style>
