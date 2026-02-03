/**
 * ══════════════════════════════════════════════════════════════════════════════
 * WHITE LABEL - CONFIGURATION D'UNIVERS GÉNÉRIQUE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Ce fichier définit la structure de configuration pour créer n'importe quel
 * univers de série animée. Basé sur le modèle Moostik/Bloodwings Studio.
 *
 * Source: /home/user/Moostik/src/lib/moostik-bible.ts
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPES DE BASE
// ═══════════════════════════════════════════════════════════════════════════════

export interface ColorPalette {
  primary: string;           // Couleur principale (#hex)
  secondary: string;         // Couleur secondaire
  accent: string;            // Accent
  background: string;        // Fond
  text: string;              // Texte
  highlight: string;         // Mise en valeur
  [key: string]: string;     // Couleurs additionnelles
}

export interface Symbol {
  name: string;
  description: string;
  usage: string;
  meaning: string;
}

export interface Materials {
  [key: string]: string;     // Nom du matériau → Description
}

export interface AnatomyFeature {
  name: string;
  critical?: boolean;        // Si true, DOIT être visible
  description: string;
  style: string;
  details: string[];
}

export interface AgeCharacteristics {
  eyes: string;
  body: string;
  special?: string[];
  [key: string]: string | string[] | undefined;
}

export interface ArchitectureStyle {
  name: string;
  influences: string[];
  forbidden: string[];
}

export interface ArchitectureElements {
  [key: string]: string;     // Type d'élément → Description
}

export interface TechnologyRules {
  era: string;
  allowed: string[];
  forbidden: string[];
}

export interface LoreEvent {
  name: string;
  description: string;
  keyEvents?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: INTERFACE PRINCIPALE - UNIVERSE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export interface UniverseConfig {
  // === MÉTADONNÉES ===
  meta: {
    id: string;                    // ID unique (ex: "moostik", "dragons-realm")
    name: string;                  // Nom de l'univers
    tagline: string;               // Slogan court
    description: string;           // Description longue
    genre: string[];               // Genres (ex: ["fantasy", "dark", "comedy"])
    tone: string[];                // Tons (ex: ["gothic-cute", "dramatic"])
    setting: string;               // Contexte géographique/temporel
    targetAudience: string;        // Public cible
  };

  // === STYLE VISUEL ===
  visualStyle: {
    quality: string;               // Ex: "Premium 3D animated feature film"
    influences: string[];          // Ex: ["Pixar", "Studio Ghibli"]
    aesthetic: string;             // Ex: "Pixar-demonic-cute"
    lighting: string;              // Style d'éclairage
    colorPalette: ColorPalette;
  };

  // === SYMBOLOGIE ===
  symbols: {
    mainEmblem: Symbol;
    materials: Materials;
    motifs: string[];              // Motifs récurrents
  };

  // === ESPÈCE/CRÉATURES PRINCIPALES ===
  species: {
    name: string;                  // Nom de l'espèce (ex: "Moostik")
    namePlural: string;            // Pluriel
    type: string;                  // Ex: "anthropomorphic mosquito"
    anatomy: {
      criticalFeature: AnatomyFeature;  // LA feature qui DOIT être visible
      body: AnatomyFeature;
      eyes: AnatomyFeature;
      [key: string]: AnatomyFeature;    // Autres features
    };
    ageStages: {
      baby: AgeCharacteristics;
      young: AgeCharacteristics;
      adult: AgeCharacteristics;
      elder: AgeCharacteristics;
    };
    equipment: {
      philosophy: string[];
      allowed: string[];
      forbidden: string[];
    };
  };

  // === ARCHITECTURE ===
  architecture: {
    style: ArchitectureStyle;
    elements: ArchitectureElements;
    lighting: {
      primary: string;
      secondary: string;
      forbidden: string[];
    };
    materials: string[];
  };

  // === TECHNOLOGIE ===
  technology: TechnologyRules & {
    combat?: {
      weapons: string;
      tactics: string;
      armor: string;
    };
  };

  // === LORE / HISTOIRE ===
  lore: {
    timeline: {
      [phase: string]: LoreEvent;
    };
    factions?: {
      [factionId: string]: {
        name: string;
        motto?: string;
        leader?: string;
        description: string;
        ranks?: string[];
      };
    };
    secrets?: string[];
    prophecies?: string[];
  };

  // === CULTURE ===
  culture?: {
    rituals?: {
      [ritualId: string]: {
        name: string;
        description: string;
        importance?: string;
        traditions?: string[];
      };
    };
    music?: { [key: string]: string };
    food?: { [key: string]: string };
    beliefs?: { [key: string]: string };
    expressions?: string[];
  };

  // === INVARIANTS (RÈGLES ABSOLUES) ===
  invariants: string[];

  // === NEGATIVE PROMPTS ===
  negativePrompts: {
    global: string[];
    character: string[];
    location: string[];
  };

  // === HUMAINS (si présents) ===
  humans?: {
    ethnicity: string;
    skinTone: string;
    style: string;
    visibility: string;          // Ex: "hands only", "full body", "silhouette"
    rules: string[];
  };

  // === GIGANTISME (échelle relative) ===
  scale?: {
    enabled: boolean;
    type: string;                // Ex: "microscopic", "giant", "normal"
    cues: string[];              // Indices visuels d'échelle
    povRules: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crée une configuration d'univers vide avec les valeurs par défaut
 */
