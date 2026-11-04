<script lang="ts">
  import {
    createCornerEditor,
    extractDocument,
    scanDocument,
    type CornerEditor,
  } from "scanic";
  import { onMount, onDestroy } from "svelte";

  type PropsT = {
    image: HTMLImageElement | HTMLCanvasElement | ImageData;
    canvas: HTMLCanvasElement;
    index: number;
    useMLDetection: boolean;
  };

  let { image, canvas = $bindable(), index, useMLDetection }: PropsT = $props();

  let editor: CornerEditor;

  let dialog: HTMLDialogElement;

  onMount(async () => {
    const detection = await scanDocument(image, {
      mode: "detect",
      detector: useMLDetection ? "ml" : "classical",
    });

    editor = createCornerEditor({
      container: dialog,
      image,
      corners: detection.corners || undefined,
      onConfirm: async (corners) => {
        const extracted = await extractDocument(image, corners, {
          output: "canvas",
        });
        canvas = extracted.output as HTMLCanvasElement;
        dialog.close();
      },
      onCancel: () => {
        dialog.close();
      },
    });
  });

  onDestroy(() => {
    editor.destroy();
  });
</script>

<dialog id="corner-editor-{index}" bind:this={dialog}></dialog>

<style>
  dialog {
    width: 80vw;
  }
</style>
