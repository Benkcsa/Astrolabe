import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Campaign, StoredImage } from './types';

interface AstrolabeDB extends DBSchema {
  campaigns: {
    key: string;
    value: Campaign;
  };
  state: {
    // key: `${campaignId}:${section}`
    key: string;
    value: unknown;
  };
  images: {
    key: string;
    value: StoredImage;
    indexes: { byCampaign: string };
  };
  meta: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<AstrolabeDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AstrolabeDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AstrolabeDB>('astrolabe', 1, {
      upgrade(db) {
        db.createObjectStore('campaigns', { keyPath: 'id' });
        db.createObjectStore('state');
        const images = db.createObjectStore('images', { keyPath: 'id' });
        images.createIndex('byCampaign', 'campaignId');
        db.createObjectStore('meta');
      }
    });
  }
  return dbPromise;
}

/* ---------- Meta ---------- */
export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return (await db.get('meta', key)) as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('meta', value, key);
}

/* ---------- Campaigns ---------- */
export async function listCampaigns(): Promise<Campaign[]> {
  const db = await getDB();
  const all = await db.getAll('campaigns');
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function putCampaign(c: Campaign): Promise<void> {
  const db = await getDB();
  await db.put('campaigns', c);
}

export async function deleteCampaign(id: string): Promise<void> {
  const db = await getDB();
  // Remove campaign, its state sections and images.
  await db.delete('campaigns', id);
  const sections = ['character', 'starship', 'starSystem', 'journal', 'layout', 'imageCategories', 'factions'];
  await Promise.all(sections.map((s) => db.delete('state', `${id}:${s}`)));
  const imgs = await db.getAllFromIndex('images', 'byCampaign', id);
  await Promise.all(imgs.map((img) => db.delete('images', img.id)));
}

/* ---------- Section state ---------- */
export async function loadSection<T>(campaignId: string, section: string): Promise<T | undefined> {
  const db = await getDB();
  return (await db.get('state', `${campaignId}:${section}`)) as T | undefined;
}

export async function saveSection(campaignId: string, section: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('state', value, `${campaignId}:${section}`);
}

/* ---------- Images ---------- */
export async function addImage(img: StoredImage): Promise<void> {
  const db = await getDB();
  await db.put('images', img);
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  const db = await getDB();
  return db.get('images', id);
}

export async function listImages(campaignId: string): Promise<StoredImage[]> {
  const db = await getDB();
  const imgs = await db.getAllFromIndex('images', 'byCampaign', campaignId);
  return imgs.sort((a, b) => a.createdAt - b.createdAt);
}

export async function removeImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('images', id);
}
