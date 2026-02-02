/**
 * MOOSTIK SCALE REFERENCE - Ratios Mathématiques de Gigantisme
 * 
 * Ce fichier définit les ratios d'échelle précis pour représenter le monde
 * du point de vue d'un moustique (~3mm). Chaque objet humain doit être
 * multiplié par ces facteurs pour apparaître "gigantesque" correctement.
 * 
 * Taille réelle d'un Moostik: ~3mm (0.003m)
 * Échelle humaine de référence: 1.70m
 * Ratio fondamental: 1.70m / 0.003m = ~567x
 * 
 * Pour le Moostik, un humain apparaît donc ~567 fois plus grand.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES FONDAMENTALES
// ═══════════════════════════════════════════════════════════════════════════

export const MOOSTIK_SIZE_MM = 3; // Taille d'un moustique adulte en mm
export const MOOSTIK_SIZE_M = 0.003; // En mètres
export const HUMAN_REFERENCE_HEIGHT_M = 1.70; // Humain moyen en mètres

/** Ratio fondamental: combien de fois plus grand apparaît un humain */
export const FUNDAMENTAL_SCALE_RATIO = Math.round(HUMAN_REFERENCE_HEIGHT_M / MOOSTIK_SIZE_M); // ~567

// ═══════════════════════════════════════════════════════════════════════════
// ÉCHELLES D'OBJETS COMMUNS (du POV Moostik)
// ═══════════════════════════════════════════════════════════════════════════

