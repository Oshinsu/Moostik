import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import type { Episode, Shot, Variation, Character, Location } from "@/types";
import { createEmptyPrompt, createShotVariations } from "@/data/prompt-helpers";
import { MOOSTIK_CHARACTERS, HUMAN_CHARACTERS } from "@/data/characters.data";
import { MOOSTIK_LOCATIONS } from "@/data/locations.data";

const DATA_DIR = path.join(process.cwd(), "data", "episodes");
const CHARACTERS_FILE = path.join(process.cwd(), "data", "characters.json");
const LOCATIONS_FILE = path.join(process.cwd(), "data", "locations.json");

// ============================================================================
// EPISODE OPERATIONS
// ============================================================================

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function getEpisodes(): Promise<Episode[]> {
  await ensureDataDir();

  try {
    const files = await readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const episodes = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFile(path.join(DATA_DIR, file), "utf-8");
        return JSON.parse(content) as Episode;
      })
    );

    return episodes.sort((a, b) => a.number - b.number);
  } catch {
    return [];
  }
}

export async function getEpisode(id: string): Promise<Episode | null> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${id}.json`);

  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as Episode;
  } catch {
    return null;
  }
}

export async function saveEpisode(episode: Episode): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${episode.id}.json`);
  episode.updatedAt = new Date().toISOString();
  await writeFile(filePath, JSON.stringify(episode, null, 2), "utf-8");
}

export async function createEpisode(
  number: number,
  title: string,
  description: string
): Promise<Episode> {
  const id = `ep${number}`;
  const now = new Date().toISOString();

  const episode: Episode = {
    id,
    number,
    title,
    description,
    shots: [],
    createdAt: now,
    updatedAt: now,
  };

  await saveEpisode(episode);
  return episode;
}

export async function deleteEpisode(id: string): Promise<void> {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  const { unlink } = await import("fs/promises");
  await unlink(filePath);
}

// ============================================================================
// SHOT OPERATIONS
// ============================================================================

