/**
 * MOOSTIK - Reference Resolver Service
 * 
 * Ce service gère la résolution et la priorisation des images de référence
 * pour les personnages et les lieux lors de la génération d'images.
 * 
 * Responsabilités:
 * - Récupérer les références validées pour chaque personnage/lieu
 * - Prioriser: validated > recent > first
 * - Limiter à 14 images max (limite Nano Banana Pro)
 * - Injecter dans JsonMoostikSubject.reference_image
 */

import { getCharacters, getLocations } from "./storage";
import type { Character, Location, Shot, MoostikPrompt } from "@/types";
import type {
  ClusterReferences,
  CharacterReference,
  LocationReference,
  GenerationReadinessCheck,
  MissingReference,
  createEmptyClusterReferences,
  createEmptyReadinessCheck,
} from "@/types/scene-cluster";
import { isLocalUrl } from "./url-utils";
import { referenceLogger as logger } from "./logger";
import { config } from "./config";

// ============================================================================
// CONSTANTES (depuis config centralisée)
// ============================================================================

/** Limite maximum d'images de référence pour Nano Banana Pro */
const MAX_REFERENCE_IMAGES = config.replicate.maxReferenceImages;

/** Nombre maximum de références par personnage */
const MAX_REFS_PER_CHARACTER = config.references.maxRefsPerCharacter;

/** Nombre maximum de références par lieu */
const MAX_REFS_PER_LOCATION = config.references.maxRefsPerLocation;

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface ResolveOptions {
  /** Prioriser les références validées */
  prioritizeValidated: boolean;
  /** Inclure les références non-validées si aucune validée */
  fallbackToUnvalidated: boolean;
  /** Nombre max de refs par personnage */
  maxRefsPerCharacter: number;
  /** Nombre max de refs par lieu */
  maxRefsPerLocation: number;
}

const DEFAULT_RESOLVE_OPTIONS: ResolveOptions = {
  prioritizeValidated: true,
  fallbackToUnvalidated: true,
  maxRefsPerCharacter: MAX_REFS_PER_CHARACTER,
  maxRefsPerLocation: MAX_REFS_PER_LOCATION,
};

// ============================================================================
// FONCTIONS DE RÉSOLUTION
// ============================================================================

/**
 * Résout les références d'un personnage
 */
export async function resolveCharacterReference(
  characterId: string,
  options: Partial<ResolveOptions> = {}
): Promise<CharacterReference | null> {
  const opts = { ...DEFAULT_RESOLVE_OPTIONS, ...options };
  const characters = await getCharacters();
  const character = characters.find((c) => c.id === characterId);

  if (!character) {
    return null;
  }

  const refs = character.referenceImages || [];
  const validated = character.validated || false;

  // Sélectionner les meilleures références
  let selectedRefs: string[] = [];

  if (refs.length > 0) {
    if (validated || opts.fallbackToUnvalidated) {
      // Prendre les premières références (jusqu'à la limite)
      selectedRefs = refs.slice(0, opts.maxRefsPerCharacter);
    }
  }

  return {
    characterId: character.id,
    characterName: character.name,
    referenceImages: selectedRefs,
    validated,
    primaryImage: selectedRefs[0] || undefined,
  };
}

/**
 * Résout les références d'un lieu
 */
export async function resolveLocationReference(
  locationId: string,
  options: Partial<ResolveOptions> = {}
): Promise<LocationReference | null> {
  const opts = { ...DEFAULT_RESOLVE_OPTIONS, ...options };
  const locations = await getLocations();
  const location = locations.find((l) => l.id === locationId);

  if (!location) {
    return null;
  }

  const refs = location.referenceImages || [];
  const validated = location.validated || false;

  // Sélectionner les meilleures références
  let selectedRefs: string[] = [];

  if (refs.length > 0) {
    if (validated || opts.fallbackToUnvalidated) {
      // Prendre les premières références (jusqu'à la limite)
      selectedRefs = refs.slice(0, opts.maxRefsPerLocation);
    }
  }

  return {
    locationId: location.id,
    locationName: location.name,
    referenceImages: selectedRefs,
    validated,
    primaryImage: selectedRefs[0] || undefined,
  };
}

