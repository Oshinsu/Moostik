/**
 * MOOSTIK - Types Location
 */

// ============================================================================
// INTERFACE LOCATION
// ============================================================================

export interface Location {
  id: string;
  name: string;
  type: "moostik_city" | "human_space" | "natural" | "hybrid";
  scale: "micro" | "macro" | "both";
  description: string;
  architecturalFeatures: string[];
  atmosphericElements: string[];
  referencePrompt: string;
  referenceImages: string[];
  validated?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getLocationTypeLabel(type: Location["type"]): string {
  const labels: Record<Location["type"], string> = {
    moostik_city: "Cité Moostik",
    human_space: "Territoire Ennemi",
    natural: "Zone Naturelle",
    hybrid: "Zone Mixte"
  };
  return labels[type];
}

export function getLocationTypeEmoji(type: Location["type"]): string {
  const emojis: Record<Location["type"], string> = {
    moostik_city: "🏛️",
    human_space: "⚠️",
    natural: "🌿",
    hybrid: "🔀"
  };
  return emojis[type];
}

export function getScaleLabel(scale: Location["scale"]): string {
  const labels: Record<Location["scale"], string> = {
    micro: "Échelle Microscopique",
    macro: "Échelle Humaine",
    both: "Multi-échelle"
  };
  return labels[scale];
}
