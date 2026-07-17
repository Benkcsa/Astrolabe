import type {
  CharacterState,
  StarshipState,
  StarSystemState,
  JournalState,
  LayoutState,
  Campaign,
  FactionDef
} from './types';

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export const DEFAULT_FACTIONS: FactionDef[] = [
  { id: 'warg', name: 'WARG', imageId: null },
  { id: 'isf', name: 'Intersolar', imageId: null },
  { id: 'medusa', name: 'Medusa', imageId: null },
  { id: 'synth', name: 'Synth', imageId: null },
  { id: 'corsair', name: 'Corsair', imageId: null }
];

export function defaultFactions(): FactionDef[] {
  return DEFAULT_FACTIONS.map((f) => ({ ...f }));
}

export function newFaction(name = 'New Faction'): FactionDef {
  return { id: uid(), name, imageId: null };
}

function zeroMap(): Record<string, number> {
  return Object.fromEntries(DEFAULT_FACTIONS.map((f) => [f.id, 0]));
}

export function defaultCharacter(): CharacterState {
  return {
    name: '',
    origin: '',
    role: '',
    passive: '',
    skills: ['', '', ''],
    skillsUnlocked: [true, false, false],
    health: 20,
    armor: 0,
    exp: 0,
    energy: 20,
    hyperdrive: 0,
    serum: 0,
    counters: zeroMap(),
    vigor: 0,
    grace: 0,
    mind: 0,
    tech: 0,
    cybertech: ['', '', '', '', '', ''],
    enemies: [{ id: uid(), health: 0, armor: 0, effects: '' }],
    memorySlots: ['', '', '', '', '', ''],
    memoryUnlocked: [true, true, true, false, false, false],
    weapons: [
      { name: '', mods: ['', ''] },
      { name: '', mods: ['', ''] }
    ],
    inventory: ['', '', '', '', '', '', '', ''],
    status: {
      stun: 0,
      breach: 0,
      shock: 0,
      silence: 0,
      immunity: 0,
      overheat: 0
    }
  };
}

/** Migrate a possibly-older character record to the current shape. */
export function normalizeCharacter(ch: Record<string, unknown>): CharacterState {
  const base = defaultCharacter();
  const merged = { ...base, ...(ch as Partial<CharacterState>) } as CharacterState;
  // Weapons: mods may have been a single string.
  const rawWeapons = (ch.weapons as { name?: string; mods?: unknown }[] | undefined) ?? base.weapons;
  merged.weapons = rawWeapons.map((w) => ({
    name: w.name ?? '',
    mods: Array.isArray(w.mods) ? [w.mods[0] ?? '', w.mods[1] ?? ''] : [(w.mods as string) ?? '', '']
  }));
  // Enemies: old records had single enemyHealth/Armor/Effects strings.
  if (!Array.isArray(ch.enemies)) {
    const h = parseInt(String(ch.enemyHealth ?? ''), 10);
    const a = parseInt(String(ch.enemyArmor ?? ''), 10);
    const eff = String(ch.enemyEffects ?? '');
    merged.enemies = [
      { id: uid(), health: Number.isNaN(h) ? 0 : h, armor: Number.isNaN(a) ? 0 : a, effects: eff }
    ];
  }
  merged.skills = (ch.skills as string[] | undefined) ?? base.skills;
  merged.skillsUnlocked = (ch.skillsUnlocked as boolean[] | undefined) ?? base.skillsUnlocked;
  merged.passive = (ch.passive as string | undefined) ?? '';
  merged.role = (ch.role as string | undefined) ?? '';
  merged.memoryUnlocked = (ch.memoryUnlocked as boolean[] | undefined) ?? base.memoryUnlocked;
  // Counters: migrate an old positional array to an id-keyed map.
  if (Array.isArray(ch.counters)) {
    const rec: Record<string, number> = {};
    DEFAULT_FACTIONS.forEach((f, i) => (rec[f.id] = (ch.counters as number[])[i] ?? 0));
    merged.counters = rec;
  } else {
    merged.counters = (ch.counters as Record<string, number> | undefined) ?? zeroMap();
  }
  return merged;
}

function defaultCrew() {
  return {
    name: '',
    role: '',
    passive: '',
    inventory: ['', '', '', ''],
    hp: 20,
    armor: 0,
    vig: 0,
    gra: 0,
    min: 0,
    tec: 0,
    skills: ['', '', '']
  };
}

export function defaultStarship(): StarshipState {
  return {
    imageId: null,
    control: '',
    engine: '',
    modulesLeft: '',
    modulesLeft2: '',
    modulesRight: '',
    modulesRight2: '',
    hull: 20,
    fuel: 20,
    shields: 0,
    cargo: ['', '', '', '', '', ''],
    starshipName: '',
    crewName: '',
    crew: [defaultCrew(), defaultCrew(), defaultCrew(), defaultCrew()],
    connections: []
  };
}

export function defaultStarSystem(): StarSystemState {
  const hexes: StarSystemState['starMap']['hexes'] = {};
  for (let i = 0; i <= 36; i++) hexes[i] = { imageId: null, text: '', color: null, thick: false };
  return {
    systemName: '',
    systemType: '',
    factionStrength: zeroMap(),
    questLog: [],
    campaign: [
      { bases: '', outcome: '' },
      { bases: '', outcome: '' },
      { bases: '', outcome: '' }
    ],
    network: {
      tiles: new Array(10).fill(0),
      clockTicks: 0,
      clockMax: 12,
      markIndex: null
    },
    starMap: {
      hexes,
      markIndex: 0
    }
  };
}

export function defaultJournal(): JournalState {
  return { entries: [], activeId: null };
}

export function defaultLayout(): LayoutState {
  return {
    paneCount: 1,
    panes: ['character', 'journal', 'starship', 'files'],
    sizes2: [50, 50],
    sizes4: [50, 50, 50],
    boxOrder: {}
  };
}

export function newCampaign(name: string): Campaign {
  return { id: uid(), name: name || 'New Campaign', createdAt: Date.now() };
}
