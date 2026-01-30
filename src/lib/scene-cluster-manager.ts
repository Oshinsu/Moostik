/**
 * MOOSTIK - Scene Cluster Manager
 * 
 * Ce service analyse les épisodes et crée des clusters de scènes
 * pour une génération d'images cohérente visuellement.
 * 
 * Types de clusters:
 * - Par acte narratif (si définis dans l'épisode)
 * - Par lieu (shots consécutifs au même endroit)
 * - Par personnages (shots avec les mêmes personnages)
 */

import type { Episode, Shot } from "@/types";
import type {
  SceneCluster,
  ClusterType,
  ClusterAnalysisResult,
  Act,
  ClusterReferences,
  ClusterReferenceMap,
} from "@/types/scene-cluster";
import { createEmptyCluster } from "@/types/scene-cluster";
import { resolveReferencesForShot } from "./reference-resolver";

// ============================================================================
// ANALYSE D'ÉPISODE
// ============================================================================

/**
 * Analyse un épisode et crée tous les clusters possibles
 */
export async function analyzeEpisode(episode: Episode & { acts?: Act[] }): Promise<ClusterAnalysisResult> {
  const actClusters: SceneCluster[] = [];
  const locationClusters: SceneCluster[] = [];
  const characterClusters: SceneCluster[] = [];
  const allClusters: SceneCluster[] = [];
  const clusteredShotIds = new Set<string>();

  // 1. Clusters par acte (si définis)
  if (episode.acts && episode.acts.length > 0) {
    for (const act of episode.acts) {
      const cluster = createActCluster(act, episode.shots);
      if (cluster.shotIds.length > 0) {
        actClusters.push(cluster);
        allClusters.push(cluster);
        cluster.shotIds.forEach((id) => clusteredShotIds.add(id));
      }
    }
  }

  // 2. Clusters par lieu (shots consécutifs au même lieu)
  const locClusters = createLocationClusters(episode.shots);
  for (const cluster of locClusters) {
    locationClusters.push(cluster);
    allClusters.push(cluster);
    cluster.shotIds.forEach((id) => clusteredShotIds.add(id));
  }

  // 3. Clusters par personnages (mêmes personnages ensemble)
  const charClusters = createCharacterClusters(episode.shots);
  for (const cluster of charClusters) {
    characterClusters.push(cluster);
    allClusters.push(cluster);
    cluster.shotIds.forEach((id) => clusteredShotIds.add(id));
  }

  // Trouver les shots non-clusterisés
  const unclustered = episode.shots
    .filter((shot) => !clusteredShotIds.has(shot.id))
    .map((shot) => shot.id);

  return {
    episodeId: episode.id,
    clusters: allClusters,
    actClusters,
    locationClusters,
    characterClusters,
    unclustered,
    totalShots: episode.shots.length,
    totalClusters: allClusters.length,
  };
}

/**
 * Crée un cluster à partir d'un acte narratif
 */
function createActCluster(act: Act, shots: Shot[]): SceneCluster {
  const cluster = createEmptyCluster(
    `act-${act.id}`,
    `Acte ${act.number}: ${act.title}`,
    "act"
  );

  // Trouver les shots de cet acte
  const actShots = shots.filter((shot) => act.shotIds.includes(shot.id));
  cluster.shotIds = actShots.map((s) => s.id);
  cluster.actId = act.id;

  // Collecter les personnages et lieux partagés
  const charCounts = new Map<string, number>();
  const locCounts = new Map<string, number>();

  for (const shot of actShots) {
    shot.characterIds?.forEach((id) => {
      charCounts.set(id, (charCounts.get(id) || 0) + 1);
    });
    shot.locationIds?.forEach((id) => {
      locCounts.set(id, (locCounts.get(id) || 0) + 1);
    });
  }

  // Personnages présents dans plus de 50% des shots
  const threshold = actShots.length * 0.5;
  cluster.sharedCharacterIds = Array.from(charCounts.entries())
    .filter(([_, count]) => count >= threshold)
    .map(([id]) => id);

  cluster.sharedLocationIds = Array.from(locCounts.entries())
    .filter(([_, count]) => count >= threshold)
    .map(([id]) => id);

  // Collecter les types de scènes
  cluster.sceneTypes = [...new Set(actShots.map((s) => s.sceneType))];

  return cluster;
}

/**
 * Crée des clusters par lieu (shots consécutifs au même endroit)
 */
