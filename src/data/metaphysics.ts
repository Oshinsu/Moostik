/**
 * MOOSTIK - Système Métaphysique
 *
 * Ce module définit les règles surnaturelles de l'univers MOOSTIK:
 * - Les Voix du Sang: communication avec les morts via le sang consommé
 * - La Mémoire Sanguine: transfert de souvenirs par le sang
 * - Les Pouvoirs Spirituels: capacités des oracles et chamanes
 *
 * Ces règles garantissent la cohérence narrative des éléments fantastiques.
 */

// ============================================================================
// LES VOIX DU SANG
// ============================================================================

/**
 * Système central de la métaphysique Moostik.
 *
 * Quand un Moostik consomme du sang, il n'absorbe pas seulement des nutriments
 * mais aussi des fragments de l'essence spirituelle de la créature dont
 * provient le sang. Ces fragments deviennent "Les Voix du Sang".
 */
export interface BloodVoice {
  /** ID unique de la voix */
  id: string;
  /** Nom de l'être dont provient le sang (si connu) */
  sourceName?: string;
  /** Type de créature */
  sourceType: "moostik" | "human" | "animal" | "unknown";
  /** Force de la connexion (1-10) */
  connectionStrength: number;
  /** La voix peut-elle communiquer activement? */
  canCommunicate: boolean;
  /** Souvenirs accessibles */
  accessibleMemories: MemoryFragment[];
  /** Émotions dominantes de la voix */
  dominantEmotions: BloodEmotion[];
}

/**
 * Fragment de mémoire transmis par le sang
 */
export interface MemoryFragment {
  /** Type de souvenir */
  type: "visual" | "emotional" | "knowledge" | "skill";
  /** Description du souvenir */
  description: string;
  /** Clarté du souvenir (0-1, 1 = parfaitement clair) */
  clarity: number;
  /** Le souvenir peut-il être invoqué volontairement? */
  canInvoke: boolean;
}

/**
 * Émotions transmises par le sang
 */
export type BloodEmotion =
  | "fear"        // Peur au moment de la mort/prélèvement
  | "love"        // Amour (sang familial)
  | "rage"        // Colère
  | "peace"       // Sérénité
  | "confusion"   // Désorientation
  | "longing"     // Nostalgie
  | "protection"  // Instinct de protection
  | "vengeance";  // Désir de vengeance

// ============================================================================
// RÈGLES DE LA MÉMOIRE SANGUINE
// ============================================================================

/**
 * Règles officielles du transfert de mémoire par le sang
 */
export const BLOOD_MEMORY_RULES = {
  /**
   * RÈGLE 1: Dégradation temporelle
   * Plus le sang est "vieux" (temps depuis prélèvement), plus les
   * souvenirs sont fragmentés et confus.
   */
  temporalDegradation: {
    fresh: { hours: 0, clarityMultiplier: 1.0 },        // < 1h: parfait
    recent: { hours: 6, clarityMultiplier: 0.8 },       // < 6h: bon
    old: { hours: 24, clarityMultiplier: 0.5 },         // < 24h: partiel
    ancient: { hours: 168, clarityMultiplier: 0.2 },    // < 1 semaine: fragmenté
    degraded: { hours: Infinity, clarityMultiplier: 0 }, // > 1 semaine: perdu
  },

  /**
   * RÈGLE 2: Affinité génétique
   * Le sang de la même espèce transmet mieux les souvenirs.
   * Le sang familial est encore plus puissant.
   */
  geneticAffinity: {
    sameFamily: 1.5,    // Famille directe: bonus x1.5
    sameSpecies: 1.0,   // Même espèce: normal
    relatedSpecies: 0.6, // Espèce proche: réduit
    differentSpecies: 0.3, // Espèce différente: très réduit
    human: 0.1,         // Humain: presque rien (trop différent)
  },

  /**
   * RÈGLE 3: Volume requis
   * Un minimum de sang est nécessaire pour établir une connexion.
   */
  minimumVolume: {
    whisper: 0.001,     // Micro-goutte: murmures indistincts
    fragment: 0.01,     // Petite goutte: fragment de souvenir
    memory: 0.1,        // Goutte normale: souvenir complet
    communion: 1.0,     // Grande quantité: dialogue possible
  },

  /**
   * RÈGLE 4: Accumulation
   * Les voix s'accumulent avec le temps. Un Moostik âgé peut avoir
   * des centaines de voix, mais la plupart sont dormantes.
   */
  accumulationLimit: {
    baby: 10,      // Bébé: peu de voix
    young: 100,    // Jeune: accumulation modérée
    adult: 500,    // Adulte: nombreuses voix
    elder: 1000,   // Ancien: foule de voix
    oracle: 10000, // Oracle (Mama Zika): multitude
  },
} as const;

// ============================================================================
// CAPACITÉS SPIRITUELLES
// ============================================================================

/**
 * Types de capacités spirituelles liées au sang
 */
