<script lang="ts">
  import { onDestroy } from 'svelte';
  import { resolveImageUrl } from '../../stores/images';
  import { IMAGE_DND_TYPE } from '../util/dnd';

  export let value: string | null;
  export let label = '';
  export let round = false;
  export let fit: 'cover' | 'contain' = 'cover';
  export let light = false;

  let url: string | null = null;
  let dragOver = false;

  $: void load(value);

  async function load(id: string | null) {
    url = await resolveImageUrl(id);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const id = e.dataTransfer?.getData(IMAGE_DND_TYPE);
    if (id) value = id;
  }

  function onDragOver(e: DragEvent) {
    if (e.dataTransfer?.types.includes(IMAGE_DND_TYPE)) {
      e.preventDefault();
      dragOver = true;
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    value = null;
  }

  onDestroy(() => {});
</script>

<div
  class="dropzone"
  class:round
  class:light
  class:drag={dragOver}
  role="button"
  tabindex="0"
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:dragleave={() => (dragOver = false)}
  on:contextmenu={onContextMenu}
  title="Drag an image here from the File Manager. Right-click to clear."
>
  {#if url}
    <img class={fit} src={url} alt={label || 'image'} />
  {:else}
    <span class="ph">{label || 'Drop image'}</span>
  {/if}
</div>

<style>
  .dropzone {
    width: 100%;
    height: 100%;
    min-height: 60px;
    border: 2px dashed var(--field-border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--field-bg);
    cursor: pointer;
  }
  .dropzone.round {
    border-radius: 50%;
  }
  .dropzone.drag {
    border-color: var(--accent);
    background: var(--accent-2);
  }
  .dropzone.light {
    background: var(--c-bone);
    border-color: var(--c-ink);
  }
  img {
    display: block;
    margin: auto;
  }
  img.cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  img.contain {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  .ph {
    font-family: var(--font-heading);
    font-size: 14px;
    text-transform: uppercase;
    color: var(--on-surface);
    opacity: 0.5;
    text-align: center;
    padding: 4px;
  }
  .dropzone.light .ph {
    color: var(--c-ink);
    opacity: 0.7;
  }
</style>
