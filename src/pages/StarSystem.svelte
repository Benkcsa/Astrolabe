<script lang="ts">
  import { starSystem, factions } from '../stores/campaign';
  import NumberField from '../lib/components/NumberField.svelte';
  import TextField from '../lib/components/TextField.svelte';
  import NetworkMap from '../lib/components/NetworkMap.svelte';
  import HexMap from '../lib/components/HexMap.svelte';
  import FactionIcon from '../lib/components/FactionIcon.svelte';
  import { uid } from '../db/defaults';

  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  function addQuest() {
    $starSystem.questLog = [...$starSystem.questLog, { id: uid(), text: '' }];
  }
  function removeQuest(id: string) {
    $starSystem.questLog = $starSystem.questLog.filter((q) => q.id !== id);
  }
</script>

<div class="ss">
  <HexMap />

  <div class="sheet block">
    <span class="label">Star System</span>
    <div class="sysrow">
      <div class="grow"><span class="cap">System Name</span><TextField big bind:value={$starSystem.systemName} /></div>
      <div class="grow"><span class="cap">System Type</span><TextField big bind:value={$starSystem.systemType} /></div>
    </div>
    <span class="cap">Faction Strength</span>
    <div class="factions">
      {#each $factions as f (f.id)}
        <div class="faction">
          <FactionIcon faction={f} size={40} />
          <NumberField size="md" bind:value={$starSystem.factionStrength[f.id]} />
        </div>
      {/each}
    </div>
  </div>

  <div class="grid2">
    <NetworkMap />

    <div class="sheet block">
      <div class="qhead">
        <span class="label">Quest Log</span>
        <button class="btn" on:click={addQuest}>+ Quest</button>
      </div>
      {#if $starSystem.questLog.length === 0}
        <div class="empty">No quests yet.</div>
      {/if}
      {#each $starSystem.questLog as quest, i (quest.id)}
        <div class="quest">
          <span class="qn">{roman[i] ?? i + 1}</span>
          <TextField multiline rows={2} bind:value={quest.text} />
          <button class="del" on:click={() => removeQuest(quest.id)} title="Delete">x</button>
        </div>
      {/each}
    </div>
  </div>

  <div class="sheet block">
    <span class="label">Campaign</span>
    <div class="campaign">
      {#each $starSystem.campaign as slot, i}
        <div class="cslot">
          <span class="croman">{roman[i]}</span>
          <span class="cap">Bases</span>
          <TextField multiline rows={2} bind:value={slot.bases} />
          <span class="cap">Outcome</span>
          <TextField multiline rows={2} bind:value={slot.outcome} />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .ss {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: start;
  }
  .block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .sysrow,
  .qhead {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .qhead {
    justify-content: space-between;
  }
  .grow {
    flex: 1;
  }
  .cap {
    font-family: var(--font-heading);
    font-size: 16px;
    text-transform: uppercase;
    opacity: 0.8;
  }
  .factions {
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }
  .faction {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .btn {
    background: var(--c-green-2);
    color: var(--c-ink);
    border: none;
    border-radius: var(--radius-sm);
    padding: 5px 12px;
    font-family: var(--font-heading);
    font-size: 16px;
  }
  .quest {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 6px;
    align-items: start;
    margin-top: 4px;
  }
  .qn {
    font-family: var(--font-display);
    font-size: 18px;
    color: var(--accent);
  }
  .del {
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 1px 8px;
    height: fit-content;
    font-family: var(--font-heading);
    font-size: 18px;
    line-height: 1;
  }
  .empty {
    opacity: 0.6;
    font-size: 12px;
  }
  .campaign {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .cslot {
    display: flex;
    flex-direction: column;
    gap: 3px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    padding: 6px;
  }
  .croman {
    font-family: var(--font-display);
    font-size: 18px;
    text-align: center;
  }
  @container (max-width: 700px) {
    .grid2 {
      grid-template-columns: 1fr;
    }
    .campaign {
      grid-template-columns: 1fr;
    }
  }
</style>
