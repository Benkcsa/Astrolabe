<script lang="ts">
  export let value: number;
  export let label = '';
  export let min: number | null = 0;
  export let max: number | null = null;
  export let step = 1;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let width: number | null = null;

  function clamp(n: number): number {
    if (Number.isNaN(n)) n = 0;
    if (min !== null && n < min) n = min;
    if (max !== null && n > max) n = max;
    return n;
  }

  function bump(dir: number) {
    value = clamp(value + dir * step);
  }

  function onInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value.replace(/[^\d-]/g, '');
    value = clamp(raw === '' || raw === '-' ? 0 : parseInt(raw, 10));
  }
</script>

<div class="numfield {size}">
  {#if label}<span class="nf-label">{label}</span>{/if}
  <div class="nf-controls">
    <button type="button" class="nf-btn" on:click={() => bump(-1)} aria-label="decrease">-</button>
    <input
      class="nf-input"
      type="text"
      inputmode="numeric"
      style={width ? `width:${width}px` : ''}
      value={value}
      on:input={onInput}
    />
    <button type="button" class="nf-btn" on:click={() => bump(1)} aria-label="increase">+</button>
  </div>
</div>

<style>
  .numfield {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
  }
  .nf-label {
    font-family: var(--font-heading);
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1;
  }
  .nf-controls {
    display: inline-flex;
    align-items: stretch;
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--field-bg);
  }
  .nf-btn {
    border: none;
    background: var(--accent-2);
    color: var(--c-cream);
    width: 22px;
    font-size: 15px;
    line-height: 1;
    display: grid;
    place-items: center;
  }
  .nf-btn:hover {
    background: var(--accent);
  }
  .nf-input {
    border: none;
    text-align: center;
    width: 42px;
    background: transparent;
    color: var(--field-text);
    font-family: 'Genesys', var(--font-sheet);
    font-weight: 700;
    line-height: 1.55;
    padding: 5px 2px;
    box-sizing: border-box;
  }
  .nf-input:focus {
    outline: none;
    background: #ffffff18;
  }
  .sm .nf-input {
    width: 32px;
    font-size: 13px;
    line-height: 1.65;
    padding: 5px 2px;
  }
  .sm .nf-btn {
    width: 18px;
    font-size: 13px;
  }
  .lg .nf-input {
    width: 58px;
    font-size: 20px;
    padding: 4px 0;
  }
  .lg .nf-btn {
    width: 28px;
    font-size: 18px;
  }
</style>
