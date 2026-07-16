// Shared data model for Astrolabe. All state is per-campaign and JSON-serializable.

export type TabId = 'character' | 'starship' | 'starSystem' | 'journal' | 'files' | 'factions';

export interface Campaign {
  id: string;
  name: string;
  createdAt: number;
}

/* ---------- Factions ---------- */
export interface FactionDef {
  id: string;
  name: string;
  imageId: string | null;
}

/* ---------- Character sheet (PDF page 1) ---------- */
export interface CharacterStatus {
  stun: number;
  breach: number;
  shock: number;
  silence: number;
  immunity: number;
  overheat: number;
}

export interface Weapon {
  name: string;
  mods: string[]; // 2 mods
}

export interface EnemyEntry {
  id: string;
  health: number;
  armor: number;
  effects: string;
}

export interface CharacterState {
  name: string;
  origin: string;
  role: string;
  health: number;
  armor: number;
  exp: number;
  energy: number;
  hyperdrive: number; // 0..5 track
  serum: number;
  counters: Record<string, number>; // faction id -> value
  vigor: number;
  grace: number;
  mind: number;
  tech: number;
  cybertech: string[]; // 6 lines
  enemies: EnemyEntry[];
  memorySlots: string[]; // 6 (indices 3..5 lockable)
  memoryUnlocked: boolean[]; // 6 lock flags
  weapons: Weapon[]; // 2
  inventory: string[]; // 8
  status: CharacterStatus;
  passive: string;
  skills: string[]; // 3
  skillsUnlocked: boolean[]; // 3 (skills 1 & 2 lockable)
}

/* ---------- Starship (PDF page 2) ---------- */
export interface CrewMember {
  name: string;
  role: string;
  passive: string;
  inventory: string[]; // 4 lines
  hp: number;
  armor: number;
  vig: number;
  gra: number;
  min: number;
  tec: number;
  skills: string[]; // 3
}

export interface Connection {
  id: string;
  name: string;
  location: string;
  data: string;
  ticks: boolean[]; // 3 progress ticks
}

export interface StarshipState {
  imageId: string | null; // dropped ship image
  control: string;
  engine: string;
  modulesLeft: string;
  modulesLeft2: string;
  modulesRight: string;
  modulesRight2: string;
  hull: number;
  fuel: number;
  shields: number;
  cargo: string[]; // 6
  starshipName: string;
  crewName: string;
  crew: CrewMember[]; // 4
  connections: Connection[]; // dynamic add/delete
}

/* ---------- Star system (PDF page 3) ---------- */
export interface QuestEntry {
  id: string;
  text: string;
}

export interface CampaignSlot {
  bases: string;
  outcome: string;
}

export type TileBg = 0 | 1 | 2; // 3 backgrounds (empty / hatched / filled)

export interface NetworkMap {
  tiles: TileBg[];
  clockTicks: number;
  clockMax: number;
  markIndex: number | null;
}

export interface HexTile {
  imageId: string | null;
  text: string;
}

export interface StarMap {
  hexes: Record<number, HexTile>; // keyed 1..36
  markIndex: number | null;
}

export interface StarSystemState {
  systemName: string;
  systemType: string;
  factionStrength: Record<string, number>; // faction id -> value
  questLog: QuestEntry[];
  campaign: CampaignSlot[]; // 3
  network: NetworkMap;
  starMap: StarMap;
}

/* ---------- Journal ---------- */
export interface JournalEntry {
  id: string;
  name: string;
  body: string;
  collapsed: boolean;
}

export interface JournalState {
  entries: JournalEntry[];
  activeId: string | null;
}

/* ---------- Layout ---------- */
export interface LayoutState {
  paneCount: 1 | 2 | 4;
  panes: TabId[]; // length 4; first paneCount are shown
  sizes2: [number, number]; // % split for 2-pane
  sizes4: [number, number, number]; // [col %, left-row %, right-row %] for 2x2
  boxOrder: Record<string, string[]>; // reorderable box groups
}

/* ---------- Images ---------- */
export interface StoredImage {
  id: string;
  campaignId: string;
  name: string;
  category: string;
  blob: Blob;
  createdAt: number;
}

/* ---------- Aggregated export (text only, no image blobs) ---------- */
export interface CampaignExport {
  version: number;
  campaign: Campaign;
  character: CharacterState;
  starship: StarshipState;
  starSystem: StarSystemState;
  journal: JournalState;
  layout: LayoutState;
  imageCategories: string[];
  factions?: FactionDef[];
}
