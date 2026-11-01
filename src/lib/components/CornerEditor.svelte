<script lang="ts">
  import { createCornerEditor, extractDocument, scanDocument } from "scanic";
  import { onMount } from "svelte";

  type PropsT = {
    image: HTMLImageElement | HTMLCanvasElement | ImageData;
    canvas: HTMLCanvasElement;
  };

  let { image, canvas }: PropsT = $props();

  let dialog: HTMLDialogElement;

  onMount(async () => {
    const detection = await scanDocument(image, { mode: "detect" });

    const editor = createCornerEditor({
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
</script>

<dialog id="corner-editor" bind:this={dialog}></dialog>