function createLocationClusters(shots: Shot[]): SceneCluster[] {
  const clusters: SceneCluster[] = [];
  let currentCluster: SceneCluster | null = null;
  let currentLocationId: string | null = null;

  for (const shot of shots) {
    const locationId = shot.locationIds?.[0] || null;

    if (locationId && locationId === currentLocationId && currentCluster) {
      // Continuer le cluster actuel
      currentCluster.shotIds.push(shot.id);
      shot.characterIds?.forEach((id) => {
        if (!currentCluster!.sharedCharacterIds.includes(id)) {
          currentCluster!.sharedCharacterIds.push(id);
        }
      });
    } else if (locationId) {
      // Sauvegarder le cluster précédent s'il existe et a plus d'un shot
      if (currentCluster && currentCluster.shotIds.length > 1) {
        clusters.push(currentCluster);
      }

      // Commencer un nouveau cluster
      currentCluster = createEmptyCluster(
        `loc-${locationId}-${shot.id}`,
        `Lieu: ${locationId}`,
        "location"
      );
      currentCluster.shotIds = [shot.id];
      currentCluster.sharedLocationIds = [locationId];
      currentCluster.sharedCharacterIds = [...(shot.characterIds || [])];
      currentLocationId = locationId;
    }
  }

  // Ajouter le dernier cluster s'il a plus d'un shot
  if (currentCluster && currentCluster.shotIds.length > 1) {
    clusters.push(currentCluster);
  }

  return clusters;
}

/**
 * Crée des clusters par personnages (shots avec les mêmes personnages)
 */
function createCharacterClusters(shots: Shot[]): SceneCluster[] {
  const clusters: SceneCluster[] = [];
  const processedShots = new Set<string>();

  for (const shot of shots) {
    if (processedShots.has(shot.id)) continue;
    if (!shot.characterIds || shot.characterIds.length === 0) continue;

    // Trouver tous les shots avec au moins un personnage en commun
    const relatedShots = shots.filter((s) => {
      if (s.id === shot.id || processedShots.has(s.id)) return false;
      if (!s.characterIds || s.characterIds.length === 0) return false;

      // Vérifier s'il y a des personnages en commun
      return shot.characterIds!.some((charId) => s.characterIds!.includes(charId));
    });

    if (relatedShots.length > 0) {
      // Trouver les personnages partagés
      const sharedChars = shot.characterIds.filter((charId) =>
        relatedShots.some((s) => s.characterIds?.includes(charId))
      );

      if (sharedChars.length > 0) {
        const cluster = createEmptyCluster(
          `char-${sharedChars.join("-")}-${shot.id}`,
          `Personnages: ${sharedChars.join(", ")}`,
          "characters"
        );

        cluster.shotIds = [shot.id, ...relatedShots.map((s) => s.id)];
        cluster.sharedCharacterIds = sharedChars;

        // Collecter les lieux
        const locs = new Set<string>();
        [shot, ...relatedShots].forEach((s) => {
          s.locationIds?.forEach((id) => locs.add(id));
        });
        cluster.sharedLocationIds = Array.from(locs);

        clusters.push(cluster);

        // Marquer les shots comme traités
        processedShots.add(shot.id);
        relatedShots.forEach((s) => processedShots.add(s.id));
      }
    }
  }

  return clusters;
}

// ============================================================================
// RÉSOLUTION DES RÉFÉRENCES PAR CLUSTER
// ============================================================================

/**
 * Résout toutes les références pour un cluster
 */
export async function resolveClusterReferences(
  cluster: SceneCluster,
  shots: Shot[]
): Promise<ClusterReferences> {
  // Collecter tous les personnages et lieux uniques du cluster
  const allCharacterIds = new Set<string>(cluster.sharedCharacterIds);
  const allLocationIds = new Set<string>(cluster.sharedLocationIds);

  // Ajouter les IDs des shots du cluster
  for (const shotId of cluster.shotIds) {
    const shot = shots.find((s) => s.id === shotId);
    if (shot) {
      shot.characterIds?.forEach((id) => allCharacterIds.add(id));
      shot.locationIds?.forEach((id) => allLocationIds.add(id));
    }
  }

  // Résoudre les références
  return resolveReferencesForShot(
    Array.from(allCharacterIds),
    Array.from(allLocationIds)
  );
}

/**
 * Prépare les références pour un cluster (format map)
 */
export async function prepareClusterReferenceMap(
  cluster: SceneCluster,
  shots: Shot[]
): Promise<ClusterReferenceMap> {
  const refs = await resolveClusterReferences(cluster, shots);

  const characterMap: Record<string, string[]> = {};
  const locationMap: Record<string, string[]> = {};

  for (const charRef of refs.characters) {
    characterMap[charRef.characterId] = charRef.referenceImages;
  }

  for (const locRef of refs.locations) {
    locationMap[locRef.locationId] = locRef.referenceImages;
  }

  return {
    characters: characterMap,
    locations: locationMap,
  };
}

// ============================================================================
// GÉNÉRATION PAR CLUSTER
// ============================================================================

/**
 * Prépare les shots d'un cluster pour la génération
 */
