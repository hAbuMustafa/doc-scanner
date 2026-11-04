<script lang="ts">
  import Save from "@lucide/svelte/icons/save";
  import EditCorners from "@lucide/svelte/icons/square-dashed-mouse-pointer";
  import { Scanner } from "scanic";
  import { getContext, onMount, untrack } from "svelte";
  import Rotate from "./Rotate.svelte";
  import Filters from "./Filters.svelte";
  import DeleteScan from "@lucide/svelte/icons/x";
  import CornerEditor from "./CornerEditor.svelte";

  type PropsT = {
    file: File;
    index: number;

    contrast: number;
    brightness: number;
    grayscale: number;

    flipRight: boolean;
    flipLeft: boolean;
  };

  const {
    file,
    index,

    contrast,
    brightness,
    grayscale,

    flipRight,
    flipLeft,
  }: PropsT = $props();

  let useMLDetection = $state(true);

  const scanner = $derived(
    new Scanner({
      detector: useMLDetection ? "ml" : "classical",
    }),
  );

  let canvas: HTMLCanvasElement;
  let scanResult: HTMLCanvasElement = $state();
  let img: HTMLImageElement | HTMLCanvasElement | ImageData = $state(
    new Image(),
  );

  let c = $derived(contrast);
  let b = $derived(brightness);
  let g = $derived(grayscale);

  let r = $derived(0);

  let href = $state("");

  let filters = $derived(`contrast(${c}) brightness(${b}) grayscale(${g})`);

  onMount(async () => {
    if (!file || !file.name) return;

    img = new Image();
    const uri = URL.createObjectURL(file);
    img.src = uri;
    href = uri;
    await new Promise((resolve) => (img.onload = resolve));

    URL.revokeObjectURL(uri);
  });

  $effect(() => {
    const imageArb = img;
    const scanArb = scanner;

    if (!img && !img.complete && !img.naturalHeight) return;

    scanner
      .scan(img, {
        mode: "extract",
        output: "canvas",
      })
      .then((result) => {
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
      });
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

  $effect(() => {
    const fl = flipLeft;

    untrack(() => {
      r -= r === 0 ? -270 : 90;
    });
  });

  $effect(() => {
    const fr = flipRight;

    untrack(() => {
      r += r === 270 ? -270 : 90;
    });
  });

  const removeFile: (fileName: string) => void = getContext("remove-file");
</script>

<div class="scan-wrapper">
  <div class="canvas-wrapper">
    <canvas bind:this={canvas}></canvas>
    <small>{file.name}</small>
  </div>

  <div class="controls">
    <Filters bind:contrast={c} bind:brightness={b} bind:grayscale={g} />

    <Rotate bind:angle={r} />

    <div class="action-wrapper">
      <label
        class="detection-method"
        title="detection method: {useMLDetection ? 'Advanced' : 'Basic'}"
      >
        <input type="checkbox" bind:checked={useMLDetection} />
        {useMLDetection ? "Advanced" : "Basic"}
      </label>

      <button
        class="icon-button"
        command="show-modal"
        commandfor="corner-editor-{index}"
        title="Edit Corners"
      >
        <EditCorners size="2rem" />
      </button>

      <a class="icon-button" {href} download={file.name} title="download">
        <Save size="2rem" />
      </a>

      <button class="icon-button" onclick={() => removeFile(file.name)}>
        <DeleteScan size="2rem" />
      </button>
    </div>
  </div>
</div>

{#if scanResult}
  <CornerEditor image={img} bind:canvas={scanResult} {index} {useMLDetection} />
{/if}

<style>
  .scan-wrapper {
    box-sizing: border-box;
    border: 1px solid black;
    border-radius: 8px;
    padding: 2rem;
    width: max(600px, 25vw);

    display: grid;
    grid-template-columns: 1fr max(25vw, 300px);
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
      align-items: center;

      .detection-method {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;

        &:has(input:checked) {
          background-color: royalblue;
        }

        input[type="checkbox"] {
          display: none;
        }
      }
    }
  }
</style>