export const SCALE_REFERENCE = {
  // HUMAINS
  human: {
    adult: {
      realSize: "1.70m",
      perceivedByMoostik: "~965m (presque 1km)",
      description: "Un humain adulte = gratte-ciel titanesque",
      ratio: 567,
    },
    child_5yo: {
      realSize: "1.10m",
      perceivedByMoostik: "~620m",
      description: "Un enfant de 5 ans = tour géante",
      ratio: 367,
    },
    hand: {
      realSize: "18cm",
      perceivedByMoostik: "~102m",
      description: "Une main = terrain de football couvert",
      ratio: 567,
    },
    finger: {
      realSize: "8cm (longueur)",
      perceivedByMoostik: "~45m",
      description: "Un doigt = immeuble de 15 étages",
      ratio: 567,
    },
    fingertip: {
      realSize: "1.5cm",
      perceivedByMoostik: "~8.5m",
      description: "Bout de doigt = petit bâtiment",
      ratio: 567,
    },
  },
  
  // OBJETS MÉNAGERS
  household: {
    byss_aerosol: {
      realSize: "22cm hauteur",
      perceivedByMoostik: "~125m",
      description: "Aérosol BYSS = tour de 40 étages, fusée de mort",
      ratio: 567,
    },
    ceiling_fan: {
      realSize: "1.2m diamètre",
      perceivedByMoostik: "~680m",
      description: "Ventilateur = hélice d'avion géante mortelle",
      ratio: 567,
    },
    table: {
      realSize: "75cm hauteur",
      perceivedByMoostik: "~425m",
      description: "Table = plateau montagneux",
      ratio: 567,
    },
    chair: {
      realSize: "45cm siège",
      perceivedByMoostik: "~255m",
      description: "Chaise = structure architecturale massive",
      ratio: 567,
    },
    jalousie_slat: {
      realSize: "8cm largeur",
      perceivedByMoostik: "~45m",
      description: "Lame de persienne = mur de forteresse",
      ratio: 567,
    },
    thimble: {
      realSize: "2cm hauteur",
      perceivedByMoostik: "~11m",
      description: "Dé à coudre = chope de bar géante",
      ratio: 567,
    },
    needle: {
      realSize: "5cm",
      perceivedByMoostik: "~28m",
      description: "Aiguille = lance monumentale",
      ratio: 567,
    },
    thread: {
      realSize: "0.4mm épaisseur",
      perceivedByMoostik: "~23cm",
      description: "Fil = corde d'escalade",
      ratio: 567,
    },
  },
  
  // NATURE ET MÉTÉO
  nature: {
    raindrop: {
      realSize: "2-5mm diamètre",
      perceivedByMoostik: "1.1m - 2.8m",
      description: "Goutte de pluie = bombe à eau mortelle de 1-3m",
      ratio: 567,
    },
    raindrop_impact: {
      realSize: "~3cm splash",
      perceivedByMoostik: "~17m",
      description: "Impact de goutte = explosion d'eau de 17m",
      ratio: 567,
    },
    grass_blade: {
      realSize: "15cm",
      perceivedByMoostik: "~85m",
      description: "Brin d'herbe = tour végétale",
      ratio: 567,
    },
    leaf: {
      realSize: "10cm",
      perceivedByMoostik: "~57m",
      description: "Feuille = plateforme de saut géante",
      ratio: 567,
    },
    flower_petal: {
      realSize: "3cm",
      perceivedByMoostik: "~17m",
      description: "Pétale = voile architecturale",
      ratio: 567,
    },
    dust_bunny: {
      realSize: "2cm",
      perceivedByMoostik: "~11m",
      description: "Mouton de poussière = obstacle de taille humaine",
      ratio: 567,
    },
    spider_web_thread: {
      realSize: "0.003mm",
      perceivedByMoostik: "~1.7cm",
      description: "Fil d'araignée = corde visible",
      ratio: 567,
    },
  },
  
  // ANIMAUX (du POV Moostik)
  animals: {
    crow: {
      realSize: "45cm (envergure 1m)",
      perceivedByMoostik: "~255m corps, 567m envergure",
      description: "Corbeau = dragon volant, prédateur aérien majeur",
      ratio: 567,
    },
    spider: {
      realSize: "2cm",
      perceivedByMoostik: "~11m",
      description: "Araignée = monstre prédateur de 11m",
      ratio: 567,
    },
    ant: {
      realSize: "3mm",
      perceivedByMoostik: "~1.7m",
      description: "Fourmi = créature de taille Moostik, potentiel allié/rival",
      ratio: 567,
    },
    bee: {
      realSize: "15mm",
      perceivedByMoostik: "~8.5m",
      description: "Abeille = tank volant de 8m",
      ratio: 567,
    },
    fly: {
      realSize: "6mm",
      perceivedByMoostik: "~3.4m",
      description: "Mouche = cousin de taille similaire",
      ratio: 567,
    },
  },
  
  // ARCHITECTURE MOOSTIK (taille réelle micro)
  moostik_architecture: {
    tire_city: {
      realSize: "60cm diamètre pneu",
      perceivedByHuman: "60cm",
      perceivedByMoostik: "340m diamètre",
      description: "Tire City = métropole de 340m de diamètre",
    },
    cathedral: {
      realSize: "5cm hauteur",
      perceivedByMoostik: "28m",
      description: "Cathédrale du Sang = bâtiment de 10 étages",
    },
    bridge: {
      realSize: "3cm longueur",
      perceivedByMoostik: "17m",
      description: "Pont de chitine = structure de 17m",
    },
    dwelling: {
      realSize: "8mm hauteur",
      perceivedByMoostik: "4.5m",
      description: "Habitation = maison de taille humaine",
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convertit une taille réelle en taille perçue par un Moostik
 * @param realSizeInMeters Taille réelle en mètres
 * @returns Taille perçue en mètres (du POV Moostik)
 */
export function toMoostikScale(realSizeInMeters: number): number {
  return realSizeInMeters * FUNDAMENTAL_SCALE_RATIO;
}

/**
 * Convertit une taille perçue par Moostik en taille réelle
 * @param perceivedSizeInMeters Taille perçue en mètres
 * @returns Taille réelle en mètres
 */
export function toRealScale(perceivedSizeInMeters: number): number {
  return perceivedSizeInMeters / FUNDAMENTAL_SCALE_RATIO;
}

/**
 * Génère une description de gigantisme pour les prompts
 * @param objectName Nom de l'objet
 * @param realSizeM Taille réelle en mètres
 * @returns Description formatée pour les prompts
 */
export function generateGigantismCue(objectName: string, realSizeM: number): string {
  const perceived = toMoostikScale(realSizeM);
  
  if (perceived >= 1000) {
    return `${objectName} appears as ${(perceived / 1000).toFixed(1)}km colossal titan from Moostik POV`;
  } else if (perceived >= 100) {
    return `${objectName} appears as ${Math.round(perceived)}m massive structure from Moostik POV`;
  } else if (perceived >= 10) {
    return `${objectName} appears as ${Math.round(perceived)}m tall obstacle from Moostik POV`;
  } else {
    return `${objectName} appears as ${perceived.toFixed(1)}m sized from Moostik POV`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CUES DE GIGANTISME PRÉ-GÉNÉRÉS POUR LES PROMPTS
// ═══════════════════════════════════════════════════════════════════════════

export const GIGANTISM_PROMPT_CUES = {
  // Scènes d'intérieur humain
  indoor_genocide: [
    "BYSS aerosol can appears as 125m tall rocket of death",
    "Human child hand appears as 100m structure of flesh",
    "Fingers appear as 45m pillars crushing everything like Attack on Titan",
    "Ceiling fan overhead as deadly 680m diameter spinning blade",
    "Floor appears as endless terrain, dust bunnies as 11m obstacles",
    "Jalousie slats appear as 45m fortress walls with gaps to escape",
  ],
  
  // Scènes d'extérieur tempête
  outdoor_storm: [
    "Each raindrop appears as 1-3m water bomb falling from sky",
    "Puddles forming appear as sudden lakes",
    "Grass blades appear as 85m towers to navigate through",
    "Crow appears as 255m body dragon diving from clouds",
    "Lightning illuminates everything at COLOSSAL scale",
  ],
  
  // Scènes de Tire City
  tire_city: [
    "Tire interior appears as 340m diameter cathedral space",
    "Dew water surface appears as vast lake with spires rising",
    "Chitin structures appear as proper buildings 4-30m tall",
    "Nectar in thimble appears as 11m tall drinking vessel",
    "Silk threads appear as 23cm thick ropes and bridges",
  ],
  
  // Scènes de Bar Ti Sang
  bar_ti_sang: [
    "Bar counter appears as massive curved structure",
    "Lanterns appear as small moons casting warm glow",
    "Nectar drinks in thimble cups appear as golden chalices",
    "Stage appears as elevated platform for performance",
    "Everything at comfortable Moostik Renaissance scale",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RÈGLES DE PROMPT POUR LE GIGANTISME
// ═══════════════════════════════════════════════════════════════════════════

export const GIGANTISM_RULES = {
  mandatory: [
    "ALWAYS specify scale perception when human objects are present",
    "NEVER show oversized mosquitoes - they must remain 3mm scale",
    "Human elements must appear COLOSSAL from Moostik POV",
    "Use architectural language for human objects (towers, pillars, terrain)",
    "Fingerprints must be visible as terrain ridges on close-up hands",
    "Raindrops must appear as massive water spheres, not normal rain",
  ],
  
  forbidden: [
    "DO NOT show Moostik as human-scale insects",
    "DO NOT show human objects at realistic scale in same frame as Moostik",
    "DO NOT ignore scale difference in any scene with both",
    "DO NOT make rain look normal - each drop is deadly",
    "DO NOT show full human body - only cropped elements (hands, feet, shadow)",
  ],
  
  exceptions: [
    "Pure Moostik architecture scenes can use normal relative scale",
    "Tire City interior uses Moostik Renaissance scale (comfortable)",
    "Bar Ti Sang uses intimate Moostik scale (not COLOSSAL)",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  MOOSTIK_SIZE_MM,
  MOOSTIK_SIZE_M,
  HUMAN_REFERENCE_HEIGHT_M,
  FUNDAMENTAL_SCALE_RATIO,
  SCALE_REFERENCE,
  GIGANTISM_PROMPT_CUES,
  GIGANTISM_RULES,
  toMoostikScale,
  toRealScale,
  generateGigantismCue,
};
