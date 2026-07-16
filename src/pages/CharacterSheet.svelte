<script lang="ts">
  import { character } from '../stores/campaign';
  import { factions } from '../stores/campaign';
  import NumberField from '../lib/components/NumberField.svelte';
  import TextField from '../lib/components/TextField.svelte';
  import FactionIcon from '../lib/components/FactionIcon.svelte';
  import { uid } from '../db/defaults';

  const statusKeys = [
    ['stun', 'Stun'],
    ['breach', 'Breach'],
    ['shock', 'Shock'],
    ['silence', 'Silence'],
    ['immunity', 'Immunity'],
    ['overheat', 'Overheat']
  ] as const;

  function bumpHyper(d: number) {
    $character.hyperdrive = Math.max(0, Math.min(5, $character.hyperdrive + d));
  }

  function toggleLock(i: number) {
    $character.memoryUnlocked[i] = !$character.memoryUnlocked[i];
    $character = $character;
  }

  function toggleSkillLock(i: number) {
    $character.skillsUnlocked[i] = !$character.skillsUnlocked[i];
    $character = $character;
  }

  function addEnemy() {
    $character.enemies = [...$character.enemies, { id: uid(), health: 0, armor: 0, effects: '' }];
  }
  function removeEnemy(id: string) {
    $character.enemies = $character.enemies.filter((e) => e.id !== id);
  }

  function resetStatus() {
    $character.status = { stun: 0, breach: 0, shock: 0, silence: 0, immunity: 0, overheat: 0 };
  }
</script>

