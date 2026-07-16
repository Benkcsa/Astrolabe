<script lang="ts">
  import { starSystem, starship } from '../../stores/campaign';
  import { resolveImageUrl } from '../../stores/images';
  import { IMAGE_DND_TYPE } from '../util/dnd';

  let mode: 'edit' | 'move' = 'move';
  let selectedHex: number | null = null;

  const SIZE = 40;
  const HH = Math.sqrt(3) * SIZE; // flat-top hex height

  type Cell = {
    n: number;
    star: boolean;
    q: number;
    r: number;
    cx: number;
    cy: number;
    points: string;
  };

  // Numbering matches the Astroprisma star-system sheet: per column, top to bottom.
  const COLS: { c: number; cells: { y: number; n: number }[] }[] = [
    { c: -3, cells: [{ y: -1.5, n: 33 }, { y: -0.5, n: 32 }, { y: 0.5, n: 31 }, { y: 1.5, n: 30 }] },
    { c: -2, cells: [{ y: -2, n: 34 }, { y: -1, n: 16 }, { y: 0, n: 15 }, { y: 1, n: 14 }, { y: 2, n: 29 }] },
    { c: -1, cells: [{ y: -2.5, n: 35 }, { y: -1.5, n: 17 }, { y: -0.5, n: 5 }, { y: 0.5, n: 4 }, { y: 1.5, n: 13 }, { y: 2.5, n: 28 }] },
    { c: 0, cells: [{ y: -3, n: 36 }, { y: -2, n: 18 }, { y: -1, n: 6 }, { y: 0, n: 0 }, { y: 1, n: 3 }, { y: 2, n: 12 }, { y: 3, n: 27 }] },
    { c: 1, cells: [{ y: -2.5, n: 19 }, { y: -1.5, n: 7 }, { y: -0.5, n: 1 }, { y: 0.5, n: 2 }, { y: 1.5, n: 11 }, { y: 2.5, n: 26 }] },
    { c: 2, cells: [{ y: -2, n: 20 }, { y: -1, n: 8 }, { y: 0, n: 9 }, { y: 1, n: 10 }, { y: 2, n: 25 }] },
    { c: 3, cells: [{ y: -1.5, n: 21 }, { y: -0.5, n: 22 }, { y: 0.5, n: 23 }, { y: 1.5, n: 24 }] }
  ];

  const axial = new Map<number, [number, number]>();

  function hexPoints(cx: number, cy: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i);
      pts.push(
        `${(cx + SIZE * Math.cos(a)).toFixed(2)},${(cy + SIZE * Math.sin(a)).toFixed(2)}`
      );
    }
    return pts.join(' ');
  }

  function build() {
    const cells: Cell[] = [];
    for (const col of COLS) {
      for (const cell of col.cells) {
        const cx = 1.5 * SIZE * col.c;
        const cy = HH * cell.y;
        const q = col.c;
        const r = cell.y - col.c / 2;
        axial.set(cell.n, [q, r]);
        cells.push({
          n: cell.n,
          star: cell.n === 0,
          q,
          r,
          cx,
          cy,
          points: hexPoints(cx, cy)
        });
      }
    }
    const xs = cells.map((c) => c.cx);
    const ys = cells.map((c) => c.cy);
    const pad = SIZE + 6;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
    const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
    return { cells, viewBox: `${minX} ${minY} ${w} ${h}` };
  }

  const { cells, viewBox } = build();

  // Reactive mirrors so the SVG re-renders on every starMap change.
  $: hexes = $starSystem.starMap.hexes;
  $: markIndex = $starSystem.starMap.markIndex;

  function hexOf(n: number) {
    return hexes[n];
  }

  function distance(a: number, b: number): number {
    const [q1, r1] = axial.get(a)!;
    const [q2, r2] = axial.get(b)!;
    const dq = q1 - q2;
    const dr = r1 - r2;
    return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
  }

  function setHex(n: number, patch: Partial<{ imageId: string | null; text: string }>) {
    const hexes = {
      ...$starSystem.starMap.hexes,
      [n]: { ...$starSystem.starMap.hexes[n], ...patch }
    };
    $starSystem = { ...$starSystem, starMap: { ...$starSystem.starMap, hexes } };
  }

  function travel(n: number) {
    const prev = $starSystem.starMap.markIndex;
    if (prev === n) return;
    if (prev !== null) {
      const d = distance(prev, n);
      $starship.fuel = Math.max(0, $starship.fuel - d);
    }
    $starSystem = { ...$starSystem, starMap: { ...$starSystem.starMap, markIndex: n } };
  }

  function onClick(n: number) {
    if (mode === 'edit') selectedHex = n;
    else travel(n);
  }

  function onContext(e: MouseEvent, n: number) {
    e.preventDefault();
    if (mode === 'edit') {
      // Right-click in edit removes only the image.
      setHex(n, { imageId: null });
    } else {
      // Right-click in move shows that hex's text entry.
      selectedHex = n;
    }
  }

  function onDrop(e: DragEvent, n: number) {
    if (mode !== 'edit') return;
    e.preventDefault();
    const id = e.dataTransfer?.getData(IMAGE_DND_TYPE);
    if (id) {
      setHex(n, { imageId: id });
      selectedHex = n;
    }
  }

  function onDragOver(e: DragEvent) {
    if (mode === 'edit' && e.dataTransfer?.types.includes(IMAGE_DND_TYPE)) e.preventDefault();
  }

  function onTextChange(e: Event) {
    if (selectedHex === null) return;
    setHex(selectedHex, { text: (e.target as HTMLTextAreaElement).value });
  }

  function clearMap() {
    if (!confirm('Clear the entire star system map? This deletes all images and text entries.'))
      return;
    const hexes: Record<number, { imageId: string | null; text: string }> = {};
    for (let i = 1; i <= 36; i++) hexes[i] = { imageId: null, text: '' };
    selectedHex = null;
    $starSystem = { ...$starSystem, starMap: { hexes, markIndex: null } };
  }