export async function addShot(
  episodeId: string,
  name: string,
  description: string = "",
  characterIds: string[] = [],
  locationIds: string[] = []
): Promise<Shot | null> {
  const episode = await getEpisode(episodeId);
  if (!episode) return null;

  const shotNumber = episode.shots.length + 1;
  const shotId = `shot-${shotNumber.toString().padStart(3, "0")}`;
  const now = new Date().toISOString();

  const shot: Shot = {
    id: shotId,
    number: shotNumber,
    name,
    description,
    sceneType: "establishing",
    prompt: createEmptyPrompt(),
    characterIds,
    locationIds,
    variations: [],
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  episode.shots.push(shot);
  await saveEpisode(episode);

  return shot;
}

export async function updateShot(
  episodeId: string,
  shotId: string,
  updates: Partial<Shot>
): Promise<Shot | null> {
  const episode = await getEpisode(episodeId);
  if (!episode) return null;

  const shotIndex = episode.shots.findIndex((s) => s.id === shotId);
  if (shotIndex === -1) return null;

  episode.shots[shotIndex] = {
    ...episode.shots[shotIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveEpisode(episode);
  return episode.shots[shotIndex];
}

export async function deleteShot(
  episodeId: string,
  shotId: string
): Promise<boolean> {
  const episode = await getEpisode(episodeId);
  if (!episode) return false;

  const shotIndex = episode.shots.findIndex((s) => s.id === shotId);
  if (shotIndex === -1) return false;

  episode.shots.splice(shotIndex, 1);

  // Renumber remaining shots
  episode.shots.forEach((shot, index) => {
    shot.number = index + 1;
  });

  await saveEpisode(episode);
  return true;
}

export async function duplicateShot(
  episodeId: string,
  shotId: string
): Promise<Shot | null> {
  const episode = await getEpisode(episodeId);
  if (!episode) return null;

  const originalShot = episode.shots.find((s) => s.id === shotId);
  if (!originalShot) return null;

  const shotNumber = episode.shots.length + 1;
  const newShotId = `shot-${shotNumber.toString().padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newShot: Shot = {
    ...JSON.parse(JSON.stringify(originalShot)),
    id: newShotId,
    number: shotNumber,
    name: `${originalShot.name} (copie)`,
    variations: [],
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  episode.shots.push(newShot);
  await saveEpisode(episode);

  return newShot;
}

// ============================================================================
// VARIATION OPERATIONS
// ============================================================================

export async function updateVariation(
  episodeId: string,
  shotId: string,
  variationId: string,
  updates: Partial<Variation>
): Promise<Variation | null> {
  const episode = await getEpisode(episodeId);
  if (!episode) return null;

  const shot = episode.shots.find((s) => s.id === shotId);
  if (!shot) return null;

  const variationIndex = shot.variations.findIndex((v) => v.id === variationId);
  if (variationIndex === -1) return null;

  shot.variations[variationIndex] = {
    ...shot.variations[variationIndex],
    ...updates,
  };

  // Update shot status based on variations
  const allCompleted = shot.variations.every((v) => v.status === "completed");
  const anyError = shot.variations.some((v) => v.status === "failed");
  const anyCompleted = shot.variations.some((v) => v.status === "completed");

  if (allCompleted) {
    shot.status = "completed";
  } else if (anyError && !anyCompleted) {
    shot.status = "pending";
  } else if (anyCompleted) {
    shot.status = "in_progress";
  }

  await saveEpisode(episode);
  return shot.variations[variationIndex];
}

export async function regenerateVariations(
  episodeId: string,
  shotId: string
): Promise<boolean> {
  const episode = await getEpisode(episodeId);
  if (!episode) return false;

  const shot = episode.shots.find((s) => s.id === shotId);
  if (!shot) return false;

  // Reset all variations to pending
  shot.variations = shot.variations.map((v) => ({
    ...v,
    status: "pending" as const,
    imageUrl: undefined,
    localPath: undefined,
    error: undefined,
    generatedAt: undefined,
  }));

  shot.status = "pending";
  await saveEpisode(episode);

  return true;
}

// ============================================================================
// CHARACTER OPERATIONS
// ============================================================================

export async function getCharacters(): Promise<Character[]> {
  try {
    const content = await readFile(CHARACTERS_FILE, "utf-8");
    return JSON.parse(content) as Character[];
  } catch {
    // Return default characters if file doesn't exist
    return [...MOOSTIK_CHARACTERS, ...HUMAN_CHARACTERS];
  }
}

export async function saveCharacters(characters: Character[]): Promise<void> {
  await mkdir(path.dirname(CHARACTERS_FILE), { recursive: true });
  await writeFile(CHARACTERS_FILE, JSON.stringify(characters, null, 2), "utf-8");
}

export async function initializeCharacters(): Promise<Character[]> {
  const characters = [...MOOSTIK_CHARACTERS, ...HUMAN_CHARACTERS];
  await saveCharacters(characters);
  return characters;
}

// ============================================================================
// LOCATION OPERATIONS
// ============================================================================

export async function getLocations(): Promise<Location[]> {
  try {
    const content = await readFile(LOCATIONS_FILE, "utf-8");
    return JSON.parse(content) as Location[];
  } catch {
    // Return default locations if file doesn't exist
    return MOOSTIK_LOCATIONS;
  }
}

export async function saveLocations(locations: Location[]): Promise<void> {
  await mkdir(path.dirname(LOCATIONS_FILE), { recursive: true });
  await writeFile(LOCATIONS_FILE, JSON.stringify(locations, null, 2), "utf-8");
}

export async function initializeLocations(): Promise<Location[]> {
  const locations = MOOSTIK_LOCATIONS;
  await saveLocations(locations);
  return locations;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface EpisodeStats {
  totalShots: number;
  completedShots: number;
  partialShots: number;
  pendingShots: number;
  errorShots: number;
  totalVariations: number;
  completedVariations: number;
  pendingVariations: number;
  errorVariations: number;
}

export async function getEpisodeStats(episodeId: string): Promise<EpisodeStats | null> {
  const episode = await getEpisode(episodeId);
  if (!episode) return null;

  const stats: EpisodeStats = {
    totalShots: episode.shots.length,
    completedShots: episode.shots.filter((s) => s.status === "completed").length,
    partialShots: episode.shots.filter((s) => s.status === "in_progress").length,
    pendingShots: episode.shots.filter((s) => s.status === "pending").length,
    errorShots: 0,
    totalVariations: 0,
    completedVariations: 0,
    pendingVariations: 0,
    errorVariations: 0,
  };

  for (const shot of episode.shots) {
    stats.totalVariations += shot.variations.length;
    stats.completedVariations += shot.variations.filter((v) => v.status === "completed").length;
    stats.pendingVariations += shot.variations.filter((v) => v.status === "pending").length;
    stats.errorVariations += shot.variations.filter((v) => v.status === "failed").length;
  }

  return stats;
}

// ============================================================================
// REFERENCE IMAGE OPERATIONS
// ============================================================================

/**
 * Met à jour les images de référence d'un personnage
 */
export async function updateCharacterReferenceImages(
  characterId: string,
  referenceImages: string[],
  validated: boolean = false
): Promise<Character | null> {
  const characters = await getCharacters();
  const index = characters.findIndex((c) => c.id === characterId);
  
  if (index === -1) return null;
  
  characters[index] = {
    ...characters[index],
    referenceImages,
    validated,
  };
  
  await saveCharacters(characters);
  return characters[index];
}

/**
 * Met à jour les images de référence d'un lieu
 */
export async function updateLocationReferenceImages(
  locationId: string,
  referenceImages: string[],
  validated: boolean = false
): Promise<Location | null> {
  const locations = await getLocations();
  const index = locations.findIndex((l) => l.id === locationId);
  
  if (index === -1) return null;
  
  locations[index] = {
    ...locations[index],
    referenceImages,
    validated,
  };
  
  await saveLocations(locations);
  return locations[index];
}

/**
 * Valide une référence de personnage
 */
export async function validateCharacterReference(
  characterId: string,
  validated: boolean
): Promise<boolean> {
  const characters = await getCharacters();
  const index = characters.findIndex((c) => c.id === characterId);
  
  if (index === -1) return false;
  
  characters[index].validated = validated;
  await saveCharacters(characters);
  return true;
}

/**
 * Valide une référence de lieu
 */
export async function validateLocationReference(
  locationId: string,
  validated: boolean
): Promise<boolean> {
  const locations = await getLocations();
  const index = locations.findIndex((l) => l.id === locationId);
  
  if (index === -1) return false;
  
  locations[index].validated = validated;
  await saveLocations(locations);
  return true;
}

/**
 * Récupère toutes les images de référence pour un shot
 * basé sur ses characterIds et locationIds
 */
export async function getReferenceImagesForShot(
  characterIds: string[],
  locationIds: string[]
): Promise<string[]> {
  const referenceImages: string[] = [];
  
  // Récupérer les références des personnages
  if (characterIds.length > 0) {
    const characters = await getCharacters();
    for (const charId of characterIds) {
      const character = characters.find((c) => c.id === charId);
      if (character?.referenceImages && character.referenceImages.length > 0) {
        // Prendre seulement les références validées ou la première si aucune validée
        referenceImages.push(...character.referenceImages);
      }
    }
  }
  
  // Récupérer les références des lieux
  if (locationIds.length > 0) {
    const locations = await getLocations();
    for (const locId of locationIds) {
      const location = locations.find((l) => l.id === locId);
      if (location?.referenceImages && location.referenceImages.length > 0) {
        referenceImages.push(...location.referenceImages);
      }
    }
  }
  
  // Limiter à 14 images max (limite de Nano Banana Pro)
  return referenceImages.slice(0, 14);
}

/**
 * Récupère un personnage par son ID
 */
export async function getCharacter(characterId: string): Promise<Character | null> {
  const characters = await getCharacters();
  return characters.find((c) => c.id === characterId) || null;
}

/**
 * Récupère un lieu par son ID
 */
export async function getLocation(locationId: string): Promise<Location | null> {
  const locations = await getLocations();
  return locations.find((l) => l.id === locationId) || null;
}

/**
 * Statistiques des références
 */
export interface ReferenceStats {
  totalCharacters: number;
  charactersWithRefs: number;
  validatedCharacters: number;
  totalLocations: number;
  locationsWithRefs: number;
  validatedLocations: number;
}

export async function getReferenceStats(): Promise<ReferenceStats> {
  const characters = await getCharacters();
  const locations = await getLocations();
  
  return {
    totalCharacters: characters.length,
    charactersWithRefs: characters.filter((c) => c.referenceImages && c.referenceImages.length > 0).length,
    validatedCharacters: characters.filter((c) => c.validated).length,
    totalLocations: locations.length,
    locationsWithRefs: locations.filter((l) => l.referenceImages && l.referenceImages.length > 0).length,
    validatedLocations: locations.filter((l) => l.validated).length,
  };
}
