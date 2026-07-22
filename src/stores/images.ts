import { writable, type Writable } from 'svelte/store';
import { addImage, getImage, listImages, removeImage } from '../db/db';
import type { StoredImage } from '../db/types';
import { uid } from '../db/defaults';

export const images: Writable<StoredImage[]> = writable([]);

// Cache of image id -> object URL so <img> can render IndexedDB blobs.
const urlCache = new Map<string, string>();

export async function refreshImages(): Promise<void> {
  images.set(await listImages());
}

export async function uploadImages(files: FileList | File[], category: string): Promise<void> {
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    const img: StoredImage = {
      id: uid(),
      campaignId: 'global',
      name: file.name,
      category: category || 'Uncategorized',
      blob: file,
      createdAt: Date.now()
    };
    await addImage(img);
  }
  await refreshImages();
}

export async function deleteImage(id: string): Promise<void> {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
  await removeImage(id);
  await refreshImages();
}

export async function setImageCategory(id: string, category: string): Promise<void> {
  const img = await getImage(id);
  if (!img) return;
  img.category = category;
  await addImage(img);
  await refreshImages();
}

/** Resolve an image id to an object URL (cached). Returns null if missing. */
export async function resolveImageUrl(id: string | null): Promise<string | null> {
  if (!id) return null;
  const cached = urlCache.get(id);
  if (cached) return cached;
  const img = await getImage(id);
  if (!img) return null;
  const url = URL.createObjectURL(img.blob);
  urlCache.set(id, url);
  return url;
}

export function clearUrlCache(): void {
  for (const url of urlCache.values()) URL.revokeObjectURL(url);
  urlCache.clear();
}