/**
 * Résout toutes les références pour un shot
 */
export async function resolveReferencesForShot(
  characterIds: string[],
  locationIds: string[],
  options: Partial<ResolveOptions> = {}
): Promise<ClusterReferences> {
  const opts = { ...DEFAULT_RESOLVE_OPTIONS, ...options };
  const warnings: string[] = [];

  logger.debug("Resolving references", {
    characters: characterIds.length,
    locations: locationIds.length,
  });

  // Résoudre les références des personnages
  const characterRefs: CharacterReference[] = [];
  for (const charId of characterIds) {
    const ref = await resolveCharacterReference(charId, opts);
    if (ref) {
      characterRefs.push(ref);
      if (ref.referenceImages.length === 0) {
        warnings.push(`Personnage "${ref.characterName}" n'a pas d'images de référence`);
      } else if (!ref.validated) {
        warnings.push(`Personnage "${ref.characterName}" n'est pas validé`);
      }
    } else {
      warnings.push(`Personnage "${charId}" introuvable`);
    }
  }

  // Résoudre les références des lieux
  const locationRefs: LocationReference[] = [];
  for (const locId of locationIds) {
    const ref = await resolveLocationReference(locId, opts);
    if (ref) {
      locationRefs.push(ref);
      if (ref.referenceImages.length === 0) {
        warnings.push(`Lieu "${ref.locationName}" n'a pas d'images de référence`);
      } else if (!ref.validated) {
        warnings.push(`Lieu "${ref.locationName}" n'est pas validé`);
      }
    } else {
      warnings.push(`Lieu "${locId}" introuvable`);
    }
  }

  // Combiner toutes les URLs en respectant la limite
  const allImageUrls = combineAndPrioritizeRefs(characterRefs, locationRefs, opts);

  // Calculer les stats
  const validatedCount =
    characterRefs.filter((r) => r.validated).length +
    locationRefs.filter((r) => r.validated).length;

  return {
    characters: characterRefs,
    locations: locationRefs,
    allImageUrls,
    totalCount: allImageUrls.length,
    validatedCount,
    warnings,
  };
}

/**
 * Combine et priorise les références pour respecter la limite de 14 images
 */
function combineAndPrioritizeRefs(
  characterRefs: CharacterReference[],
  locationRefs: LocationReference[],
  options: ResolveOptions
): string[] {
  const allUrls: string[] = [];

  // Stratégie: Alterner entre personnages et lieux pour équilibrer
  // 1. D'abord les images primaires des personnages validés
  // 2. Puis les images primaires des lieux validés
  // 3. Ensuite les images secondaires

  // Personnages validés (primaire)
  for (const ref of characterRefs.filter((r) => r.validated && r.primaryImage)) {
    if (allUrls.length < MAX_REFERENCE_IMAGES && ref.primaryImage) {
      allUrls.push(ref.primaryImage);
    }
  }

  // Lieux validés (primaire)
  for (const ref of locationRefs.filter((r) => r.validated && r.primaryImage)) {
    if (allUrls.length < MAX_REFERENCE_IMAGES && ref.primaryImage) {
      allUrls.push(ref.primaryImage);
    }
  }

  // Personnages non-validés (primaire) si fallback activé
  if (options.fallbackToUnvalidated) {
    for (const ref of characterRefs.filter((r) => !r.validated && r.primaryImage)) {
      if (allUrls.length < MAX_REFERENCE_IMAGES && ref.primaryImage) {
        allUrls.push(ref.primaryImage);
      }
    }
  }

  // Lieux non-validés (primaire) si fallback activé
  if (options.fallbackToUnvalidated) {
    for (const ref of locationRefs.filter((r) => !r.validated && r.primaryImage)) {
      if (allUrls.length < MAX_REFERENCE_IMAGES && ref.primaryImage) {
        allUrls.push(ref.primaryImage);
      }
    }
  }

  // Images secondaires des personnages
  for (const ref of characterRefs) {
    for (const url of ref.referenceImages.slice(1)) {
      if (allUrls.length < MAX_REFERENCE_IMAGES && !allUrls.includes(url)) {
        allUrls.push(url);
      }
    }
  }

  // Images secondaires des lieux
  for (const ref of locationRefs) {
    for (const url of ref.referenceImages.slice(1)) {
      if (allUrls.length < MAX_REFERENCE_IMAGES && !allUrls.includes(url)) {
        allUrls.push(url);
      }
    }
  }

  return allUrls;
}

