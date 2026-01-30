/**
 * MOOSTIK - Timeline & Temporal System
 *
 * Ce module définit l'échelle temporelle officielle de l'univers MOOSTIK.
 * Toutes les références temporelles dans l'histoire doivent respecter ce système.
 *
 * CHRONOLOGIE PRINCIPALE:
 * - An 0: Le Génocide BYSS (événement fondateur)
 * - An 1-3: L'Exode et la Reconstruction
 * - An 4-8: L'Ère de l'Entraînement
 * - An 9-12: La Préparation de la Vengeance
 * - An 13+: La Guerre du Sang (futur)
 */

// ============================================================================
// CONSTANTES BIOLOGIQUES
// ============================================================================

/**
 * Durée de vie moyenne d'un Moostik en années humaines
 * (basé sur l'observation que les Moostik vivent bien plus longtemps
 * que les moustiques normaux grâce à leur consommation de sang)
 */
export const MOOSTIK_LIFESPAN_YEARS = 25;

/**
 * Âges des phases de vie Moostik (en années humaines)
 */
export const MOOSTIK_LIFE_STAGES = {
  /** 0-2 ans: Larve/bébé */
  baby: { min: 0, max: 2, label: "Larve" },
  /** 3-8 ans: Jeune adulte */
  young: { min: 3, max: 8, label: "Jeune" },
  /** 9-18 ans: Adulte mature */
  adult: { min: 9, max: 18, label: "Adulte" },
  /** 19+ ans: Ancien */
  elder: { min: 19, max: MOOSTIK_LIFESPAN_YEARS, label: "Ancien" },
} as const;

// ============================================================================
// ÉVÉNEMENTS MAJEURS
// ============================================================================

export interface TimelineEvent {
  /** Année relative au Génocide (An 0) */
  year: number;
  /** Mois (1-12, optionnel) */
  month?: number;
  /** Nom de l'événement */
  name: string;
  /** Description détaillée */
  description: string;
  /** Personnages impliqués */
  characterIds: string[];
  /** Lieux impliqués */
  locationIds: string[];
  /** Type d'événement */
  type: "historical" | "personal" | "political" | "military" | "cultural";
  /** Impact sur l'histoire (1-5, 5 étant majeur) */
  significance: 1 | 2 | 3 | 4 | 5;
}

/**
 * Timeline officielle de l'univers MOOSTIK
 */
