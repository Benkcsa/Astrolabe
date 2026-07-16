<script lang="ts">
  import { starship } from '../stores/campaign';
  import NumberField from '../lib/components/NumberField.svelte';
  import TextField from '../lib/components/TextField.svelte';
  import ImageDropZone from '../lib/components/ImageDropZone.svelte';
  import { uid } from '../db/defaults';

  const crewStats: [string, 'vig' | 'gra' | 'min' | 'tec'][] = [
    ['Vig', 'vig'],
    ['Gra', 'gra'],
    ['Min', 'min'],
    ['Tec', 'tec']
  ];

  function addConnection() {
    $starship.connections = [
      ...$starship.connections,
      { id: uid(), name: '', location: '', data: '', ticks: [false, false, false] }
    ];
  }

  function toggleTick(connId: string, ti: number) {
    const c = $starship.connections.find((x) => x.id === connId);
    if (!c) return;
    c.ticks[ti] = !c.ticks[ti];
    $starship = $starship;
  }

  function removeConnection(id: string) {
    $starship.connections = $starship.connections.filter((c) => c.id !== id);
  }
</script>

<div class="ship">
  <!-- LEFT: control panel -->
  <div class="col">
    <div class="sheet block">
      <div class="row">
        <div class="sheet mini grow"><span class="label">Starship</span><TextField sans bind:value={$starship.starshipName} /></div>
        <div class="sheet mini grow"><span class="label">Crew</span><TextField sans bind:value={$starship.crewName} /></div>
      </div>
    </div>

    <div class="sheet block">
      <span class="label">Schematic</span>
      <div class="shipimg">
        <ImageDropZone label="Drop ship schematic" fit="contain" light bind:value={$starship.imageId} />
      </div>
    </div>

    <div class="sheet block">
      <div class="modules">
        <div class="mod"><span class="label">Control</span><TextField multiline bind:value={$starship.control} /></div>
        <div class="mod"><span class="label">Engine</span><TextField multiline bind:value={$starship.engine} /></div>
        <div class="mod"><span class="label">Modules</span><TextField multiline bind:value={$starship.modulesLeft} /></div>
        <div class="mod"><span class="label">Modules</span><TextField multiline bind:value={$starship.modulesRight} /></div>
      </div>
    </div>

    <div class="sheet block">
      <div class="row stats">
        <div class="stat"><span class="label">Hull</span><NumberField size="lg" bind:value={$starship.hull} /></div>
        <div class="stat"><span class="label">Shields</span><NumberField size="lg" bind:value={$starship.shields} /></div>
        <div class="stat"><span class="label">Fuel</span><NumberField size="lg" bind:value={$starship.fuel} /></div>
      </div>
    </div>

    <div class="sheet block">
      <span class="label">Cargo Hold</span>
      <div class="cargo">
        {#each $starship.cargo as _, i}
          <div class="line"><span class="ln">{i + 1}</span><TextField bind:value={$starship.cargo[i]} /></div>
        {/each}
      </div>
    </div>

    <div class="sheet block">
      <div class="conn-head">
        <span class="label">Connections</span>
        <button class="btn" on:click={addConnection}>+ Connection</button>
      </div>
      {#if $starship.connections.length === 0}
        <div class="empty">No connections. Add one.</div>
      {/if}
      {#each $starship.connections as conn (conn.id)}
        <div class="conn">
          <div class="conn-top">
            <TextField placeholder="Name" bind:value={conn.name} />
            <TextField placeholder="Location" bind:value={conn.location} />
            <div class="conn-ticks">
              {#each conn.ticks as t, ti}
                <button class="ctick" class:on={t} on:click={() => toggleTick(conn.id, ti)} aria-label="tick"></button>
              {/each}
            </div>
            <button class="del" on:click={() => removeConnection(conn.id)} title="Delete">x</button>
          </div>
          <TextField placeholder="Data" bind:value={conn.data} />
        </div>
      {/each}
    </div>
  </div>

  <!-- RIGHT: crew -->
  <div class="col">
    {#each $starship.crew as _, i}
      <div class="sheet member">
        <div class="member-head">
          <span class="cnum">{i + 1}</span>
          <TextField sans placeholder="Name" bind:value={$starship.crew[i].name} />
          <NumberField size="sm" label="HP" bind:value={$starship.crew[i].hp} />
          <NumberField size="sm" label="Armor" bind:value={$starship.crew[i].armor} />
        </div>
        <div class="row">
          <TextField sans placeholder="Role" bind:value={$starship.crew[i].role} />
          <TextField placeholder="Passive" bind:value={$starship.crew[i].passive} />
        </div>
        <div class="row cstats">
          {#each crewStats as [lbl, key]}
            <NumberField size="sm" label={lbl} bind:value={$starship.crew[i][key]} />
          {/each}
        </div>
        <div class="two">
          <div class="mini-col">
            <span class="cap">Inventory</span>
            {#each $starship.crew[i].inventory as _, j}
              <TextField bind:value={$starship.crew[i].inventory[j]} />
            {/each}
          </div>
          <div class="mini-col">
            <span class="cap">Skills</span>
            {#each $starship.crew[i].skills as _, j}
              <TextField placeholder={`Skill ${j + 1}`} bind:value={$starship.crew[i].skills[j]} />
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .ship {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: start;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .block,
  .mini {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mini {
    padding: 6px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .grow {
    flex: 1;
  }
  .shipimg {
    width: 100%;
    max-width: 560px;
    height: 360px;
    min-height: 200px;
    resize: vertical;
    overflow: hidden;
    margin: 0 auto;
    background: var(--c-bone);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
  }
  .modules {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .mod {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  .stats {
    justify-content: space-around;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .cargo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 10px;
  }
  .line {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ln {
    font-family: var(--font-mono);
    font-size: 11px;
    opacity: 0.7;
  }
  .member {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
  }
  .member-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cnum {
    font-family: var(--font-display);
    font-size: 20px;
    color: var(--accent);
  }
  .cstats {
    justify-content: space-between;
  }
  .two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .mini-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .cap {
    font-family: var(--font-heading);
    font-size: 14px;
    text-transform: uppercase;
    opacity: 0.75;
  }
  .conn-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .conn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
  }
  .conn-top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto auto;
    gap: 6px;
    align-items: center;
  }
  .conn-ticks {
    display: flex;
    gap: 3px;
  }
  .ctick {
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-strong);
    background: var(--c-cream);
    border-radius: 2px;
    padding: 0;
  }
  .ctick.on {
    background: var(--c-pink);
    border-color: var(--c-pink);
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
  .del {
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 1px 8px;
    font-family: var(--font-heading);
    font-size: 18px;
    line-height: 1;
  }
  .empty {
    opacity: 0.6;
    font-size: 12px;
    padding: 6px 0;
  }
  @container (max-width: 620px) {
    .ship {
      grid-template-columns: 1fr;
    }
  }
</style>
