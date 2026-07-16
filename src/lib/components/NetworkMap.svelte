<script lang="ts">
  import { starSystem } from '../../stores/campaign';
  import type { TileBg } from '../../db/types';

  let mode: 'edit' | 'move' = 'move';

  // 10 tiles as square columns (2,3,3,2 with the last two starting a row lower),
  // then the whole cluster is rotated 45° so the squares read as diamonds.
  const positions = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 2 },
    { x: 3, y: 3 }
  ];

  function cycleTile(i: number) {
    if (mode !== 'edit') return;
    const tiles = [...$starSystem.network.tiles];
    tiles[i] = ((tiles[i] + 1) % 3) as TileBg;
    $starSystem = { ...$starSystem, network: { ...$starSystem.network, tiles } };
  }

  function moveTo(i: number) {
    if (mode !== 'move') return;
    if ($starSystem.network.markIndex === i) return;
    const net = { ...$starSystem.network, markIndex: i };
    // Advance memory clock when moving to a new tile.
    if (net.clockTicks < net.clockMax) net.clockTicks += 1;
    $starSystem = { ...$starSystem, network: net };
  }

  function bumpClock(d: number) {
    const clockTicks = Math.max(
      0,
      Math.min($starSystem.network.clockMax, $starSystem.network.clockTicks + d)
    );
    $starSystem = { ...$starSystem, network: { ...$starSystem.network, clockTicks } };
  }

  function clearMap() {
    if (!confirm('Clear the entire network map? This cannot be undone.')) return;
    $starSystem = {
      ...$starSystem,
      network: {
        ...$starSystem.network,
        tiles: $starSystem.network.tiles.map(() => 0 as TileBg),
        markIndex: null,
        clockTicks: 0
      }
    };
  }
</script>

<div class="netmap sheet">
  <div class="head">
    <span class="title">Network Map</span>
    <div class="modes">
      <button class:active={mode === 'edit'} on:click={() => (mode = 'edit')}>Edit</button>
      <button class:active={mode === 'move'} on:click={() => (mode = 'move')}>Move</button>
    </div>
  </div>

  <div class="clock">
    <span class="clocklbl">Memory Clock</span>
    <button class="cbtn" on:click={() => bumpClock(-1)}>-</button>
    <div class="ticks">
      {#each Array($starSystem.network.clockMax) as _, i}
        <span class="tick" class:on={i < $starSystem.network.clockTicks}></span>
      {/each}
    </div>
    <button class="cbtn" on:click={() => bumpClock(1)}>+</button>
    <span class="ccount">{$starSystem.network.clockTicks}/{$starSystem.network.clockMax}</span>
  </div>

  <div class="gridwrap">
    <div class="grid">
      {#each $starSystem.network.tiles as bg, i}
        <div
          class="diamond bg{bg}"
          class:mark={$starSystem.network.markIndex === i}
          style="grid-column: {positions[i].x + 1}; grid-row: {positions[i].y + 1};"
          on:click={() => (mode === 'edit' ? cycleTile(i) : moveTo(i))}
          role="button"
          tabindex="0"
          title={mode === 'edit' ? 'Click to cycle background' : 'Click to move here'}
        ></div>
      {/each}
    </div>
  </div>

  <div class="foot">
    <button class="clear" on:click={clearMap}>Clear map</button>
    <span class="hint">
      {mode === 'edit' ? 'Click tiles to cycle 3 backgrounds.' : 'Click a new tile to advance the clock.'}
    </span>
  </div>
</div>

<style>
  .netmap {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: 20px;
    letter-spacing: 0.04em;
  }
  .modes button,
  .clear,
  .cbtn {
    border: 1px solid var(--field-border);
    background: var(--field-bg);
    color: var(--c-cream);
    border-radius: var(--radius-sm);
    padding: 4px 9px;
    font-family: var(--font-heading);
    font-size: 15px;
  }
  .modes button.active {
    background: var(--c-maroon);
    color: var(--c-cream);
  }
  .clocklbl {
    font-family: var(--font-heading);
    text-transform: uppercase;
    font-size: 14px;
    white-space: nowrap;
  }
  .clock {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ticks {
    display: flex;
    gap: 2px;
    flex: 1;
  }
  .tick {
    flex: 1;
    height: 12px;
    border: 1px solid var(--c-cream);
    background: transparent;
  }
  .tick.on {
    background: var(--c-cream);
  }
  .ccount {
    font-family: var(--font-mono);
    font-size: 14px;
  }
  .gridwrap {
    display: grid;
    place-items: center;
    padding: 10px;
    background: var(--c-ink);
    border-radius: var(--radius-sm);
    height: 230px;
    overflow: hidden;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 30px);
    grid-template-rows: repeat(4, 30px);
    gap: 3px;
    transform: rotate(-45deg);
  }
  .diamond {
    width: 30px;
    height: 30px;
    border: 2px solid var(--c-teal);
    cursor: pointer;
  }
  .diamond.bg0 {
    background: transparent;
  }
  .diamond.bg1 {
    background: repeating-linear-gradient(
      135deg,
      var(--c-teal) 0,
      var(--c-teal) 2px,
      transparent 2px,
      transparent 5px
    );
  }
  .diamond.bg2 {
    background: var(--c-teal);
  }
  .diamond.mark {
    outline: 3px solid var(--c-amber);
    outline-offset: 1px;
  }
  .foot {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hint {
    font-size: 11px;
    opacity: 0.7;
  }
</style>
