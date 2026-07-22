<script lang="ts">
  import { journal } from '../stores/campaign';
  import { uid } from '../db/defaults';
  import { rollDice, formatRoll } from '../lib/util/dice';
  import { oracleYesNo, oracleOpen } from '../lib/util/oracle';
  import type { JournalEntry } from '../db/types';

  let diceInput = '2d6+2';
  let lastRoll = '';

  function addEntry() {
    const name = prompt('Entry title:', `Entry ${$journal.entries.length + 1}`);
    if (name === null) return;
    const entry: JournalEntry = {
      id: uid(),
      name: name.trim() || 'Untitled',
      body: '',
      collapsed: false
    };
    $journal.entries = [...$journal.entries, entry];
    $journal.activeId = entry.id;
  }

  function selectEntry(id: string) {
    $journal.activeId = id;
    $journal = $journal;
  }

  function toggleCollapse(entry: JournalEntry) {
    entry.collapsed = !entry.collapsed;
    $journal = $journal;
  }

  function renameEntry(entry: JournalEntry) {
    const name = prompt('Rename entry:', entry.name);
    if (name === null) return;
    entry.name = name.trim() || entry.name;
    $journal = $journal;
  }

  function deleteEntry(id: string) {
    if (!confirm('Delete this journal entry?')) return;
    $journal.entries = $journal.entries.filter((e) => e.id !== id);
    if ($journal.activeId === id) $journal.activeId = $journal.entries.at(-1)?.id ?? null;
  }

  function appendToActive(text: string) {
    const active = $journal.entries.find((e) => e.id === $journal.activeId);
    if (active) {
      active.body = active.body ? `${active.body}\n${text}` : text;
      $journal = $journal;
    }
  }

  function roll() {
    const r = rollDice(diceInput);
    lastRoll = formatRoll(r);
    if (!r.ok) return;
    appendToActive(lastRoll);
  }

  function askYesNo() {
    lastRoll = oracleYesNo();
    appendToActive(lastRoll);
  }

  function askOpen() {
    lastRoll = oracleOpen();
    appendToActive(lastRoll);
  }
</script>

<div class="journal">
  <div class="dice">
    <input
      class="dice-in"
      placeholder="2d6+2"
      bind:value={diceInput}
      on:keydown={(e) => e.key === 'Enter' && roll()}
    />
    <button class="btn" on:click={roll}>Roll</button>
    <span class="ora-label">oracle</span>
    <button class="btn ora" on:click={askYesNo}>Yes/No</button>
    <button class="btn ora" on:click={askOpen}>Open Ended</button>
    <span class="dice-out">{lastRoll}</span>
    <span class="spacer"></span>
    <button class="btn add" on:click={addEntry}>+ Entry</button>
  </div>

  <div class="entries">
    {#if $journal.entries.length === 0}
      <div class="empty">No entries yet. Click + Entry to start your log.</div>
    {/if}
    {#each $journal.entries as entry (entry.id)}
      <article class="entry" class:active={entry.id === $journal.activeId}>
        <header class="entry-head" on:click={() => selectEntry(entry.id)} role="button" tabindex="0">
          <button class="chev" on:click|stopPropagation={() => toggleCollapse(entry)} aria-label="toggle">
            <span class="tri" class:open={!entry.collapsed}></span>
          </button>
          <span class="entry-name" on:dblclick={() => renameEntry(entry)} title="Double-click to rename">
            {entry.name}
          </span>
          <span class="spacer"></span>
          <button class="mini" on:click|stopPropagation={() => renameEntry(entry)} title="Rename">Edit</button>
          <button class="mini del" on:click|stopPropagation={() => deleteEntry(entry.id)} title="Delete">Del</button>
        </header>
        {#if !entry.collapsed}
          <textarea
            class="entry-body"
            placeholder="Awaiting input..."
            bind:value={entry.body}
            on:focus={() => selectEntry(entry.id)}
          ></textarea>
        {/if}
      </article>
    {/each}
  </div>
</div>

<style>
  .journal {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
    color: var(--on-bg);
  }
  .dice {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-elevated);
    padding: 6px;
    border-radius: var(--radius-sm);
    flex-wrap: wrap;
  }
  .dice-in {
    width: 90px;
    background: var(--bg-panel);
    color: var(--c-cream);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 4px 6px;
    font-family: var(--font-mono);
  }
  .dice-out {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--c-teal);
  }
  .spacer {
    flex: 1;
  }
  .btn {
    background: var(--c-amber);
    color: var(--c-ink);
    border: none;
    border-radius: var(--radius-sm);
    padding: 6px 13px;
    font-family: var(--font-heading);
    font-size: 16px;
  }
  .btn.add {
    background: var(--c-green-2);
  }
  .btn.ora {
    background: var(--c-teal);
  }
  .ora-label {
    font-family: 'ST Cyberillic', var(--font-heading);
    font-size: 18px;
    opacity: 0.9;
    margin-left: 6px;
  }
  .entries {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .empty {
    opacity: 0.6;
    text-align: center;
    padding: 30px;
    font-size: 12px;
  }
  .entry {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-panel);
    overflow: hidden;
  }
  .entry.active {
    border-color: var(--c-amber);
  }
  .entry-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: var(--bg-elevated);
    cursor: pointer;
  }
  .chev {
    background: none;
    border: none;
    color: var(--c-cream);
    font-size: 12px;
    display: grid;
    place-items: center;
    width: 18px;
  }
  .tri {
    width: 0;
    height: 0;
    border-left: 6px solid var(--c-cream);
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    transition: transform 0.12s ease;
  }
  .tri.open {
    transform: rotate(90deg);
  }
  .entry-name {
    font-family: var(--font-heading);
    text-transform: uppercase;
    font-size: 18px;
    letter-spacing: 0.03em;
  }
  .mini {
    background: none;
    border: none;
    color: var(--c-cream);
    opacity: 0.75;
    font-family: var(--font-heading);
    font-size: 15px;
  }
  .mini:hover {
    opacity: 1;
  }
  .mini.del:hover {
    color: var(--danger);
  }
  .entry-body {
    width: 100%;
    min-height: 120px;
    border: none;
    background: var(--surface);
    color: var(--on-surface);
    font-family: var(--font-mono);
    font-size: 13px;
    padding: 8px;
    resize: vertical;
  }
  .entry-body:focus {
    outline: none;
  }
</style>
