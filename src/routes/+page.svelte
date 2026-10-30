<script lang="ts">
  import SaveAll from "@lucide/svelte/icons/save-all";
  import ClearFiles from "@lucide/svelte/icons/trash";
  import Image from "#lib/components/Image.svelte";
  import { Scanner } from "scanic";
  import { onMount, setContext } from "svelte";
  import Rotate from "#lib/components/Rotate.svelte";
  import Filters from "#lib/components/Filters.svelte";
  import { canvasesToPdf } from "#lib/utils/canvases-to-pdf.ts";
  import { removeFileByFileName } from "#lib/utils/files.ts";
  import { dragHandleZone, type DndEvent } from "svelte-dnd-action";

  const scanner = new Scanner({
    detector: "ml",
    ml: { assetBaseUrl: "/scanic-ml/dist/" },
  });

  onMount(async () => {
    await scanner.initialize();
  });

  let selectedFiles: File[] = $state([]);

  let contrast = $state(2);
  let brightness = $state(2);
  let grayscale = $state(0);

  let rotation = $state(0);

  let fileInputElement: HTMLInputElement;

  setContext(
    "remove-file",
    (fileName: string) =>
      (selectedFiles = removeFileByFileName(fileInputElement, fileName)),
  );

  function handleSort(e: CustomEvent<DndEvent<File>>) {
    selectedFiles = Array.from(e.detail.items);
  }
</script>

<svelte:head>
  <title>PhotoScanner</title>
</svelte:head>

<h1>PhotoScanner</h1>

<input
  type="file"
  multiple
  accept="image/*"
  onchange={(e) => {
    const input = e.currentTarget as HTMLInputElement;
    const dt = new DataTransfer();
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        if (input.files[i].type.startsWith("image/")) {
          input.files[i].id = input.files[i].name;
          dt.items.add(input.files[i]);
        }
      }
      input.files = dt.files;
      selectedFiles = Array.from(input.files);
    }
  }}
  bind:this={fileInputElement}
/>

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
{/if}

<div class="master-controls-wrapper">
  <Filters
    accentColor="red"
    bind:contrast
    bind:brightness
    bind:grayscale
    disabled={!selectedFiles.length}
  />

  <Rotate bind:angle={rotation} disabled={!selectedFiles.length} />

  <button
    class="save-pdf icon-button"
    title="save all in a PDF file"
    onclick={canvasesToPdf}
    disabled={!selectedFiles.length}
  >
    <SaveAll size="2.5rem" />
  </button>
</div>

{#if selectedFiles.length}
  <div
    class="scans-wrapper"
    use:dragHandleZone={{ items: selectedFiles, flipDurationMs: 200 }}
    onconsider={handleSort}
    onfinalize={handleSort}
  >
    {#each selectedFiles as file, index (file.name)}
      <Image
        {file}
        {scanner}
        {contrast}
        {brightness}
        {grayscale}
        {rotation}
        {index}
      />
    {/each}
  </div>
{/if}

<style>
  .master-controls-wrapper {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
    gap: 10vw;

    border: 1px dashed gray;
    border-radius: 4px;
    padding: 1rem;
    margin-block: 1rem;

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
