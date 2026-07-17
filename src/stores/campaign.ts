import { writable, type Writable, get } from 'svelte/store';
import {
  loadSection,
  saveSection,
  listCampaigns,
  putCampaign,
  deleteCampaign,
  getMeta,
  setMeta
} from '../db/db';
import type {
  Campaign,
  CharacterState,
  StarshipState,
  StarSystemState,
  JournalState,
  LayoutState,
  FactionDef
} from '../db/types';
import {
  defaultCharacter,
  defaultStarship,
  defaultStarSystem,
  defaultJournal,
  defaultLayout,
  defaultFactions,
  newCampaign,
  newFaction,
  normalizeCharacter,
  DEFAULT_FACTIONS
} from '../db/defaults';

/* ---------- Campaign registry ---------- */
export const campaigns: Writable<Campaign[]> = writable([]);
export const activeCampaignId: Writable<string | null> = writable(null);
export const ready: Writable<boolean> = writable(false);

/* ---------- Section stores ---------- */
export const character: Writable<CharacterState> = writable(defaultCharacter());
export const starship: Writable<StarshipState> = writable(defaultStarship());
export const starSystem: Writable<StarSystemState> = writable(defaultStarSystem());
export const journal: Writable<JournalState> = writable(defaultJournal());
export const layout: Writable<LayoutState> = writable(defaultLayout());
export const imageCategories: Writable<string[]> = writable(['Uncategorized']);
export const factions: Writable<FactionDef[]> = writable(defaultFactions());

let loading = false;
const timers: Record<string, ReturnType<typeof setTimeout>> = {};

function persist(section: string, value: unknown) {
  if (loading) return;
  const id = get(activeCampaignId);
  if (!id) return;
  clearTimeout(timers[section]);
  timers[section] = setTimeout(() => {
    void saveSection(id, section, value);
  }, 250);
}

// Wire persistence for each section store.
character.subscribe((v) => persist('character', v));
starship.subscribe((v) => persist('starship', v));
starSystem.subscribe((v) => persist('starSystem', v));
journal.subscribe((v) => persist('journal', v));
layout.subscribe((v) => persist('layout', v));
imageCategories.subscribe((v) => persist('imageCategories', v));
factions.subscribe((v) => persist('factions', v));

function toMap(v: unknown): Record<string, number> {
  if (Array.isArray(v)) {
    const rec: Record<string, number> = {};
    DEFAULT_FACTIONS.forEach((f, i) => (rec[f.id] = (v as number[])[i] ?? 0));
    return rec;
  }
  return (v as Record<string, number>) ?? {};
}

async function loadCampaignState(id: string) {
  loading = true;

  const ch = await loadSection<CharacterState>(id, 'character');
  character.set(ch ? normalizeCharacter(ch as unknown as Record<string, unknown>) : defaultCharacter());

  const sh = await loadSection<StarshipState>(id, 'starship');
  if (sh) {
    sh.connections = (sh.connections ?? []).map((c) => ({
      ...c,
      ticks: c.ticks ?? [false, false, false]
    }));
    sh.crew = (sh.crew ?? []).map((m) => ({ ...m, armor: m.armor ?? 0 }));
  }
  starship.set(sh ? { ...defaultStarship(), ...sh } : defaultStarship());

  const ss = await loadSection<StarSystemState>(id, 'starSystem');
  if (ss?.network) {
    const t = ss.network.tiles ?? [];
    while (t.length < 10) t.push(0);
    ss.network.tiles = t.slice(0, 10);
  }
  if (ss?.starMap) {
    const h = ss.starMap.hexes ?? {};
    for (let i = 0; i <= 36; i++) {
      const cur = h[i] ?? {};
      h[i] = {
        imageId: cur.imageId ?? null,
        text: cur.text ?? '',
        color: cur.color ?? null,
        thick: cur.thick ?? false
      };
    }
    ss.starMap.hexes = h;
    if (ss.starMap.markIndex == null) ss.starMap.markIndex = 0;
  }
  if (ss) ss.factionStrength = toMap(ss.factionStrength);
  starSystem.set(ss ? { ...defaultStarSystem(), ...ss } : defaultStarSystem());

  journal.set((await loadSection<JournalState>(id, 'journal')) ?? defaultJournal());
  const lay = await loadSection<LayoutState>(id, 'layout');
  if (lay && (lay.sizes4 as number[]).length < 3) {
    lay.sizes4 = [lay.sizes4[0], lay.sizes4[1], lay.sizes4[1]];
  }
  layout.set(lay ? { ...defaultLayout(), ...lay } : defaultLayout());
  imageCategories.set(
    (await loadSection<string[]>(id, 'imageCategories')) ?? ['Uncategorized']
  );
  factions.set((await loadSection<FactionDef[]>(id, 'factions')) ?? defaultFactions());
  reconcileFactionMaps();
  loading = false;
}

