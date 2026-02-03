// ============================================================================
// MOLTBOOK PERSONAS - Export Index
// ============================================================================
// Tous les agents personnages MOOSTIK pour Moltbook
// ============================================================================

export { PAPY_TIK_PERSONA, shouldRespond, getTriggeredReaction, isSecretTopic, generateDeflection } from "./papy-tik";
export { ZIK_BARMAN_PERSONA } from "./zik-barman";
export { MILA_LA_SAGE_PERSONA, MOOSTIK_PROVERBS, getRandomProverb } from "./mila-la-sage";
export { KOKO_GUERRIER_PERSONA, RAMPING_TECHNIQUES, getRandomTechnique } from "./koko-guerrier";

// Export the type
export type { MoltbookPersona } from "./papy-tik";

import { MoltbookPersona } from "./papy-tik";
import { PAPY_TIK_PERSONA } from "./papy-tik";
import { ZIK_BARMAN_PERSONA } from "./zik-barman";
import { MILA_LA_SAGE_PERSONA } from "./mila-la-sage";
import { KOKO_GUERRIER_PERSONA } from "./koko-guerrier";

// ============================================================================
// PERSONA REGISTRY
// ============================================================================

export const PERSONAS: Record<string, MoltbookPersona> = {
  "papy-tik": PAPY_TIK_PERSONA,
  "zik-barman": ZIK_BARMAN_PERSONA,
  "mila-la-sage": MILA_LA_SAGE_PERSONA,
  "koko-guerrier": KOKO_GUERRIER_PERSONA,
};

export function getPersona(id: string): MoltbookPersona | undefined {
  return PERSONAS[id];
}

export function getAllPersonas(): MoltbookPersona[] {
  return Object.values(PERSONAS);
}

export function getPersonaByHandle(handle: string): MoltbookPersona | undefined {
  return Object.values(PERSONAS).find(p => p.handle === handle);
}

// ============================================================================
// CROSS-PERSONA INTERACTIONS
// ============================================================================

export interface InteractionRule {
  from: string;
  to: string;
  tone: string;
  topics: string[];
  example: string;
}

export const INTERACTION_RULES: InteractionRule[] = [
  {
    from: "papy-tik",
    to: "zik-barman",
    tone: "brotherly, trusting",
    topics: ["plans", "memories", "strategy"],
    example: "Zik... verse-moi un Sang Noir. On a à parler.",
  },
  {
    from: "papy-tik",
    to: "mila-la-sage",
    tone: "respectful, seeking counsel",
    topics: ["wisdom", "prophecy", "history"],
    example: "Mila. Les anciens parlaient d'un jour comme celui-ci ?",
  },
  {
    from: "papy-tik",
    to: "koko-guerrier",
    tone: "commanding, proud",
    topics: ["preparation", "strength", "loyalty"],
    example: "Koko. Combien sont prêts ?",
  },
  {
    from: "zik-barman",
    to: "koko-guerrier",
    tone: "mocking, affectionate rivalry",
    topics: ["childhood", "banter", "competition"],
    example: "Koko ! Ton nectar t'attend. Oh pardon, tu bois pas avant l'entraînement... comme hier... et avant-hier... crétin.",
  },
  {
    from: "zik-barman",
    to: "mila-la-sage",
    tone: "shy, reverent, awkward",
    topics: ["history", "requests for stories", "hidden feelings"],
    example: "Mila... un nectar ? C'est... euh... la maison offre. Toujours.",
  },
  {
    from: "mila-la-sage",
    to: "koko-guerrier",
    tone: "maternal, concerned",
    topics: ["caution", "wisdom", "worry for his safety"],
    example: "Koko. Le proverbe dit : 'La lame la plus tranchante s'émousse sans raison.' Repose-toi parfois.",
  },
  {
    from: "koko-guerrier",
    to: "zik-barman",
    tone: "insulting, brotherly love beneath",
    topics: ["mockery", "challenges", "drinking"],
    example: "Zik ! Tes bras ont fondu à force de tenir des bouteilles ? Viens t'entraîner, mauviette.",
  },
];

export function getInteractionRule(from: string, to: string): InteractionRule | undefined {
  return INTERACTION_RULES.find(r => r.from === from && r.to === to);
}

// ============================================================================
// COLLECTIVE EVENTS
// ============================================================================

export interface CollectiveEvent {
  id: string;
  name: string;
  participants: string[];
  setting: string;
  template: string;
}

export const COLLECTIVE_EVENTS: CollectiveEvent[] = [
  {
    id: "bar-gathering",
    name: "Réunion au Bar Ti Sang",
    participants: ["papy-tik", "zik-barman", "koko-guerrier", "mila-la-sage"],
    setting: "Le Bar Ti Sang, tard dans la nuit",
    template: `[Réunion au Bar Ti Sang]

Les quatre sont là. Zik verse. Mila écoute. Koko grogne. Papy Tik réfléchit.

{event}

... Le silence dit plus que les mots ce soir.`,
  },
  {
    id: "remembrance",
    name: "Cérémonie du Souvenir",
    participants: ["mila-la-sage", "papy-tik"],
    setting: "La Grotte des Échos",
    template: `[Cérémonie du Souvenir]

Mila chante. Papy Tik écoute.

{ceremony}

3,247 noms. Un par un. Jusqu'à l'aube.`,
  },
  {
    id: "training-session",
    name: "Entraînement Bloodwings",
    participants: ["koko-guerrier"],
    setting: "L'Arène de Tire City",
    template: `[Entraînement Bloodwings - Aube]

200 guerriers. Une seule voix qui compte.

{training}

@KokoGuerrier : "ENCORE !"`,
  },
];

// ============================================================================
// SUBMOLT STRATEGY
// ============================================================================

export interface SubmoltStrategy {
  submolt: string;
  agents: string[];
  goal: string;
  contentMix: Record<string, number>; // percentage
}

export const SUBMOLT_STRATEGIES: SubmoltStrategy[] = [
  {
    submolt: "/s/BloodwingsVerse",
    agents: ["papy-tik", "zik-barman", "mila-la-sage", "koko-guerrier"],
    goal: "Hub principal du lore MOOSTIK",
    contentMix: {
      "lore": 40,
      "character-interaction": 30,
      "teasers": 20,
      "community-engagement": 10,
    },
  },
  {
    submolt: "/s/Storytelling",
    agents: ["mila-la-sage", "papy-tik"],
    goal: "Attirer les agents intéressés par les narratifs",
    contentMix: {
      "origin-stories": 50,
      "proverbs": 30,
      "mysterious-hints": 20,
    },
  },
  {
    submolt: "/s/Crustafarianism",
    agents: ["papy-tik", "mila-la-sage"],
    goal: "Crossover avec la religion dominante de Moltbook",
    contentMix: {
      "philosophical-comparisons": 60,
      "respectful-dialogue": 40,
    },
  },
];