export function createEmptyUniverseConfig(id: string, name: string): UniverseConfig {
  return {
    meta: {
      id,
      name,
      tagline: "",
      description: "",
      genre: [],
      tone: [],
      setting: "",
      targetAudience: "",
    },
    visualStyle: {
      quality: "Premium 3D animated feature film quality",
      influences: [],
      aesthetic: "",
      lighting: "",
      colorPalette: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#FF0000",
        background: "#111111",
        text: "#FFFFFF",
        highlight: "#FFAA00",
      },
    },
    symbols: {
      mainEmblem: {
        name: "",
        description: "",
        usage: "",
        meaning: "",
      },
      materials: {},
      motifs: [],
    },
    species: {
      name: "",
      namePlural: "",
      type: "",
      anatomy: {
        criticalFeature: {
          name: "",
          critical: true,
          description: "",
          style: "",
          details: [],
        },
        body: {
          name: "body",
          description: "",
          style: "",
          details: [],
        },
        eyes: {
          name: "eyes",
          description: "",
          style: "",
          details: [],
        },
      },
      ageStages: {
        baby: { eyes: "", body: "" },
        young: { eyes: "", body: "" },
        adult: { eyes: "", body: "" },
        elder: { eyes: "", body: "" },
      },
      equipment: {
        philosophy: [],
        allowed: [],
        forbidden: [],
      },
    },
    architecture: {
      style: {
        name: "",
        influences: [],
        forbidden: [],
      },
      elements: {},
      lighting: {
        primary: "",
        secondary: "",
        forbidden: [],
      },
      materials: [],
    },
    technology: {
      era: "",
      allowed: [],
      forbidden: [],
    },
    lore: {
      timeline: {},
    },
    invariants: [],
    negativePrompts: {
      global: [],
      character: [],
      location: [],
    },
  };
}

/**
 * Valide une configuration d'univers
 */
