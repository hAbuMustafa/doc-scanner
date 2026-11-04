<script lang="ts">
  import SaveAll from "@lucide/svelte/icons/save-all";
  import FlipRight from "@lucide/svelte/icons/iteration-cw";
  import FlipLeft from "@lucide/svelte/icons/iteration-ccw";
  import ClearFiles from "@lucide/svelte/icons/trash";
  import Image from "#lib/components/Image.svelte";
  import { onMount, setContext } from "svelte";
  import Filters from "#lib/components/Filters.svelte";
  import { canvasesToPdf } from "#lib/utils/canvases-to-pdf.ts";
  import { removeFileByFileName } from "#lib/utils/files.ts";
  import { Scanner } from "scanic";

  let selectedFiles: File[] = $state([]);

  let contrast = $state(2);
  let brightness = $state(2);
  let grayscale = $state(0);

  let flipRight = $state(false);
  let flipLeft = $state(false);

  let fileInputElement: HTMLInputElement;

  onMount(async () => {
    const scanner = new Scanner({
      detector: "ml",
    });
    await scanner.initialize();
  });

  setContext(
    "remove-file",
    (fileName: string) =>
      (selectedFiles = removeFileByFileName(fileInputElement, fileName)),
  );
</script>

<svelte:head>
  <title>PhotoScanner</title>
</svelte:head>

<h1>PhotoScanner</h1>

<input
  type="file"
  multiple
  accept="image/*"
  onchange={() => {
    let files = fileInputElement.files;
    const dt = new DataTransfer();
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) {
          files[i].id = files[i].name;
          dt.items.add(files[i]);
        }
      }
      files = dt.files;
      selectedFiles = Array.from(files);
    }
  }}
  bind:this={fileInputElement}
/>

{#if !selectedFiles.length}
  <div class="master-zone">Please Select your scan images to start editing</div>
{/if}

{#if selectedFiles.length}
  <button
    class="icon-button"
    onclick={() => {
      selectedFiles = [];
      fileInputElement.value = "";
    }}
  >
    <ClearFiles color="salmon" size="1rem" />
  </button>

  {#if selectedFiles.length > 1}
    <div class="master-controls-wrapper master-zone">
      <Filters accentColor="red" bind:contrast bind:brightness bind:grayscale />

      <div class="master-rotation-controls">
        <button
          class="flip icon-button"
          title="flip all images to the left by 90 degrees"
          onclick={() => {
            flipLeft = !flipLeft;
          }}
        >
          <FlipLeft size="2.5rem" />
        </button>

        <button
          class="flip icon-button"
          title="flip all images to the right by 90 degrees"
          onclick={() => {
            flipRight = !flipRight;
          }}
        >
          <FlipRight size="2.5rem" />
        </button>
      </div>

      <button
        class="save-pdf icon-button"
        title="save all in a PDF file"
        onclick={canvasesToPdf}
      >
        <SaveAll size="2.5rem" />
      </button>
    </div>
  {/if}

  <div class="scans-wrapper">
    {#each selectedFiles as file, index (file.name)}
      <Image
        {file}
        {contrast}
        {brightness}
        {grayscale}
        {flipRight}
        {flipLeft}
        {index}
      />
    {/each}
  </div>
{/if}

<style>
  .master-zone {
    border: 1px dashed gray;
    border-radius: 4px;
    padding: 1rem;
    margin-block: 1rem;
  }

  .master-controls-wrapper {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
    column-gap: 2rem;

    .master-rotation-controls {
      display: flex;
      justify-content: space-around;
    }

    button.save-pdf {
      &:hover,
      &:focus {
        color: darkblue;
      }
    }
  }

  .scans-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
</style>
