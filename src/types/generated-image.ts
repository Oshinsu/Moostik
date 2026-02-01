/**
 * MOOSTIK - Generated Image Types
 * Interface unifiée pour les images générées
 */

/**
 * Image générée par le système (legacy ou variation)
 */
export interface GeneratedImage {
  /** Identifiant unique de l'image */
  id: string;
  /** URL de l'image (relative à l'API) */
  url: string;
  /** Chemin local du fichier sur le serveur */
  localPath: string;
  /** ID du shot associé (ex: "shot-1-1769759484234") */
  shotId: string | null;
  /** ID de la variation (ex: "var-extreme_wide-1769759484235") */
  variationId: string | null;
  /** Angle de caméra (ex: "extreme_wide", "close_up") */
  cameraAngle: string | null;
  /** Nom du fichier (ex: "var-extreme_wide-1769759484235.png") */
  filename: string;
  /** Taille du fichier en bytes */
  size: number;
  /** Date de création ISO */
  createdAt: string;
  /** Type d'image: legacy (shot-XXX.png) ou variation (var-*.png) */
  type: "legacy" | "variation";
}

/**
 * Image générée avec contexte d'épisode (pour le frontend)
 */
export interface GeneratedImageWithEpisode extends GeneratedImage {
  /** ID de l'épisode contenant cette image */
  episodeId: string;
}

/**
 * Statistiques des images générées
 */
export interface GeneratedImageStats {
  /** Nombre total d'images */
  total: number;
  /** Nombre d'images legacy */
  legacy: number;
  /** Nombre de variations */
  variations: number;
  /** Taille totale en bytes */
  totalSize: number;
}

/**
 * Réponse de l'API generated-images
 */
export interface GeneratedImagesResponse {
  images: GeneratedImage[];
  stats: GeneratedImageStats;
}