// ============================================================================
// VALIDATION PRÉ-GÉNÉRATION
// ============================================================================

/**
 * Vérifie si les shots sont prêts pour la génération
 */
export async function checkGenerationReadiness(
  shots: Shot[]
): Promise<GenerationReadinessCheck> {
  const result: GenerationReadinessCheck = {
    ready: true,
    canProceedWithWarnings: true,
    warnings: [],
    errors: [],
    missingCharacterRefs: [],
    missingLocationRefs: [],
    unvalidatedRefs: [],
    stats: {
      totalShots: shots.length,
      totalCharacters: 0,
      totalLocations: 0,
      charactersWithRefs: 0,
      locationsWithRefs: 0,
      validatedCharacters: 0,
      validatedLocations: 0,
    },
  };

  // Collecter tous les IDs uniques
  const allCharacterIds = new Set<string>();
  const allLocationIds = new Set<string>();

  for (const shot of shots) {
    shot.characterIds?.forEach((id) => allCharacterIds.add(id));
    shot.locationIds?.forEach((id) => allLocationIds.add(id));
  }

  result.stats.totalCharacters = allCharacterIds.size;
  result.stats.totalLocations = allLocationIds.size;

  // Charger les données
  const characters = await getCharacters();
  const locations = await getLocations();

  // Vérifier les personnages
  for (const charId of allCharacterIds) {
    const character = characters.find((c) => c.id === charId);

    if (!character) {
      result.missingCharacterRefs.push({
        id: charId,
        name: charId,
        type: "character",
        reason: "missing",
      });
      result.errors.push(`Personnage "${charId}" introuvable`);
      result.ready = false;
      continue;
    }

    const hasRefs = character.referenceImages && character.referenceImages.length > 0;
    const isValidated = character.validated || false;

    if (!hasRefs) {
      result.missingCharacterRefs.push({
        id: charId,
        name: character.name,
        type: "character",
        reason: "no_images",
      });
      result.warnings.push(`Personnage "${character.name}" n'a pas d'images de référence`);
    } else {
      result.stats.charactersWithRefs++;
    }

    if (!isValidated && hasRefs) {
      result.unvalidatedRefs.push({
        id: charId,
        name: character.name,
        type: "character",
        reason: "not_validated",
      });
      result.warnings.push(`Personnage "${character.name}" n'est pas validé`);
    } else if (isValidated) {
      result.stats.validatedCharacters++;
    }
  }

  // Vérifier les lieux
  for (const locId of allLocationIds) {
    const location = locations.find((l) => l.id === locId);

    if (!location) {
      result.missingLocationRefs.push({
        id: locId,
        name: locId,
        type: "location",
        reason: "missing",
      });
      result.errors.push(`Lieu "${locId}" introuvable`);
      result.ready = false;
      continue;
    }

    const hasRefs = location.referenceImages && location.referenceImages.length > 0;
    const isValidated = location.validated || false;

    if (!hasRefs) {
      result.missingLocationRefs.push({
        id: locId,
        name: location.name,
        type: "location",
        reason: "no_images",
      });
      result.warnings.push(`Lieu "${location.name}" n'a pas d'images de référence`);
    } else {
      result.stats.locationsWithRefs++;
    }

    if (!isValidated && hasRefs) {
      result.unvalidatedRefs.push({
        id: locId,
        name: location.name,
        type: "location",
        reason: "not_validated",
      });
      result.warnings.push(`Lieu "${location.name}" n'est pas validé`);
    } else if (isValidated) {
      result.stats.validatedLocations++;
    }
  }

  // Vérifier les URLs locales (seront converties en base64 automatiquement)
  let localUrlCount = 0;
  for (const character of characters) {
    if (character.referenceImages) {
      for (const url of character.referenceImages) {
        if (isLocalUrl(url)) {
          localUrlCount++;
        }
      }
    }
  }
  for (const location of locations) {
    if (location.referenceImages) {
      for (const url of location.referenceImages) {
        if (isLocalUrl(url)) {
          localUrlCount++;
        }
      }
    }
  }

  if (localUrlCount > 0) {
    result.warnings.push(
      `${localUrlCount} URLs locales détectées - seront automatiquement converties en base64 pour Replicate`
    );
  }

  // Déterminer si on peut procéder
  if (result.errors.length > 0) {
    result.ready = false;
    result.canProceedWithWarnings = false;
  } else if (result.warnings.length > 0) {
    result.ready = false;
    result.canProceedWithWarnings = true;
  }

  return result;
}

