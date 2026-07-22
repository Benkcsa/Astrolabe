import { get } from 'svelte/store';
import {
  character,
  starship,
  starSystem,
  journal,
  layout,
  factions,
  campaigns,
  activeCampaignId,
  createCampaign,
  selectCampaign
} from '../../stores/campaign';
import { saveSection } from '../../db/db';
import type { CampaignExport } from '../../db/types';

const EXPORT_VERSION = 1;

export function exportActiveCampaign(): void {
  const id = get(activeCampaignId);
  const campaign = get(campaigns).find((c) => c.id === id);
  if (!campaign) return;

  const data: CampaignExport = {
    version: EXPORT_VERSION,
    campaign,
    character: get(character),
    starship: get(starship),
    starSystem: get(starSystem),
    journal: get(journal),
    layout: get(layout),
    factions: get(factions)
  };

  // Text-only export: image blobs are intentionally excluded (only the
  // referenced image ids remain in the sheet state).
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safe = campaign.name.replace(/[^\w.-]+/g, '_');
  a.download = `astrolabe-${safe}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCampaignFromFile(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as CampaignExport;
  if (!data || typeof data !== 'object' || !data.character) {
    throw new Error('Not a valid Astrolabe export file.');
  }

  // Create a fresh campaign and populate its sections.
  const name = (data.campaign?.name ?? 'Imported') + ' (import)';
  await createCampaign(name);
  const newId = get(activeCampaignId)!;

  await saveSection(newId, 'character', data.character);
  await saveSection(newId, 'starship', data.starship);
  await saveSection(newId, 'starSystem', data.starSystem);
  await saveSection(newId, 'journal', data.journal);
  if (data.layout) await saveSection(newId, 'layout', data.layout);
  if (data.factions) await saveSection(newId, 'factions', data.factions);

  // Reload the just-imported campaign so stores reflect it.
  await selectCampaign(newId);
}
