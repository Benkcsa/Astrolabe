<script lang="ts">
  import { images, uploadImages, deleteImage, setImageCategory, resolveImageUrl } from '../stores/images';
  import { imageCategories } from '../stores/campaign';
  import { IMAGE_DND_TYPE } from '../lib/util/dnd';
  import type { StoredImage } from '../db/types';

  let fileInput: HTMLInputElement;
  let uploadCategory = 'Uncategorized';
  let filter = 'All';
  let dragOver = false;

  $: cats = $imageCategories;
  $: filtered =
    filter === 'All' ? $images : $images.filter((i) => i.category === filter);

  async function onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) await uploadImages(input.files, uploadCategory);
    input.value = '';
  }

  async function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    if (e.dataTransfer?.files?.length) await uploadImages(e.dataTransfer.files, uploadCategory);
  }

  function addCategory() {
    const name = prompt('New category name:');
    if (!name) return;
    if (!$imageCategories.includes(name)) {
      $imageCategories = [...$imageCategories, name];
    }
    uploadCategory = name;
  }

  async function removeCategory() {
    const target = filter !== 'All' ? filter : uploadCategory;
    if (target === 'Uncategorized') {
      alert('The "Uncategorized" category cannot be removed.');
      return;
    }
    if (!$imageCategories.includes(target)) return;
    if (!confirm(`Remove category "${target}"? Its images move to Uncategorized.`)) return;
    // Reassign any images in this category.
    for (const img of $images.filter((i) => i.category === target)) {
      await setImageCategory(img.id, 'Uncategorized');
    }
    $imageCategories = $imageCategories.filter((c) => c !== target);
    if (uploadCategory === target) uploadCategory = 'Uncategorized';
    if (filter === target) filter = 'All';
  }

  function onDragStart(e: DragEvent, img: StoredImage) {
    e.dataTransfer?.setData(IMAGE_DND_TYPE, img.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
  }

  function onCatChange(id: string, e: Event) {
    setImageCategory(id, (e.target as HTMLSelectElement).value);
  }

  async function thumbUrl(id: string) {
    return (await resolveImageUrl(id)) ?? '';
  }
</script>

<div class="fm">
  <div class="fm-toolbar">
    <button class="btn" on:click={() => fileInput.click()}>Upload</button>
    <input bind:this={fileInput} type="file" accept="image/*" multiple style="display:none" on:change={onFiles} />

    <label class="cap">Into</label>
    <select bind:value={uploadCategory}>
      {#each cats as c}<option value={c}>{c}</option>{/each}
    </select>
    <button class="btn ghost" on:click={addCategory}>+ Category</button>
    <button class="btn ghost" on:click={removeCategory}>- Category</button>

    <span class="spacer"></span>

    <label class="cap">Show</label>
    <select bind:value={filter}>
      <option value="All">All</option>
      {#each cats as c}<option value={c}>{c}</option>{/each}
    </select>
  </div>

  <div class="fm-hint">Tip: star system hexes fit 700 x 608 px images best.</div>
  <div class="fm-hint">Everything is stored locally in your browser.</div>

  <div
    class="fm-grid"
    class:drag={dragOver}
    on:drop={onDrop}
    on:dragover|preventDefault={() => (dragOver = true)}
    on:dragleave={() => (dragOver = false)}
    role="list"
  >
    {#if filtered.length === 0}
      <div class="empty">Drop images here or use Upload. Drag a thumbnail onto a sheet field.</div>
    {/if}
    {#each filtered as img (img.id)}
      <figure class="card" draggable="true" on:dragstart={(e) => onDragStart(e, img)}>
        {#await thumbUrl(img.id) then url}
          <img src={url} alt={img.name} draggable="false" />
        {/await}
        <figcaption title={img.name}>{img.name}</figcaption>
        <div class="card-actions">
          <select value={img.category} on:change={(e) => onCatChange(img.id, e)}>
            {#each cats as c}<option value={c}>{c}</option>{/each}
          </select>
          <button class="del" title="Delete" on:click={() => deleteImage(img.id)}>Del</button>
        </div>
      </figure>
    {/each}
  </div>
</div>

<style>
  .fm {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
    color: var(--on-bg);
  }
  .fm-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .spacer {
    flex: 1;
  }
  .cap {
    font-size: 14px;
    text-transform: uppercase;
    opacity: 0.8;
  }
  .fm-hint {
    font-size: 12px;
    opacity: 0.65;
  }
  .btn {
    background: var(--c-amber);
    color: var(--c-ink);
    border: none;
    border-radius: var(--radius-sm);
    padding: 6px 13px;
    font-family: var(--font-heading);
    font-size: 15px;
  }
  .btn.ghost {
    background: var(--bg-elevated);
    color: var(--c-cream);
  }
  select {
    background: var(--bg-elevated);
    color: var(--c-cream);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 4px 6px;
    font-size: 14px;
  }
  .fm-grid {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
    align-content: start;
    align-items: start;
    border: 2px dashed transparent;
    border-radius: var(--radius);
    padding: 4px;
  }
  .fm-grid.drag {
    border-color: var(--accent);
    background: #ffffff11;
  }
  .empty {
    grid-column: 1 / -1;
    opacity: 0.6;
    text-align: center;
    padding: 30px 10px;
    font-size: 12px;
  }
  .card {
    margin: 0;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    cursor: grab;
    display: flex;
    flex-direction: column;
  }
  .card img {
    width: 100%;
    height: 96px;
    object-fit: cover;
    display: block;
  }
  figcaption {
    font-size: 10px;
    padding: 3px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .card-actions {
    display: flex;
    gap: 2px;
    padding: 0 3px 3px;
    flex-shrink: 0;
  }
  .card-actions select {
    flex: 1;
    font-size: 11px;
    min-width: 0;
  }
  .del {
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 2px 8px;
    font-size: 11px;
    flex-shrink: 0;
  }
</style>