export const MOOSTIK_TIMELINE: TimelineEvent[] = [
  // ========== PRÉ-GÉNOCIDE (Années négatives) ==========
  {
    year: -50,
    name: "Fondation du Clan Ti-Moun",
    description:
      "Le Clan Ti-Moun s'établit dans un vieux pneu abandonné près de Fort-de-France. " +
      "Début de l'Âge d'Or des Bloodwings.",
    characterIds: [],
    locationIds: ["tire-city"],
    type: "historical",
    significance: 5,
  },
  {
    year: -30,
    name: "Construction de la Cathédrale du Sang",
    description:
      "Édification du monument spirituel le plus important de la civilisation Moostik. " +
      "Consacré aux Voix du Sang, les esprits des ancêtres.",
    characterIds: [],
    locationIds: ["cathedral-of-blood"],
    type: "cultural",
    significance: 4,
  },
  {
    year: -20,
    name: "Naissance du Général Aedes",
    description:
      "Aedes naît dans une famille de guerriers. " +
      "Dès son plus jeune âge, il montre des aptitudes exceptionnelles au combat.",
    characterIds: ["general-aedes"],
    locationIds: ["tire-city"],
    type: "personal",
    significance: 3,
  },
  {
    year: -5,
    name: "Fondation de l'Académie du Sang",
    description:
      "L'érudit Culex fonde l'Académie, dédiée à l'étude de l'anatomie humaine " +
      "et des techniques de survie. Il n'avait que 3 ans.",
    characterIds: ["scholar-culex"],
    locationIds: ["academy-of-blood"],
    type: "cultural",
    significance: 3,
  },
  {
    year: -1,
    name: "Naissance de Dorval",
    description:
      "Dorval naît dans la famille royale du Clan Ti-Moun. " +
      "Sa mère Maeli pressent qu'il accomplira de grandes choses.",
    characterIds: ["baby-dorval", "mama-dorval"],
    locationIds: ["tire-city", "nursery-pods"],
    type: "personal",
    significance: 4,
  },

  // ========== AN 0: LE GÉNOCIDE ==========
  {
    year: 0,
    month: 8,
    name: "Le Génocide BYSS",
    description:
      "Un enfant martiniquais de 5 ans découvre une bombe insecticide BYSS. " +
      "En jouant, il pulvérise la Cité du Pneu, exterminant 90% du Clan Ti-Moun. " +
      "La mère de Dorval (Maeli) meurt en protégeant son bébé sous ses ailes.",
    characterIds: ["baby-dorval", "mama-dorval", "general-aedes", "child-killer"],
    locationIds: ["tire-city", "creole-house"],
    type: "military",
    significance: 5,
  },
  {
    year: 0,
    month: 8,
    name: "Le Sauvetage de Dorval",
    description:
      "Le Général Aedes, gravement blessé, trouve Baby Dorval dans les décombres. " +
      "Il jure de l'élever et de lui enseigner l'art de la vengeance.",
    characterIds: ["baby-dorval", "general-aedes"],
    locationIds: ["genocide-memorial"],
    type: "personal",
    significance: 5,
  },

  // ========== AN 1-3: L'EXODE ET LA RECONSTRUCTION ==========
  {
    year: 1,
    name: "L'Exode vers le Fort Sang-Noir",
    description:
      "Les survivants (environ 200 Moostik) migrent vers un vieux fort abandonné. " +
      "Aedes prend le commandement militaire.",
    characterIds: ["general-aedes", "baby-dorval"],
    locationIds: ["fort-sang-noir"],
    type: "military",
    significance: 4,
  },
  {
    year: 2,
    name: "Fondation du Bar Ti Sang",
    description:
      "Anopheles, ancien espion, ouvre le Bar Ti Sang comme lieu de rassemblement. " +
      "Il devient le cœur social de la résistance.",
    characterIds: ["bartender-anopheles"],
    locationIds: ["bar-ti-sang"],
    type: "cultural",
    significance: 3,
  },
  {
    year: 3,
    name: "Érection du Mémorial du Génocide",
    description:
      "Construction du mémorial permanent sur les ruines de l'ancienne cité. " +
      "Les noms de tous les morts sont gravés en bioluminescence.",
    characterIds: [],
    locationIds: ["genocide-memorial"],
    type: "cultural",
    significance: 4,
  },

  // ========== AN 4-8: L'ÈRE DE L'ENTRAÎNEMENT ==========
  {
    year: 4,
    name: "Dorval commence l'entraînement",
    description:
      "À 3 ans (jeune adulte), Dorval débute sa formation guerrière sous Aedes. " +
      "Il montre une rage et une détermination exceptionnelles.",
    characterIds: ["young-dorval", "general-aedes"],
    locationIds: ["fort-sang-noir"],
    type: "personal",
    significance: 4,
  },
  {
    year: 5,
    name: "Arrivée de Mama Zika",
    description:
      "L'oracle Mama Zika rejoint la communauté. Elle entend les Voix du Sang " +
      "et prophétise le destin de Dorval.",
    characterIds: ["mama-zika"],
    locationIds: ["cathedral-of-blood"],
    type: "cultural",
    significance: 3,
  },
  {
    year: 6,
    name: "Le Pacte de Sang",
    description:
      "Evil Pik jure allégeance à Dorval après un duel légendaire. " +
      "Ils deviennent frères de sang malgré leurs personnalités opposées.",
    characterIds: ["young-dorval", "evil-pik"],
    locationIds: ["fort-sang-noir"],
    type: "personal",
    significance: 3,
  },
  {
    year: 7,
    name: "La Première Mission de Tigresse",
    description:
      "Tigresse accomplit sa première mission d'assassinat. " +
      "Elle commence à compter ses victimes (17 au total).",
    characterIds: ["tigresse"],
    locationIds: ["creole-house"],
    type: "military",
    significance: 2,
  },
  {
    year: 8,
    name: "Invention du Sang Synthétique",
    description:
      "Doc Hemoglobin achève ses recherches sur le sang synthétique, " +
      "permettant aux Moostik de survivre sans chasser les humains.",
    characterIds: ["doc-hemoglobin"],
    locationIds: ["academy-of-blood"],
    type: "cultural",
    significance: 4,
  },

  // ========== AN 9-12: PRÉPARATION DE LA VENGEANCE ==========
  {
    year: 9,
    name: "Formation de la Garde Écarlate",
    description:
      "Captain Dengue forme l'unité d'élite de 47 guerriers. " +
      "Dorval en devient le membre le plus prometteur.",
    characterIds: ["captain-dengue", "young-dorval"],
    locationIds: ["fort-sang-noir"],
    type: "military",
    significance: 3,
  },
  {
    year: 10,
    name: "L'Étude de l'Ennemi",
    description:
      "Culex et Dorval commencent l'analyse systématique de l'anatomie humaine. " +
      "Ils identifient les points faibles pour une future attaque.",
    characterIds: ["scholar-culex", "young-dorval"],
    locationIds: ["academy-of-blood"],
    type: "military",
    significance: 4,
  },
  {
    year: 11,
    name: "Le Réseau d'Infiltration",
    description:
      "L'Infiltrator établit un réseau d'espions dans plusieurs maisons humaines. " +
      "Intelligence cruciale sur les habitudes des humains.",
    characterIds: ["infiltrator"],
    locationIds: ["creole-house"],
    type: "military",
    significance: 3,
  },
  {
    year: 12,
    name: "Dorval devient Papy Tik",
    description:
      "À 11 ans, Dorval entre dans la phase d'ancien. " +
      "Son corps vieillit mais sa détermination reste intacte. " +
      "Il adopte le nom 'Papy Tik' en hommage à ses ancêtres.",
    characterIds: ["papy-tik"],
    locationIds: ["bar-ti-sang"],
    type: "personal",
    significance: 5,
  },

  // ========== AN 13+: LA GUERRE DU SANG (FUTUR) ==========
  {
    year: 13,
    name: "L'Appel aux Armes",
    description:
      "Papy Tik rassemble tous les Bloodwings pour lancer l'offensive finale. " +
      "Le moment de la vengeance est venu.",
    characterIds: ["papy-tik", "general-aedes", "evil-pik", "captain-dengue"],
    locationIds: ["fort-sang-noir", "bar-ti-sang"],
    type: "military",
    significance: 5,
  },
];

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Calcule l'âge d'un personnage à un moment donné de la timeline
 */