export async function prepareShotsForClusterGeneration(
  cluster: SceneCluster,
  shots: Shot[]
): Promise<{
  shotId: string;
  characterIds: string[];
  locationIds: string[];
  referenceImages: string[];
}[]> {
  // Résoudre les références du cluster une seule fois
  const clusterRefs = await resolveClusterReferences(cluster, shots);

  // Préparer chaque shot
  return cluster.shotIds.map((shotId) => {
    const shot = shots.find((s) => s.id === shotId);
    if (!shot) {
      return {
        shotId,
        characterIds: [],
        locationIds: [],
        referenceImages: [],
      };
    }

    // Pour chaque shot, on utilise les références du cluster
    // mais on peut aussi ajouter des références spécifiques au shot
    return {
      shotId,
      characterIds: shot.characterIds || [],
      locationIds: shot.locationIds || [],
      referenceImages: clusterRefs.allImageUrls,
    };
  });
}

/**
 * Obtient l'ordre optimal de génération pour un cluster
 */
export function getOptimalGenerationOrder(
  cluster: SceneCluster,
  shots: Shot[]
): string[] {
  const clusterShots = shots.filter((s) => cluster.shotIds.includes(s.id));

  // Si génération séquentielle requise, garder l'ordre original
  if (cluster.coherenceRules.sequentialGeneration) {
    return cluster.shotIds;
  }

  // Sinon, trier par priorité:
  // 1. Shots avec le plus de personnages partagés en premier
  // 2. Shots "establishing" en premier
  return clusterShots
    .sort((a, b) => {
      // Establishing shots en premier
      if (a.sceneType === "establishing" && b.sceneType !== "establishing") return -1;
      if (b.sceneType === "establishing" && a.sceneType !== "establishing") return 1;

      // Shots avec plus de personnages partagés en premier
      const aSharedChars = a.characterIds?.filter((id) =>
        cluster.sharedCharacterIds.includes(id)
      ).length || 0;
      const bSharedChars = b.characterIds?.filter((id) =>
        cluster.sharedCharacterIds.includes(id)
      ).length || 0;

      return bSharedChars - aSharedChars;
    })
    .map((s) => s.id);
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Trouve le meilleur cluster pour un shot
 */
export function findBestClusterForShot(
  shotId: string,
  clusters: SceneCluster[]
): SceneCluster | null {
  // Priorité: act > location > characters
  const typeOrder: ClusterType[] = ["act", "location", "characters", "sequence"];

  for (const type of typeOrder) {
    const cluster = clusters.find(
      (c) => c.type === type && c.shotIds.includes(shotId)
    );
    if (cluster) return cluster;
  }

  return null;
}

/**
 * Obtient les statistiques d'un cluster
 */
export function getClusterStats(cluster: SceneCluster): {
  shotCount: number;
  characterCount: number;
  locationCount: number;
  hasCoherenceRules: boolean;
} {
  return {
    shotCount: cluster.shotIds.length,
    characterCount: cluster.sharedCharacterIds.length,
    locationCount: cluster.sharedLocationIds.length,
    hasCoherenceRules:
      cluster.coherenceRules.mustShareLighting ||
      cluster.coherenceRules.mustShareAtmosphere ||
      cluster.coherenceRules.sequentialGeneration,
  };
}

/**
 * Fusionne deux clusters compatibles
 */
export function mergeClusters(
  cluster1: SceneCluster,
  cluster2: SceneCluster
): SceneCluster {
  return {
    id: `merged-${cluster1.id}-${cluster2.id}`,
    name: `${cluster1.name} + ${cluster2.name}`,
    type: cluster1.type, // Garder le type du premier
    shotIds: [...new Set([...cluster1.shotIds, ...cluster2.shotIds])],
    sharedCharacterIds: [
      ...new Set([...cluster1.sharedCharacterIds, ...cluster2.sharedCharacterIds]),
    ],
    sharedLocationIds: [
      ...new Set([...cluster1.sharedLocationIds, ...cluster2.sharedLocationIds]),
    ],
    referenceImages: {
      characters: {
        ...cluster1.referenceImages.characters,
        ...cluster2.referenceImages.characters,
      },
      locations: {
        ...cluster1.referenceImages.locations,
        ...cluster2.referenceImages.locations,
      },
    },
    coherenceRules: {
      mustShareLighting:
        cluster1.coherenceRules.mustShareLighting ||
        cluster2.coherenceRules.mustShareLighting,
      mustShareAtmosphere:
        cluster1.coherenceRules.mustShareAtmosphere ||
        cluster2.coherenceRules.mustShareAtmosphere,
      sequentialGeneration:
        cluster1.coherenceRules.sequentialGeneration ||
        cluster2.coherenceRules.sequentialGeneration,
    },
    sceneTypes: [...new Set([...(cluster1.sceneTypes || []), ...(cluster2.sceneTypes || [])])],
  };
}
