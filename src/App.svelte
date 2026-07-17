<script lang="ts">
  import { onMount } from 'svelte';
  import PaneManager from './lib/layout/PaneManager.svelte';
  import {
    initApp,
    ready,
    campaigns,
    activeCampaignId,
    selectCampaign,
    createCampaign,
    renameCampaign,
    removeCampaign,
    layout
  } from './stores/campaign';
  import { refreshImages } from './stores/images';
  import { exportActiveCampaign, importCampaignFromFile } from './lib/util/backup';
  import Credits from './lib/components/Credits.svelte';

  let importInput: HTMLInputElement;
  let showCredits = false;

  onMount(async () => {
    await initApp();
    await refreshImages();
  });

  async function onSelectCampaign(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    await selectCampaign(id);
    await refreshImages();
  }

  async function onNewCampaign() {
    const name = prompt('New campaign name:', 'New Campaign');
    if (name === null) return;
    await createCampaign(name.trim() || 'New Campaign');
    await refreshImages();
  }

  async function onRenameCampaign() {
    const id = $activeCampaignId;
    if (!id) return;
    const current = $campaigns.find((c) => c.id === id);
    const name = prompt('Rename campaign:', current?.name ?? '');
    if (name === null) return;
    await renameCampaign(id, name.trim() || current?.name || 'Campaign');
  }

  async function onDeleteCampaign() {
    const id = $activeCampaignId;
    if (!id) return;
    const current = $campaigns.find((c) => c.id === id);
    if (!confirm(`Delete campaign "${current?.name}"? This removes its sheets and images.`)) return;
    await removeCampaign(id);
    await refreshImages();
  }

  const paneCounts: (1 | 2 | 4)[] = [1, 2, 4];

  function setPaneCount(n: 1 | 2 | 4) {
    $layout.paneCount = n;
    $layout = $layout;
  }

  async function onImportFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      await importCampaignFromFile(file);
      await refreshImages();
    } catch (err) {
      alert((err as Error).message);
    }
    input.value = '';
  }
</script>

<header class="topbar">
  <div class="side left">
    <div class="group">
      <span class="cap">Campaign</span>
      <select value={$activeCampaignId} on:change={onSelectCampaign}>
        {#each $campaigns as c}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
      <button class="tb" on:click={onNewCampaign} title="New campaign">New</button>
      <button class="tb" on:click={onRenameCampaign} title="Rename campaign">Rename</button>
      <button class="tb danger" on:click={onDeleteCampaign} title="Delete campaign">Delete</button>
    </div>
  </div>

  <div class="brand"><span class="first-a">A</span>STROLABE</div>

  <div class="side right">
    <div class="group">
      <span class="cap">Panes</span>
      {#each paneCounts as n}
        <button class="tb" class:active={$layout.paneCount === n} on:click={() => setPaneCount(n)}>
          {n}
        </button>
      {/each}
    </div>

    <div class="group">
      <button class="tb" on:click={exportActiveCampaign} title="Export campaign (text only)">Export</button>
      <button class="tb" on:click={() => importInput.click()} title="Import campaign">Import</button>
      <button class="tb" on:click={() => (showCredits = true)} title="Credits & licenses">Credits</button>
      <input
        bind:this={importInput}
        type="file"
        accept="application/json"
        style="display:none"
        on:change={onImportFile}
      />
    </div>
  </div>
</header>

{#if showCredits}
  <Credits on:close={() => (showCredits = false)} />
{/if}

{#if $ready}
  <PaneManager />
{:else}
  <div class="loading">Loading...</div>
{/if}

<style>
  .topbar {
    height: var(--topbar-h);
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 12px;
    background: var(--accent-2);
    color: var(--c-cream);
    border-bottom: 2px solid var(--c-ink);
    flex-shrink: 0;
  }
  .brand {
    font-family: var(--font-display);
    font-size: 30px;
    letter-spacing: 0.06em;
    color: var(--c-amber);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .brand .first-a {
    font-style: italic;
  }
  .side {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }
  .side.left {
    justify-content: flex-start;
  }
  .side.right {
    justify-content: flex-end;
  }
  .group {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .cap {
    font-family: 'Genesys', var(--font-heading);
    font-size: 18px;
    letter-spacing: 0.03em;
    opacity: 0.9;
  }
  select {
    background: var(--bg-panel);
    color: var(--c-cream);
    border: 1px solid var(--c-ink);
    border-radius: var(--radius-sm);
    padding: 3px 6px;
    max-width: 180px;
  }
  .tb {
    background: var(--bg-panel);
    color: var(--c-cream);
    border: 1px solid var(--c-ink);
    border-radius: var(--radius-sm);
    padding: 5px 12px;
    font-family: var(--font-heading);
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .tb:hover {
    background: var(--c-ink);
  }
  .tb.active {
    background: var(--c-amber);
    color: var(--c-ink);
  }
  .tb.danger:hover {
    background: var(--danger);
  }
  .loading {
    display: grid;
    place-items: center;
    flex: 1;
    font-family: var(--font-mono);
  }
</style>