</script>

<div class="starmap sheet">
  <div class="head">
    <span class="title">Star System</span>
    <div class="modes">
      <button class:active={mode === 'edit'} on:click={() => (mode = 'edit')}>Edit</button>
      <button class:active={mode === 'move'} on:click={() => (mode = 'move')}>Move</button>
      <button class="clear" on:click={clearMap}>Clear</button>
    </div>
  </div>

  <div class="board">
    <svg {viewBox} preserveAspectRatio="xMidYMid meet">
      <defs>
        {#each cells as cell}
          {#if !cell.star}
            <clipPath id="clip-{cell.n}"><polygon points={cell.points} /></clipPath>
          {/if}
        {/each}
      </defs>
      {#each cells as cell (cell.star ? 'star' : cell.n)}
        {#if cell.star}
          <polygon points={cell.points} class="hex-star" />
          <text
            x={cell.cx}
            y={cell.cy}
            class="starlbl"
            dominant-baseline="central"
            text-anchor="middle">STAR</text
          >
        {:else}
          <polygon
            points={cell.points}
            class="hex-base"
            class:mark={markIndex === cell.n}
            class:sel={selectedHex === cell.n}
          />
          {#key hexes[cell.n].imageId}
            {#await resolveImageUrl(hexes[cell.n].imageId) then url}
              {#if url}
                <image
                  href={url}
                  x={cell.cx - SIZE}
                  y={cell.cy - HH / 2}
                  width={SIZE * 2}
                  height={HH}
                  preserveAspectRatio="xMidYMid slice"
                  clip-path="url(#clip-{cell.n})"
                />
              {/if}
            {/await}
          {/key}
          {#if hexes[cell.n].text}
            <circle cx={cell.cx - SIZE * 0.55} cy={cell.cy - SIZE * 0.5} r="4" class="dot" />
          {/if}
          <polygon
            points={cell.points}
            class="hex-hit"
            class:editmode={mode === 'edit'}
            role="button"
            tabindex="-1"
            on:click={() => onClick(cell.n)}
            on:contextmenu={(e) => onContext(e, cell.n)}
            on:drop={(e) => onDrop(e, cell.n)}
            on:dragover={onDragOver}
          />
        {/if}
      {/each}

      <!-- Numbers drawn last so neighbouring hexes never cover them. -->
      {#each cells as cell (cell.star ? 'starnum' : `n${cell.n}`)}
        {#if !cell.star}
          <text
            x={cell.cx + SIZE * 0.42}
            y={cell.cy - SIZE * 0.48}
            class="hexnum"
            text-anchor="middle">{cell.n}</text
          >
        {/if}
      {/each}
    </svg>
  </div>

  <div class="hexbox">
    {#if selectedHex === null}
      <span class="hexbox-empty">
        {mode === 'edit'
          ? 'Click a hex to edit its text. Drop images from Files.'
          : 'Right-click a hex to view its text. Click to travel.'}
      </span>
    {:else}
      <div class="hexbox-head">Hex {selectedHex}</div>
      <textarea
        class="hexbox-text"
        placeholder="Notes for this hex..."
        value={hexes[selectedHex].text}
        on:input={onTextChange}
      ></textarea>
    {/if}
  </div>
</div>

<style>
  .starmap {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  .title {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: 0.05em;
  }
  .modes button {
    border: 1px solid var(--field-border);
    background: var(--field-bg);
    color: var(--c-cream);
    border-radius: var(--radius-sm);
    padding: 4px 10px;
    font-family: var(--font-heading);
    font-size: 15px;
  }
  .modes button.active {
    background: var(--c-maroon);
    color: var(--c-cream);
  }
  .modes .clear:hover {
    background: var(--danger);
    color: #fff;
  }
  .board {
    width: 100%;
    max-width: 560px;
    height: 360px;
    min-height: 200px;
    resize: vertical;
    overflow: hidden;
    margin: 0 auto;
  }
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .hex-star {
    fill: var(--c-ink);
  }
  .starlbl {
    fill: var(--c-cream);
    font-family: var(--font-serif);
    font-size: 16px;
  }
  .hex-base {
    fill: #3a2c52;
    stroke: var(--accent);
    stroke-width: 1.2;
  }
  .hex-base.mark {
    stroke: var(--c-amber);
    stroke-width: 4;
  }
  .hex-base.sel {
    fill: var(--c-teal);
  }
  .hexnum {
    fill: var(--c-cream);
    font-family: var(--font-mono);
    font-size: 12px;
    opacity: 0.7;
    pointer-events: none;
  }
  .dot {
    fill: var(--accent);
  }
  .hex-hit {
    fill: transparent;
    cursor: pointer;
  }
  .hex-hit.editmode {
    cursor: copy;
  }
  .hexbox {
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    padding: 6px;
    background: var(--field-bg);
  }
  .hexbox-empty {
    font-size: 12px;
    opacity: 0.7;
  }
  .hexbox-head {
    font-family: var(--font-heading);
    text-transform: uppercase;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .hexbox-text {
    width: 100%;
    min-height: 60px;
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    background: var(--field-bg);
    color: var(--field-text);
    font-family: var(--font-sheet);
    font-size: 14px;
    padding: 6px;
    resize: vertical;
  }
</style>