// ============================================================================
// ENRICHISSEMENT DE PROMPTS
// ============================================================================

/**
 * Enrichit un prompt JsonMoostik avec les références d'images
 */
export async function enrichPromptWithReferences(
  prompt: MoostikPrompt | Record<string, unknown>,
  characterIds: string[],
  locationIds: string[]
): Promise<{ prompt: MoostikPrompt | Record<string, unknown>; references: ClusterReferences }> {
  // Résoudre les références
  const references = await resolveReferencesForShot(characterIds, locationIds);

  // Si c'est un JsonMoostik avec des subjects, enrichir avec les reference_image
  const promptRecord = prompt as Record<string, unknown>;
  if (promptRecord && promptRecord.subjects && Array.isArray(promptRecord.subjects)) {
    const enrichedSubjects = (promptRecord.subjects as Array<{ id?: string; name?: string }>).map((subject) => {
      // Trouver la référence correspondante
      const charRef = references.characters.find(
        (r) => r.characterId === subject.id || r.characterName === subject.name
      );

      if (charRef && charRef.primaryImage) {
        return {
          ...subject,
          reference_image: charRef.primaryImage,
        };
      }

      return subject;
    });

    return {
      prompt: {
        ...prompt,
        subjects: enrichedSubjects,
      },
      references,
    };
  }

  return { prompt, references };
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Obtient un résumé des références pour un shot
 */
export async function getReferenceSummaryForShot(
  characterIds: string[],
  locationIds: string[]
): Promise<{
  totalRefs: number;
  validatedRefs: number;
  characterRefs: number;
  locationRefs: number;
  warnings: string[];
}> {
  const refs = await resolveReferencesForShot(characterIds, locationIds);

  return {
    totalRefs: refs.totalCount,
    validatedRefs: refs.validatedCount,
    characterRefs: refs.characters.reduce((sum, c) => sum + c.referenceImages.length, 0),
    locationRefs: refs.locations.reduce((sum, l) => sum + l.referenceImages.length, 0),
    warnings: refs.warnings,
  };
}

/**
 * Vérifie si un shot a toutes les références nécessaires
 */
export async function shotHasAllReferences(
  shot: Shot
): Promise<{ hasAll: boolean; missing: string[] }> {
  const missing: string[] = [];
  const refs = await resolveReferencesForShot(
    shot.characterIds || [],
    shot.locationIds || []
  );

  // Vérifier les personnages
  for (const charId of shot.characterIds || []) {
    const charRef = refs.characters.find((r) => r.characterId === charId);
    if (!charRef || charRef.referenceImages.length === 0) {
      missing.push(`character:${charId}`);
    }
  }

  // Vérifier les lieux
  for (const locId of shot.locationIds || []) {
    const locRef = refs.locations.find((r) => r.locationId === locId);
    if (!locRef || locRef.referenceImages.length === 0) {
      missing.push(`location:${locId}`);
    }
  }

  return {
    hasAll: missing.length === 0,
    missing,
  };
}
