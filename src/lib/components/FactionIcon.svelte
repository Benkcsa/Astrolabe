<script lang="ts">
  import { resolveImageUrl } from '../../stores/images';
  import { setFactionImage } from '../../stores/campaign';
  import { IMAGE_DND_TYPE } from '../util/dnd';
  import type { FactionDef } from '../../db/types';

  export let faction: FactionDef;
  export let size = 40;

  let url: string | null = null;
  let dragOver = false;

  $: void load(faction.imageId);
  async function load(id: string | null) {
    url = await resolveImageUrl(id);
  }

  $: letters = faction.name.slice(0, 3).toUpperCase();

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const id = e.dataTransfer?.getData(IMAGE_DND_TYPE);
    if (id) setFactionImage(faction.id, id);
  }
  function onDragOver(e: DragEvent) {
    if (e.dataTransfer?.types.includes(IMAGE_DND_TYPE)) {
      e.preventDefault();
      dragOver = true;
    }
  }
  function onContext(e: MouseEvent) {
    e.preventDefault();
    setFactionImage(faction.id, null);
  }
</script>

<div
  class="ficon"
  class:drag={dragOver}
  style="width:{size}px;height:{size}px"
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:dragleave={() => (dragOver = false)}
  on:contextmenu={onContext}
  role="button"
  tabindex="-1"
  title="{faction.name} - drop an image, right-click to clear"
>
  {#if url}
    <img src={url} alt={faction.name} />
  {:else}
    <span class="letters">{letters}</span>
  {/if}
</div>

<style>
  .ficon {
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background: var(--field-bg);
    border: 1px solid var(--field-border);
    cursor: pointer;
  }
  .ficon.drag {
    border-color: var(--accent);
    background: var(--accent-2);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .letters {
    font-family: var(--font-heading);
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--on-surface);
    text-align: center;
    line-height: 1;
  }
</style>