export type SpiritualAbility =
  | "blood_listening"    // Écouter les Voix du Sang
  | "memory_diving"      // Plonger dans un souvenir spécifique
  | "voice_channeling"   // Permettre à une voix de parler à travers soi
  | "blood_prophecy"     // Recevoir des visions prophétiques
  | "death_communion"    // Communiquer avec les morts récents
  | "blood_rage"         // Canaliser la rage des voix en combat
  | "ancestral_wisdom"   // Accéder à la sagesse collective
  | "blood_curse";       // Maudire via le sang (rare et tabou)

/**
 * Niveau de maîtrise spirituelle
 */
export type SpiritualMastery = "dormant" | "awakened" | "trained" | "master" | "oracle";

/**
 * Capacités spirituelles par personnage
 */
export const CHARACTER_SPIRITUAL_ABILITIES: Record<string, {
  mastery: SpiritualMastery;
  abilities: SpiritualAbility[];
  voiceCount: number;
  notes: string;
}> = {
  "mama-zika": {
    mastery: "oracle",
    abilities: [
      "blood_listening",
      "memory_diving",
      "voice_channeling",
      "blood_prophecy",
      "death_communion",
      "ancestral_wisdom",
    ],
    voiceCount: 10000,
    notes:
      "Mama Zika entend constamment les Voix du Sang. Elle doit méditer " +
      "pour filtrer le bruit. Ses prophéties sont cryptiques car elle " +
      "mélange les voix de différentes époques.",
  },
  "papy-tik": {
    mastery: "trained",
    abilities: ["blood_listening", "blood_rage", "ancestral_wisdom"],
    voiceCount: 800,
    notes:
      "Papy Tik entend principalement la voix de sa mère Maeli. " +
      "En combat, il peut canaliser la rage collective des morts du génocide.",
  },
  "general-aedes": {
    mastery: "awakened",
    abilities: ["blood_listening", "blood_rage"],
    voiceCount: 400,
    notes:
      "Aedes entend les voix de ses soldats tombés. Cela alimente " +
      "son PTSD mais aussi sa détermination.",
  },
  "evil-pik": {
    mastery: "dormant",
    abilities: [],
    voiceCount: 50,
    notes:
      "Evil Pik ignore les voix, qu'il considère comme des hallucinations. " +
      "Son addiction au sang frais l'empêche d'établir des connexions profondes.",
  },
  "scholar-culex": {
    mastery: "trained",
    abilities: ["memory_diving", "ancestral_wisdom"],
    voiceCount: 200,
    notes:
      "Culex utilise les souvenirs du sang pour ses recherches. " +
      "Il a catalogué des connaissances de générations de Moostik.",
  },
};

// ============================================================================
// RITUELS ET PRATIQUES
// ============================================================================

/**
 * Rituels liés au sang dans la culture Moostik
 */
export const BLOOD_RITUALS = {
  /**
   * RITUEL DE DEUIL
   * Les Moostik conservent une goutte du sang de leurs morts pour
   * pouvoir leur parler une dernière fois.
   */
  mourningRitual: {
    name: "La Dernière Goutte",
    description:
      "Après la mort d'un proche, on conserve une goutte de son sang " +
      "dans une fiole de résine. Pendant 7 jours, on peut boire micro-doses " +
      "pour entendre les dernières paroles du défunt.",
    duration: "7 jours",
    components: ["sang du défunt", "fiole de résine", "cire de bougie"],
  },

  /**
   * RITUEL DE SERMENT
   * Mélanger son sang avec celui d'un autre crée un lien permanent.
   * Les "frères de sang" peuvent sentir les émotions l'un de l'autre.
   */
  bloodOathRitual: {
    name: "Le Serment Écarlate",
    description:
      "Deux Moostik mélangent leur sang et le boivent ensemble. " +
      "Ils deviennent liés spirituellement - capables de sentir " +
      "si l'autre est en danger ou en détresse.",
    duration: "Permanent",
    components: ["sang des deux participants", "coupe rituelle"],
    participants: ["evil-pik", "young-dorval"], // Ont fait ce rituel
  },

  /**
   * RITUEL DE MÉMOIRE
   * À la Cathédrale du Sang, les oracles peuvent invoquer les
   * souvenirs collectifs du clan.
   */
  memoryRitual: {
    name: "La Communion des Ancêtres",
    description:
      "Pratiqué uniquement à la Cathédrale du Sang. L'oracle boit " +
      "du sang mélangé de plusieurs familles et entre en transe. " +
      "Elle peut alors poser des questions aux ancêtres.",
    duration: "1-4 heures",
    components: ["sang de 7 familles différentes", "flamme éternelle", "encens de nectar"],
    location: "cathedral-of-blood",
  },

  /**
   * RITUEL DE NAISSANCE
   * La mère nourrit son nouveau-né avec son propre sang pendant
   * les premiers jours, transmettant souvenirs et protection.
   */
  birthRitual: {
    name: "Le Premier Don",
    description:
      "Pendant 3 jours après la naissance, la mère nourrit la larve " +
      "exclusivement avec son propre sang. Cela crée un lien " +
      "indéfectible et transmet les instincts de survie.",
    duration: "3 jours",
    components: ["sang maternel"],
    notes: "C'est pourquoi Baby Dorval entend toujours la voix de Maeli.",
  },
};

