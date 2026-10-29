<script lang="ts">
  import Image from "#lib/components/Image.svelte";
  import { Scanner } from "scanic";
  import { onMount } from "svelte";
  import Rotate from "#lib/components/Rotate.svelte";
  import Filters from "#lib/components/Filters.svelte";

  const scanner = new Scanner({ detector: "ml" });

  onMount(async () => {
    await scanner.initialize();
  });

  let selectedFiles: FileList | null = $state(null);

  let contrast = $state(2);
  let brightness = $state(2);
  let grayscale = $state(0);

  let rotation = $state(0);
</script>

<h1>Doc Scanner with <code>Scanic</code></h1>

<input
  type="file"
  multiple
  onchange={(e) =>
    (selectedFiles = (e.currentTarget as HTMLInputElement).files)}
/>

<div class="master-controls-wrapper">
  <Filters accentColor="red" bind:contrast bind:brightness bind:grayscale />

  <Rotate bind:angle={rotation} />
</div>

{#each selectedFiles as file (file.name)}
  <Image {file} {scanner} {contrast} {brightness} {grayscale} {rotation} />
{/each}
