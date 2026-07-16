import type { TabId } from '../../db/types';
import CharacterSheet from '../../pages/CharacterSheet.svelte';
import Starship from '../../pages/Starship.svelte';
import StarSystem from '../../pages/StarSystem.svelte';
import Journal from '../../pages/Journal.svelte';
import Factions from '../../pages/Factions.svelte';
import FileManager from '../../pages/FileManager.svelte';
import type { ComponentType } from 'svelte';

export interface TabDef {
  id: TabId;
  label: string;
  component: ComponentType;
}

export const TABS: TabDef[] = [
  { id: 'character', label: 'Character', component: CharacterSheet },
  { id: 'starship', label: 'Starship', component: Starship },
  { id: 'starSystem', label: 'Star System', component: StarSystem },
  { id: 'journal', label: 'Journal', component: Journal },
  { id: 'factions', label: 'Factions', component: Factions },
  { id: 'files', label: 'Files', component: FileManager }
];

export function tabById(id: TabId): TabDef {
  return TABS.find((t) => t.id === id) ?? TABS[0];
}