export function calculateAge(birthYear: number, currentYear: number): number {
  return currentYear - birthYear;
}

/**
 * Détermine le stade de vie d'un Moostik selon son âge
 */
export function getLifeStage(age: number): keyof typeof MOOSTIK_LIFE_STAGES {
  if (age <= MOOSTIK_LIFE_STAGES.baby.max) return "baby";
  if (age <= MOOSTIK_LIFE_STAGES.young.max) return "young";
  if (age <= MOOSTIK_LIFE_STAGES.adult.max) return "adult";
  return "elder";
}

/**
 * Obtient le personnage ID approprié selon l'année de la timeline
 * (pour Dorval qui a plusieurs versions)
 */
export function getDorvalCharacterId(timelineYear: number): string {
  const age = calculateAge(-1, timelineYear); // Dorval né en An -1
  const stage = getLifeStage(age);

  switch (stage) {
    case "baby":
      return "baby-dorval";
    case "young":
    case "adult":
      return "young-dorval";
    case "elder":
      return "papy-tik";
  }
}

/**
 * Filtre les événements par période
 */
export function getEventsByPeriod(
  startYear: number,
  endYear: number
): TimelineEvent[] {
  return MOOSTIK_TIMELINE.filter(
    (event) => event.year >= startYear && event.year <= endYear
  );
}

/**
 * Filtre les événements impliquant un personnage
 */
export function getEventsForCharacter(characterId: string): TimelineEvent[] {
  return MOOSTIK_TIMELINE.filter((event) =>
    event.characterIds.includes(characterId)
  );
}

/**
 * Filtre les événements par lieu
 */
export function getEventsForLocation(locationId: string): TimelineEvent[] {
  return MOOSTIK_TIMELINE.filter((event) =>
    event.locationIds.includes(locationId)
  );
}

/**
 * Obtient la description de la période actuelle
 */
export function getPeriodDescription(year: number): string {
  if (year < 0) return "L'Âge d'Or (Avant le Génocide)";
  if (year === 0) return "Le Génocide BYSS";
  if (year <= 3) return "L'Exode et la Reconstruction";
  if (year <= 8) return "L'Ère de l'Entraînement";
  if (year <= 12) return "La Préparation de la Vengeance";
  return "La Guerre du Sang";
}

// ============================================================================
// ÂGES DES PERSONNAGES PRINCIPAUX
// ============================================================================

/**
 * Années de naissance des personnages principaux (relatif à An 0)
 */
export const CHARACTER_BIRTH_YEARS: Record<string, number> = {
  "general-aedes": -20,
  "scholar-culex": -8,
  "bartender-anopheles": -15,
  "mama-zika": -40, // Très ancienne
  "evil-pik": -2,
  "tigresse": -4,
  "captain-dengue": -12,
  "doc-hemoglobin": -10,
  "infiltrator": -5,
  "singer-stegomyia": -6,
  "baby-dorval": -1,
  "mama-dorval": -18, // Morte à An 0
};

/**
 * Calcule l'âge d'un personnage principal à une année donnée
 */
export function getCharacterAge(
  characterId: string,
  timelineYear: number
): number | null {
  const birthYear = CHARACTER_BIRTH_YEARS[characterId];
  if (birthYear === undefined) return null;
  return calculateAge(birthYear, timelineYear);
}
