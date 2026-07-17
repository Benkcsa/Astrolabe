<script lang="ts">
  import Pane from './Pane.svelte';
  import { layout } from '../../stores/campaign';

  let container: HTMLDivElement;

  type DragKind = 'col2' | 'col3a' | 'col3b' | 'col4' | 'rowL' | 'rowR';
  let dragging: DragKind | null = null;

  function startDrag(kind: DragKind) {
    dragging = kind;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stopDrag);
  }

  function onMove(e: PointerEvent) {
    if (!dragging || !container) return;
    const rect = container.getBoundingClientRect();
    if (dragging === 'col2') {
      const pct = clamp(((e.clientX - rect.left) / rect.width) * 100);
      $layout.sizes2 = [pct, 100 - pct];
    } else if (dragging === 'col3a') {
      const pct = clamp(((e.clientX - rect.left) / rect.width) * 100);
      const [w0, w1, w2] = $layout.sizes3;
      const b2 = w0 + w1; // second boundary stays fixed
      const nw0 = Math.min(pct, b2 - 15);
      $layout.sizes3 = [nw0, b2 - nw0, w2];
    } else if (dragging === 'col3b') {
      const pct = clamp(((e.clientX - rect.left) / rect.width) * 100);
      const w0 = $layout.sizes3[0]; // first boundary stays fixed
      const b2 = Math.max(pct, w0 + 15);
      $layout.sizes3 = [w0, b2 - w0, 100 - b2];
    } else if (dragging === 'col4') {
      const pct = clamp(((e.clientX - rect.left) / rect.width) * 100);
      $layout.sizes4 = [pct, $layout.sizes4[1], $layout.sizes4[2]];
    } else if (dragging === 'rowL') {
      const pct = clamp(((e.clientY - rect.top) / rect.height) * 100);
      $layout.sizes4 = [$layout.sizes4[0], pct, $layout.sizes4[2]];
    } else if (dragging === 'rowR') {
      const pct = clamp(((e.clientY - rect.top) / rect.height) * 100);
      $layout.sizes4 = [$layout.sizes4[0], $layout.sizes4[1], pct];
    }
    $layout = $layout;
  }

  function stopDrag() {
    dragging = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', stopDrag);
  }

  function clamp(n: number): number {
    return Math.max(15, Math.min(85, n));
  }
</script>

<div class="pm" bind:this={container} class:dragging>
  {#if $layout.paneCount === 1}
    <Pane index={0} />
  {:else if $layout.paneCount === 2}
    <div class="row" style="grid-template-columns: {$layout.sizes2[0]}% 6px {$layout.sizes2[1]}%">
      <div class="cell" style="grid-column:1"><Pane index={0} /></div>
      <div class="split vert" style="grid-column:2" on:pointerdown={() => startDrag('col2')} role="separator" tabindex="-1"></div>
      <div class="cell" style="grid-column:3"><Pane index={1} /></div>
    </div>
  {:else if $layout.paneCount === 3}
    <div class="row" style="grid-template-columns: {$layout.sizes3[0]}% 6px {$layout.sizes3[1]}% 6px {$layout.sizes3[2]}%">
      <div class="cell" style="grid-column:1"><Pane index={0} /></div>
      <div class="split vert" style="grid-column:2" on:pointerdown={() => startDrag('col3a')} role="separator" tabindex="-1"></div>
      <div class="cell" style="grid-column:3"><Pane index={1} /></div>
      <div class="split vert" style="grid-column:4" on:pointerdown={() => startDrag('col3b')} role="separator" tabindex="-1"></div>
      <div class="cell" style="grid-column:5"><Pane index={2} /></div>
    </div>
  {:else}
    <div class="quad" style="grid-template-columns: {$layout.sizes4[0]}% 6px {100 - $layout.sizes4[0]}%">
      <div class="col4" style="grid-column:1">
        <div class="cell" style="flex-basis: {$layout.sizes4[1]}%"><Pane index={0} /></div>
        <div class="split horiz" on:pointerdown={() => startDrag('rowL')} role="separator" tabindex="-1"></div>
        <div class="cell" style="flex-basis: {100 - $layout.sizes4[1]}%"><Pane index={2} /></div>
      </div>

      <div class="split vert" style="grid-column:2" on:pointerdown={() => startDrag('col4')} role="separator" tabindex="-1"></div>

      <div class="col4" style="grid-column:3">
        <div class="cell" style="flex-basis: {$layout.sizes4[2]}%"><Pane index={1} /></div>
        <div class="split horiz" on:pointerdown={() => startDrag('rowR')} role="separator" tabindex="-1"></div>
        <div class="cell" style="flex-basis: {100 - $layout.sizes4[2]}%"><Pane index={3} /></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .pm {
    flex: 1;
    min-height: 0;
    padding: 8px;
  }
  .pm.dragging {
    user-select: none;
    cursor: grabbing;
  }
  .row,
  .quad {
    display: grid;
    height: 100%;
    gap: 0;
  }
  .col4 {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
  .cell {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    flex-grow: 0;
    flex-shrink: 1;
  }
  .split {
    background: transparent;
    flex: 0 0 auto;
  }
  .split.vert {
    width: 6px;
    cursor: col-resize;
  }
  .split.horiz {
    height: 6px;
    cursor: row-resize;
  }
  .split:hover {
    background: var(--accent-2);
  }
</style>
