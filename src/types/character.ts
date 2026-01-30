/**
 * MOOSTIK - Types Character
 */

// ============================================================================
// TYPES DE RELATIONS
// ============================================================================

export type RelationshipType = 
  | "family_parent" 
  | "family_child" 
  | "family_sibling" 
  | "romantic" 
  | "best_friend" 
  | "ally" 
  | "rival" 
  | "enemy" 
  | "mentor" 
  | "student"
  | "colleague"
  | "sidekick";

export interface CharacterRelationship {
  targetId: string;
  type: RelationshipType;
  description?: string;
}

// ============================================================================
// INTERFACE CHARACTER
// ============================================================================

export interface Character {
  id: string;
  name: string;
  type: "moostik" | "human";
  role: "protagonist" | "antagonist" | "supporting" | "background";
  description: string;
  visualTraits: string[];
  personality: string[];
  backstory: string;
  referencePrompt: string;
  referenceImages: string[];
  validated?: boolean;
  // Champs enrichis
  relationships?: CharacterRelationship[];
  favoriteLocations?: string[]; // IDs des lieux
  strengths?: string[];
  weaknesses?: string[];
  quirks?: string[]; // Éléments intéressants/originaux
  quotes?: string[]; // Citations du personnage
  age?: string;
  title?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getRelationshipLabel(type: RelationshipType): string {
  const labels: Record<RelationshipType, string> = {
    family_parent: "Parent",
    family_child: "Enfant",
    family_sibling: "Fratrie",
    romantic: "Romantique",
    best_friend: "Meilleur ami",
    ally: "Allié",
    rival: "Rival",
    enemy: "Ennemi",
    mentor: "Mentor",
    student: "Élève",
    colleague: "Collègue",
    sidekick: "Acolyte"
  };
  return labels[type];
}

export function getRelationshipEmoji(type: RelationshipType): string {
  const emojis: Record<RelationshipType, string> = {
    family_parent: "👨‍👩‍👧",
    family_child: "👶",
    family_sibling: "👥",
    romantic: "💕",
    best_friend: "🤝",
    ally: "🤜🤛",
    rival: "⚔️",
    enemy: "💀",
    mentor: "🎓",
    student: "📚",
    colleague: "👔",
    sidekick: "🐕"
  };
  return emojis[type];
}