/** Ensure every faction has a counter/strength entry. */
function reconcileFactionMaps() {
  const fx = get(factions);
  const ch = get(character);
  const ss = get(starSystem);
  let cChanged = false;
  let sChanged = false;
  for (const f of fx) {
    if (ch.counters[f.id] === undefined) {
      ch.counters[f.id] = 0;
      cChanged = true;
    }
    if (ss.factionStrength[f.id] === undefined) {
      ss.factionStrength[f.id] = 0;
      sChanged = true;
    }
  }
  if (cChanged) character.set(ch);
  if (sChanged) starSystem.set(ss);
}

/* ---------- Faction actions ---------- */
export function addFaction(): void {
  const f = newFaction();
  factions.update((list) => [...list, f]);
  character.update((c) => ({ ...c, counters: { ...c.counters, [f.id]: 0 } }));
  starSystem.update((s) => ({ ...s, factionStrength: { ...s.factionStrength, [f.id]: 0 } }));
}

export function removeFaction(fid: string): void {
  factions.update((list) => list.filter((f) => f.id !== fid));
  character.update((c) => {
    const counters = { ...c.counters };
    delete counters[fid];
    return { ...c, counters };
  });
  starSystem.update((s) => {
    const factionStrength = { ...s.factionStrength };
    delete factionStrength[fid];
    return { ...s, factionStrength };
  });
}

export function renameFaction(fid: string, name: string): void {
  factions.update((list) => list.map((f) => (f.id === fid ? { ...f, name } : f)));
}

export function setFactionImage(fid: string, imageId: string | null): void {
  factions.update((list) => list.map((f) => (f.id === fid ? { ...f, imageId } : f)));
}

/* ---------- Public actions ---------- */
export async function initApp(): Promise<void> {
  let list = await listCampaigns();
  if (list.length === 0) {
    const c = newCampaign('First Campaign');
    await putCampaign(c);
    list = [c];
  }
  campaigns.set(list);

  const savedActive = await getMeta<string>('activeCampaignId');
  const active = savedActive && list.some((c) => c.id === savedActive) ? savedActive : list[0].id;
  await selectCampaign(active);
  ready.set(true);
}

export async function selectCampaign(id: string): Promise<void> {
  activeCampaignId.set(id);
  await setMeta('activeCampaignId', id);
  await loadCampaignState(id);
}

export async function createCampaign(name: string): Promise<void> {
  const c = newCampaign(name);
  await putCampaign(c);
  campaigns.update((list) => [...list, c]);
  await selectCampaign(c.id);
}

export async function renameCampaign(id: string, name: string): Promise<void> {
  const list = get(campaigns);
  const c = list.find((x) => x.id === id);
  if (!c) return;
  const updated = { ...c, name };
  await putCampaign(updated);
  campaigns.update((l) => l.map((x) => (x.id === id ? updated : x)));
}

export async function removeCampaign(id: string): Promise<void> {
  await deleteCampaign(id);
  const remaining = get(campaigns).filter((c) => c.id !== id);
  campaigns.set(remaining);
  if (get(activeCampaignId) === id) {
    if (remaining.length === 0) {
      const c = newCampaign('First Campaign');
      await putCampaign(c);
      campaigns.set([c]);
      await selectCampaign(c.id);
    } else {
      await selectCampaign(remaining[0].id);
    }
  }
}
