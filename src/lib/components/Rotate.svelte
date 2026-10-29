<script lang="ts">
  import FlipRight from "@lucide/svelte/icons/corner-right-down";
  import FlipLeft from "@lucide/svelte/icons/corner-left-down";

  let { angle = $bindable(0) } = $props();
</script>

<div class="rotation">
  <button
    onclick={() => (angle -= angle === 0 ? -270 : 90)}
    title="rotate left"
  >
    <FlipLeft />
  </button>

  <button
    onclick={() => (angle += angle === 270 ? -270 : 90)}
    title="rotate rightt"
  >
    <FlipRight />
  </button>
</div>

<style>
  .rotation {
    padding: 1rem;
    display: flex;
    justify-content: space-around;

    button {
      background: #eee;
      border: none;
      border-radius: 8px;
      padding: 4px 8px;

      &:hover,
      &:focus {
        background-color: lightgray;
      }
    }
  }
</style>