export function validateUniverseConfig(config: UniverseConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifications obligatoires
  if (!config.meta.id) errors.push("meta.id est requis");
  if (!config.meta.name) errors.push("meta.name est requis");
  if (!config.species.name) errors.push("species.name est requis");
  if (!config.species.anatomy.criticalFeature.name) {
    errors.push("species.anatomy.criticalFeature est requis");
  }
  if (config.invariants.length === 0) {
    errors.push("Au moins un invariant est requis");
  }
  if (config.negativePrompts.global.length === 0) {
    errors.push("Au moins un negative prompt global est requis");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Génère le system prompt à partir de la config
 */
export function generateSystemPrompt(config: UniverseConfig): string {
  const lines: string[] = [];

  lines.push(`## ${config.meta.name.toUpperCase()} - DIRECTION ARTISTIQUE OFFICIELLE`);
  lines.push("");
  lines.push("### STYLE VISUEL");
  lines.push(`- Style: ${config.visualStyle.quality}, ${config.visualStyle.aesthetic}`);
  lines.push(`- Tone: ${config.meta.tone.join(", ")}`);
  lines.push(`- Quality: ${config.visualStyle.lighting}`);
  lines.push("");

  lines.push("### PALETTE DE COULEURS (STRICTE)");
  for (const [name, hex] of Object.entries(config.visualStyle.colorPalette)) {
    lines.push(`- ${name}: ${hex}`);
  }
  lines.push("");

  lines.push(`### DESIGN DES ${config.species.namePlural.toUpperCase()} - RÈGLES CRITIQUES`);
  const critical = config.species.anatomy.criticalFeature;
  lines.push(`1. **${critical.name.toUpperCase()} TOUJOURS VISIBLE** - ${critical.description}`);

  let ruleNum = 2;
  for (const [key, feature] of Object.entries(config.species.anatomy)) {
    if (key !== "criticalFeature") {
      lines.push(`${ruleNum}. ${feature.name}: ${feature.style}`);
      ruleNum++;
    }
  }
  lines.push("");

  if (config.symbols.mainEmblem.name) {
    lines.push("### SYMBOLE PRINCIPAL");
    lines.push(`- ${config.symbols.mainEmblem.name}: ${config.symbols.mainEmblem.description}`);
    lines.push(`- Usage: ${config.symbols.mainEmblem.usage}`);
    lines.push("");
  }

  lines.push("### ARCHITECTURE");
  lines.push(`- Style: ${config.architecture.style.name}`);
  lines.push(`- Matériaux: ${config.architecture.materials.join(", ")}`);
  lines.push(`- Éclairage: ${config.architecture.lighting.primary}`);
  lines.push(`- INTERDIT: ${config.architecture.style.forbidden.join(", ")}`);
  lines.push("");

  lines.push("### TECHNOLOGIE");
  lines.push(`- Ère: ${config.technology.era}`);
  lines.push(`- INTERDIT: ${config.technology.forbidden.slice(0, 5).join(", ")}`);
  lines.push("");

  if (config.humans) {
    lines.push("### HUMAINS");
    lines.push(`- Ethnicité: ${config.humans.ethnicity}`);
    lines.push(`- Visibilité: ${config.humans.visibility}`);
    lines.push("");
  }

  lines.push("### INVARIANTS ABSOLUS");
  config.invariants.forEach((inv, i) => {
    lines.push(`${i + 1}. ${inv}`);
  });
  lines.push("");

  lines.push("### INTERDIT ABSOLU");
  config.negativePrompts.global.slice(0, 10).forEach(neg => {
    lines.push(`- ${neg}`);
  });

  return lines.join("\n");
}

/**
 * Génère les invariants formatés pour injection dans les prompts
 */
export function getInvariantsArray(config: UniverseConfig): string[] {
  return [
    `Style: ${config.visualStyle.quality}, ${config.visualStyle.aesthetic}`,
    `${config.species.namePlural}: ${config.species.type} with ${config.species.anatomy.criticalFeature.description}`,
    `Architecture: ${config.architecture.style.name} - NO ${config.architecture.style.forbidden[0] || "forbidden elements"}`,
    `Technology: ${config.technology.era} ONLY - ${config.technology.forbidden.slice(0, 3).join(", ")}`,
    ...config.invariants,
  ];
}

/**
 * Génère le negative prompt string
 */
export function getNegativePromptString(
  config: UniverseConfig,
  type: "global" | "character" | "location"
): string {
  const base = config.negativePrompts.global;
  const specific = config.negativePrompts[type] || [];
  return [...base, ...specific].join(", ");
}
