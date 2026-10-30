<script lang="ts">
  import Save from "@lucide/svelte/icons/save";
  import type { Scanner } from "scanic";
  import { getContext, onMount } from "svelte";
  import Rotate from "./Rotate.svelte";
  import Filters from "./Filters.svelte";
  import DeleteScan from "@lucide/svelte/icons/x";
  import { dragHandle } from "svelte-dnd-action";

  type PropsT = {
    file: File;
    scanner: Scanner;
    index: number;

    contrast: number;
    brightness: number;
    grayscale: number;

    rotation: number;
  };

  const {
    file,
    scanner,
    index,

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

  let href = $state("");

  let filters = $derived(`contrast(${c}) brightness(${b}) grayscale(${g})`);

  onMount(async () => {
    if (!file || !file.name) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));

    href = img.src;

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
      canvas.toBlob((blob) => {
        if (!blob) return;
        href = URL.createObjectURL(blob);
      });
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
    canvas.toBlob((blob) => {
      if (!blob) return;
      href = URL.createObjectURL(blob);
    });

    return () => {
      URL.revokeObjectURL(href);
    };
  });

  const removeFile: (n: number) => void = getContext("remove-file");
</script>

<div class="scan-wrapper">
  <div class="drag-handle" use:dragHandle>⠿</div>

  <div class="canvas-wrapper">
    <canvas bind:this={canvas}></canvas>
    <small>{file.name}</small>
  </div>

  <div class="controls">
    <Filters bind:contrast={c} bind:brightness={b} bind:grayscale={g} />

    <Rotate bind:angle={r} />

    <div class="action-wrapper">
      <a {href} download={file.name} title="download">
        <Save size="2rem" />
      </a>

      <button class="icon-button" onclick={() => removeFile(index)}>
        <DeleteScan size="2rem" />
      </button>
    </div>
  </div>
</div>

<style>
  .scan-wrapper {
    box-sizing: border-box;
    border: 1px solid black;
    border-radius: 8px;
    padding: 2rem;
    width: max(600px, 25vw);

    display: grid;
    grid-template-columns: 2ch 1fr max(25vw, 300px);
    gap: 1vw;
    place-items: center;

    .canvas-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      canvas {
        max-width: 100%;
        max-height: 40lvh;
        border: 1px solid midnightblue;
      }

      small {
        color: gray;
      }
    }

    .action-wrapper {
      display: flex;
      justify-content: space-around;

      a {
        color: inherit;
      }
    }
  }
</style>
