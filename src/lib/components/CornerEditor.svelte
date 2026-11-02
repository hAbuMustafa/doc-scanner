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
  };

  let { image, canvas }: PropsT = $props();

  let editor: CornerEditor;

  let dialog: HTMLDialogElement;

  onMount(async () => {
    const detection = await scanDocument(image, { mode: "detect" });

    editor = createCornerEditor({
      container: dialog,
      image,
      corners: detection.corners || undefined,
      onConfirm: async (corners) => {
        const extracted = await extractDocument(image, corners, {
          output: "canvas",
        });
        canvas = extracted.output as HTMLCanvasElement;
        editor.destroy();
        dialog.close();
      },
    });
  });

  onDestroy(() => {
    editor.destroy();
  });
</script>

<dialog id="corner-editor" bind:this={dialog}></dialog>