// ============================================================================
// LIMITES ET DANGERS
// ============================================================================

/**
 * Dangers liés à l'usage excessif des capacités spirituelles
 */
export const SPIRITUAL_DANGERS = {
  /**
   * SUBMERSION
   * Trop de voix peuvent noyer la conscience du Moostik.
   * Risque de folie si non maîtrisé.
   */
  submersion: {
    name: "La Noyade Spirituelle",
    description:
      "Quand trop de voix parlent en même temps, le Moostik peut " +
      "perdre son sens de l'identité. Les oracles doivent méditer " +
      "quotidiennement pour rester ancrés.",
    symptoms: ["confusion d'identité", "parler avec d'autres voix", "amnésie"],
    prevention: "Méditation quotidienne, limitation de la consommation",
  },

  /**
   * ADDICTION
   * Le sang frais est enivrant. Certains Moostik deviennent accros
   * à la sensation de connexion qu'il procure.
   */
  addiction: {
    name: "La Soif Rouge",
    description:
      "L'addiction au sang frais empêche d'établir des connexions " +
      "profondes avec les voix. Le junkie cherche la sensation, " +
      "pas la communication.",
    symptoms: ["besoin constant de sang frais", "irritabilité", "isolation"],
    affectedCharacters: ["evil-pik"],
  },

  /**
   * HANTISE
   * Certaines voix refusent de se taire et peuvent prendre le contrôle
   * temporaire du corps du Moostik.
   */
  haunting: {
    name: "La Possession Sanguine",
    description:
      "Une voix particulièrement forte ou traumatisée peut " +
      "temporairement prendre le contrôle du Moostik. Rare mais " +
      "terrifiant.",
    symptoms: ["perte de contrôle", "changement de personnalité", "blackouts"],
    prevention: "Rituels de purification, aide d'un oracle",
  },
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Calcule la clarté d'un souvenir transmis par le sang
 */
export function calculateMemoryClarity(
  hoursOld: number,
  geneticRelation: keyof typeof BLOOD_MEMORY_RULES.geneticAffinity,
  volumeMl: number
): number {
  // Trouver le multiplicateur temporel
  let temporalMultiplier = 0;
  const degradation = BLOOD_MEMORY_RULES.temporalDegradation;
  if (hoursOld < degradation.fresh.hours) {
    temporalMultiplier = degradation.fresh.clarityMultiplier;
  } else if (hoursOld < degradation.recent.hours) {
    temporalMultiplier = degradation.recent.clarityMultiplier;
  } else if (hoursOld < degradation.old.hours) {
    temporalMultiplier = degradation.old.clarityMultiplier;
  } else if (hoursOld < degradation.ancient.hours) {
    temporalMultiplier = degradation.ancient.clarityMultiplier;
  } else {
    temporalMultiplier = degradation.degraded.clarityMultiplier;
  }

  // Multiplicateur génétique
  const geneticMultiplier = BLOOD_MEMORY_RULES.geneticAffinity[geneticRelation];

  // Multiplicateur de volume (logarithmique)
  const volumeMultiplier = Math.min(1, Math.log10(volumeMl * 100 + 1) / 2);

  return Math.min(1, temporalMultiplier * geneticMultiplier * volumeMultiplier);
}

/**
 * Détermine si un personnage peut utiliser une capacité
 */
export function canUseAbility(
  characterId: string,
  ability: SpiritualAbility
): boolean {
  const charAbilities = CHARACTER_SPIRITUAL_ABILITIES[characterId];
  if (!charAbilities) return false;
  return charAbilities.abilities.includes(ability);
}

/**
 * Obtient la description narrative d'une expérience spirituelle
 */
export function describeBloodExperience(
  voiceCount: number,
  mastery: SpiritualMastery
): string {
  if (mastery === "dormant") {
    return "Un murmure distant, comme le vent dans les feuilles.";
  }

  if (voiceCount < 10) {
    return "Quelques voix familières, claires comme des souvenirs d'enfance.";
  }

  if (voiceCount < 100) {
    return "Un chœur de voix, certaines distinctes, d'autres se fondant en murmures.";
  }

  if (voiceCount < 1000) {
    return "Une foule de voix, comme un marché bondé où l'on capte des bribes de conversation.";
  }

  return (
    "Un océan de voix, une symphonie de morts où chaque goutte de sang " +
    "porte l'écho d'une vie entière. Seul un oracle peut naviguer ces eaux."
  );
}
