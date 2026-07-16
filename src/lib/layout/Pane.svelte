<script lang="ts">
  import { TABS, tabById } from './tabs';
  import type { TabId } from '../../db/types';
  import { layout } from '../../stores/campaign';

  export let index: number;

  $: currentId = $layout.panes[index];
  $: tab = tabById(currentId);

  function select(id: TabId) {
    $layout.panes[index] = id;
    $layout = $layout;
  }
</script>

<section class="pane">
  <header class="pane-tabs">
    {#each TABS as t}
      <button
        class="pane-tab"
        class:active={t.id === currentId}
        on:click={() => select(t.id)}
      >
        {t.label}
      </button>
    {/each}
  </header>
  <div class="pane-body">
    <svelte:component this={tab.component} />
  </div>
</section>

<style>
  .pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    min-height: 0;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .pane-tabs {
    display: flex;
    gap: 2px;
    padding: 4px 4px 0;
    background: var(--bg-elevated);
    flex-wrap: wrap;
  }
  .pane-tab {
    border: none;
    background: transparent;
    color: var(--on-bg);
    padding: 6px 12px;
    font-family: var(--font-heading);
    font-size: 17px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    opacity: 0.6;
  }
  .pane-tab:hover {
    opacity: 1;
  }
  .pane-tab.active {
    background: var(--bg-panel);
    color: var(--c-amber);
    opacity: 1;
  }
  .pane-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 10px;
    container-type: inline-size;
  }
</style>