<div class="cs">
  <!-- LEFT: system control -->
  <div class="col">
    <div class="sheet block">
      <div class="attrs">
        <div class="pair">
          <div class="attr sheet"><span class="label">Health</span><NumberField bind:value={$character.health} /></div>
          <div class="attr sheet"><span class="label">Armor</span><NumberField bind:value={$character.armor} /></div>
        </div>
        <div class="pair">
          <div class="attr sheet"><span class="label">Exp</span><NumberField bind:value={$character.exp} /></div>
          <div class="attr sheet"><span class="label">Energy</span><NumberField bind:value={$character.energy} /></div>
        </div>
      </div>
    </div>

    <div class="sheet block">
      <div class="hs-row">
        <div class="subbox">
          <span class="label">Hyperdrive</span>
          <div class="hyper-ctrl">
            <button class="tbtn" on:click={() => bumpHyper(-1)} aria-label="less">-</button>
            <div class="ticks">
              {#each [1, 2, 3, 4, 5] as p}
                <span class="tick" class:on={$character.hyperdrive >= p}></span>
              {/each}
            </div>
            <button class="tbtn" on:click={() => bumpHyper(1)} aria-label="more">+</button>
          </div>
        </div>
        <div class="subbox">
          <span class="serum-sym" title="Serum">*</span>
          <NumberField width={72} max={99999} bind:value={$character.serum} />
        </div>
      </div>
      <div class="row counters">
        {#each $factions as f (f.id)}
          <div class="counter">
            <FactionIcon faction={f} size={40} />
            <NumberField size="sm" bind:value={$character.counters[f.id]} />
          </div>
        {/each}
      </div>
    </div>

    <div class="attrs">
      <div class="pair">
        <div class="attr sheet"><span class="label">Vigor</span><NumberField size="md" bind:value={$character.vigor} /></div>
        <div class="attr sheet"><span class="label">Grace</span><NumberField size="md" bind:value={$character.grace} /></div>
      </div>
      <div class="pair">
        <div class="attr sheet"><span class="label">Mind</span><NumberField size="md" bind:value={$character.mind} /></div>
        <div class="attr sheet"><span class="label">Tech</span><NumberField size="md" bind:value={$character.tech} /></div>
      </div>
    </div>

    <div class="sheet block">
      <div class="label full">Cybertech</div>
      {#each $character.cybertech as _, i}
        <div class="line"><span class="ln cyber">{i + 1}</span><TextField bind:value={$character.cybertech[i]} /></div>
      {/each}
    </div>

    <div class="sheet block enemy">
      <div class="conn-head">
        <span class="label">Enemy Tracker</span>
        <button class="addbtn" on:click={addEnemy}>+ Enemy</button>
      </div>
      <div class="enemy-grid">
        <span></span>
        <span class="cap2 hcell">HP</span>
        <span class="cap2 hcell">Armor</span>
        <span class="cap2 hcell">Effects</span>
        <span></span>
        {#each $character.enemies as enemy, i (enemy.id)}
          <span class="en">{i + 1}</span>
          <NumberField bind:value={enemy.health} />
          <NumberField bind:value={enemy.armor} />
          <TextField placeholder="" bind:value={enemy.effects} />
          <button class="xbtn" on:click={() => removeEnemy(enemy.id)} title="Delete">X</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- RIGHT: identity & gear -->
  <div class="col">
    <div class="row">
      <div class="sheet block grow"><span class="label">Name</span><TextField sans bind:value={$character.name} /></div>
      <div class="sheet block grow"><span class="label">Origin</span><TextField sans bind:value={$character.origin} /></div>
    </div>

    <div class="sheet block">
      <span class="label">Role</span>
      <TextField sans placeholder="Role" bind:value={$character.role} />
      <span class="cap2">Passive</span>
      <TextField placeholder="Passive" bind:value={$character.passive} />
      <span class="cap2">Skills</span>
      {#each $character.skills as _, i}
        <div class="line">
          {#if $character.skillsUnlocked[i]}
            <TextField placeholder={`Skill ${i + 1}`} bind:value={$character.skills[i]} />
          {:else}
            <input class="locked" value="Locked" disabled />
          {/if}
          {#if i >= 1}
            <button
              class="lockbtn"
              class:locked={!$character.skillsUnlocked[i]}
              on:click={() => toggleSkillLock(i)}
              title={$character.skillsUnlocked[i] ? 'Lock skill' : 'Unlock skill'}
            >
              {$character.skillsUnlocked[i] ? 'Lock' : 'Unlock'}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="sheet block">
      <div class="label full">Memory Slots</div>
      {#each $character.memorySlots as _, i}
        <div class="line">
          <span class="ln">{i + 1}</span>
          {#if $character.memoryUnlocked[i]}
            <TextField bind:value={$character.memorySlots[i]} />
          {:else}
            <input class="locked" value="Locked" disabled />
          {/if}
          {#if i >= 3}
            <button
              class="lockbtn"
              class:locked={!$character.memoryUnlocked[i]}
              on:click={() => toggleLock(i)}
              title={$character.memoryUnlocked[i] ? 'Lock slot' : 'Unlock slot'}
            >
              {$character.memoryUnlocked[i] ? 'Lock' : 'Unlock'}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="row">
      {#each $character.weapons as _, i}
        <div class="sheet block grow">
          <span class="label">Weapon {i + 1}</span>
          <TextField placeholder="Weapon" bind:value={$character.weapons[i].name} />
          <TextField placeholder="Mod 1" bind:value={$character.weapons[i].mods[0]} />
          <TextField placeholder="Mod 2" bind:value={$character.weapons[i].mods[1]} />
        </div>
      {/each}
    </div>

    <div class="sheet block">
      <div class="label full">Inventory</div>
      <div class="inv">
        {#each $character.inventory as _, i}
          <div class="line"><span class="ln">{i + 1}</span><TextField bind:value={$character.inventory[i]} /></div>
        {/each}
      </div>
    </div>
  </div>

  <!-- STATUS CONDITIONS -->
  <div class="status sheet">
    <div class="conn-head">
      <span class="label">Status Conditions</span>
      <button class="addbtn reset" on:click={resetStatus}>Reset</button>
    </div>
    <div class="status-grid">
      {#each statusKeys as [key, lbl]}
        <div class="status-item">
          <span class="slbl">{lbl}</span>
          <NumberField size="sm" bind:value={$character.status[key]} />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .cs {
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
  .block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .grow {
    flex: 1;
  }
  .hs-row {
    display: flex;
    gap: 8px;
  }
  .subbox {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 6px;
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    background: var(--field-bg);
    min-width: 0;
  }
  .hyper-ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .serum-sym {
    font-family: 'ST Cyberillic', var(--font-heading);
    font-size: 26px;
    line-height: 1;
    color: var(--c-pink);
  }
  .ticks {
    display: flex;
    gap: 3px;
  }
  .tick {
    width: 14px;
    height: 18px;
    border: 1px solid var(--c-pink);
    background: transparent;
  }
  .tick.on {
    background: var(--c-pink);
  }
  .tbtn {
    border: 1px solid var(--field-border);
    background: var(--accent-2);
    color: var(--c-cream);
    border-radius: var(--radius-sm);
    width: 20px;
    height: 20px;
    line-height: 1;
  }
  .counters {
    justify-content: space-between;
  }
  .counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .attrs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pair {
    display: flex;
    gap: 8px;
    flex: 1 1 auto;
    min-width: 0;
  }
  .attr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    min-width: 104px;
    flex: 1 1 104px;
  }
  .conn-head {
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
  .addbtn.reset {
    background: var(--c-amber);
    padding: 3px 9px 1px;
    font-size: 17px;
    line-height: 1.1;
  }
  .enemy-grid {
    display: grid;
    grid-template-columns: auto auto auto 1fr auto;
    gap: 6px 8px;
    align-items: start;
    margin-top: 6px;
  }
  .hcell {
    text-align: center;
    align-self: end;
  }
  .en {
    font-family: var(--font-display);
    font-size: 20px;
    color: var(--accent);
    align-self: start;
    min-width: 16px;
    text-align: center;
    padding-top: 2px;
  }
  .cap2 {
    font-family: var(--font-heading);
    font-size: 15px;
    text-transform: uppercase;
    opacity: 0.85;
  }
  .xbtn {
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 4px 10px;
    font-family: var(--font-heading);
    font-size: 14px;
    line-height: 1.35;
    align-self: start;
  }
  .label.full {
    display: block;
  }
  .line {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ln {
    font-family: var(--font-mono);
    font-size: 13px;
    opacity: 0.7;
    min-width: 30px;
  }
  .ln.cyber {
    font-family: var(--font-display);
    font-size: 16px;
    opacity: 0.85;
  }
  .locked {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    background: repeating-linear-gradient(45deg, #ffffff08, #ffffff08 4px, #ffffff14 4px, #ffffff14 8px);
    color: var(--on-surface);
    font-family: var(--font-sheet);
    padding: 3px 6px;
  }
  .lockbtn {
    border: 1px solid var(--border-strong);
    background: var(--c-cream);
    color: var(--c-ink);
    border-radius: var(--radius-sm);
    font-size: 10px;
    padding: 2px 6px;
  }
  .lockbtn.locked {
    background: var(--c-amber);
  }
  .inv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 10px;
  }
  .status {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .status-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }
  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: var(--c-ink);
    color: var(--c-cream);
    border-radius: var(--radius-sm);
    padding: 6px 4px;
  }
  .slbl {
    font-family: var(--font-heading);
    font-size: 15px;
    text-transform: uppercase;
  }
  @container (max-width: 620px) {
    .cs {
      grid-template-columns: 1fr;
    }
    .status-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
