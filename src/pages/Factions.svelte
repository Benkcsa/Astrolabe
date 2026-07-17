<script lang="ts">
  import { factions, addFaction, removeFaction } from '../stores/campaign';
  import FactionIcon from '../lib/components/FactionIcon.svelte';
  import TextField from '../lib/components/TextField.svelte';
</script>

<div class="factions-tab">
  <div class="fh">
    <span class="label">Factions</span>
    <button class="addbtn" on:click={addFaction}>+ Faction</button>
  </div>

  <div class="grid">
    {#each $factions as f, i (f.id)}
      <div class="fcard sheet">
        <FactionIcon faction={f} size={88} />
        <TextField sans align="center" placeholder="Name" bind:value={$factions[i].name} />
        <button class="xbtn" on:click={() => removeFaction(f.id)} title="Remove faction">X</button>
      </div>
    {/each}
    {#if $factions.length === 0}
      <div class="empty">No factions. Add one.</div>
    {/if}
  </div>

  <div class="hint">
    Drop an image from Files onto a faction, right-click to clear it. The first 3 letters show
    when no image is set. Faction trackers on the Character and Star System sheets update to match.
  </div>
</div>

<style>
  .factions-tab {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: var(--on-bg);
  }
  .fh {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .addbtn {
    background: var(--c-green-2);
    color: var(--c-ink);
    border: none;
    border-radius: var(--radius-sm);
    padding: 5px 12px;
    font-family: var(--font-heading);
    font-size: 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .fcard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 10px;
  }
  .xbtn {
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 3px 12px;
    font-family: var(--font-heading);
    font-size: 14px;
  }
  .empty {
    opacity: 0.6;
    font-size: 12px;
    padding: 10px;
  }
  .hint {
    font-size: 12px;
    opacity: 0.7;
  }
</style>
