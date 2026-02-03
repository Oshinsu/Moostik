/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EXEMPLE WHITE LABEL - DRAGONS REALM
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Exemple complet d'un univers créé avec le système white label.
 * Démontre comment configurer une série animée différente de Moostik.
 *
 * Thème: Dragons miniatures vivant dans un jardin japonais
 * ══════════════════════════════════════════════════════════════════════════════
 */

import type { UniverseConfig } from "../universe-config";
import type { Character, Location } from "../types";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION DE L'UNIVERS
// ═══════════════════════════════════════════════════════════════════════════════

export const DRAGONS_REALM_CONFIG: UniverseConfig = {
  // === MÉTADONNÉES ===
  meta: {
    id: "dragons-realm",
    name: "Dragons Realm",
    tagline: "Les gardiens du jardin éternel",
    description: `
      Dans un jardin japonais ancestral, une civilisation de dragons miniatures
      vit cachée parmi les bonsaïs et les lanternes de pierre. Ces créatures
      de la taille d'un colibri gardent l'équilibre entre le monde des esprits
      et le monde des humains, utilisant leur souffle élémentaire pour protéger
      le jardin sacré contre les forces du chaos.
    `,
    genre: ["fantasy", "adventure", "spiritual"],
    tone: ["serene", "mystical", "epic-miniature"],
    setting: "Jardin japonais traditionnel, Kyoto, époque contemporaine",
    targetAudience: "Famille, 8+ ans",
  },

  // === STYLE VISUEL ===
  visualStyle: {
    quality: "Premium 3D animated feature film quality, Studio Ghibli-inspired",
    influences: ["Studio Ghibli", "Pixar", "Traditional Japanese Art"],
    aesthetic: "Ghibli-ethereal with micro-scale wonder",
    lighting: "Soft natural light with magical sparkles, golden hour preferred",
    colorPalette: {
      primary: "#2D5A3D",       // Vert mousse
      secondary: "#8B4513",     // Brun bois
      accent: "#FFD700",        // Or (souffle de feu)
      background: "#F5F5DC",    // Beige crème
      text: "#1A1A1A",          // Noir encre
      highlight: "#FF6B35",     // Orange flamme
      water: "#4A90A4",         // Bleu étang
      sakura: "#FFB7C5",        // Rose sakura
      jade: "#00A86B",          // Jade (écailles précieuses)
    },
  },

  // === SYMBOLOGIE ===
  symbols: {
    mainEmblem: {
      name: "Cercle du Souffle",
      description: "Un cercle représentant les 4 éléments (feu, eau, terre, air) entrelacés",
      usage: "Gravé sur les lanternes, tatoué sur les ailes des dragons adultes",
      meaning: "L'équilibre des forces - les dragons sont les gardiens de l'harmonie",
    },
    materials: {
      jadeScale: "Écailles de jade - signe de sagesse et de statut",
      silkThread: "Fil de soie d'araignée - pour harnais et décorations",
      petalPaper: "Papier de pétale de cerisier - pour parchemins sacrés",
      dewDrop: "Goutte de rosée cristallisée - monnaie et gemmes",
      mossVelvet: "Mousse veloutée - literie et vêtements",
    },
    motifs: [
      "Vagues stylisées (eau)",
      "Flammes dansantes (feu)",
      "Feuilles d'érable (terre)",
      "Nuages en spirale (air)",
      "Fleurs de cerisier tombantes",
      "Carpes koï (alliés aquatiques)",
    ],
  },

  // === ESPÈCE PRINCIPALE: DRAGONS ===
  species: {
    name: "Ryujin",
    namePlural: "Ryujin",
    type: "miniature eastern dragon, serpentine body, feathered wings",

    anatomy: {
      criticalFeature: {
        name: "Souffle Élémentaire",
        critical: true,
        description: "Flamme/vapeur/poussière/vent visible près de la gueule ou des narines",
        style: "Subtle elemental glow near nostrils or open mouth, matching element color",
        details: [
          "Feu: Lueur orange-dorée",
          "Eau: Vapeur bleutée",
          "Terre: Poussière dorée scintillante",
          "Air: Tourbillons translucides",
          "Toujours visible même au repos (légère fumée)",
        ],
      },
      body: {
        name: "Corps Serpentin",
        description: "Corps long et sinueux, écailles iridescentes",
        style: "Serpentine body with iridescent scales, smooth flowing movement",
        details: [
          "Longueur: 15-30cm (taille d'un colibri à un écureuil)",
          "Écailles: Iridescentes avec reflets jade/or",
          "Queue: Longue et effilée, utilisée pour l'équilibre",
          "Pattes: 4 petites pattes avec griffes délicates",
        ],
      },
      eyes: {
        name: "Yeux de Sagesse",
        description: "Grands yeux expressifs avec pupilles verticales",
        style: "Large expressive eyes with vertical pupils, warm amber or jade green",
        details: [
          "Couleur: Ambre (feu), Jade (terre), Saphir (eau), Argent (air)",
          "Pupilles verticales comme les félins",
          "Très expressifs, style Ghibli",
          "Brillent légèrement dans l'obscurité",
        ],
      },
      wings: {
        name: "Ailes Plumées",
        description: "Ailes de plumes légères, style oiseau-papillon",
        style: "Feathered wings with butterfly-like patterns, translucent edges",
        details: [
          "Plumes iridescentes avec motifs d'aile de papillon",
          "Semi-translucides aux extrémités",
          "Peuvent se replier élégamment le long du corps",
          "Patterns uniques à chaque individu",
        ],
      },
      horns: {
        name: "Cornes de Cerf",
        description: "Petites cornes ramifiées comme des bois de cerf miniatures",
        style: "Small antler-like horns, branching elegantly, polished bone color",
        details: [
          "Ramifications indiquent l'âge",
          "Les anciens ont des cornes plus élaborées",
          "Parfois décorées de fils d'or",
        ],
      },
      whiskers: {
        name: "Moustaches Sensorielles",
        description: "Longues moustaches sensorielles style dragon oriental",
        style: "Long sensory whiskers, flowing like silk threads",
        details: [
          "4-6 moustaches de chaque côté",
          "Détectent les perturbations spirituelles",
          "Bougent avec les émotions",
        ],
      },
    },

    ageStages: {
      baby: {
        eyes: "ÉNORMES yeux ronds pleins de curiosité",
        body: "Corps court et potelé, queue courte",
        wings: "Ailes duveteuses pas encore formées",
        horns: "Petits boutons de cornes",
        special: ["Ne peut pas encore voler", "Souffle instable (hoquet de flammes)"],
      },
      young: {
        eyes: "Yeux vifs et alertes",
        body: "Corps élancé en développement",
        wings: "Ailes complètes mais patterns simples",
        horns: "Premières ramifications",
        special: ["Apprend à voler", "Souffle contrôlé mais faible"],
      },
      adult: {
        eyes: "Yeux sages avec profondeur",
        body: "Corps gracieux et proportionné",
        wings: "Ailes majestueuses avec patterns complexes",
        horns: "Cornes pleinement ramifiées",
        special: ["Vol maîtrisé", "Souffle puissant"],
      },
      elder: {
        eyes: "Yeux anciens avec sagesse millénaire",
        body: "Corps plus long, écailles plus pâles",
        wings: "Ailes légèrement usées mais nobles",
        horns: "Cornes élaborées parfois cassées",
        special: [
          "Barbe de moustaches blanches",
          "Souffle le plus puissant mais utilisé rarement",
          "Peut communiquer avec les esprits",
        ],
      },
    },

    equipment: {
      philosophy: [
        "Tout équipement doit être naturel et organique",
        "Léger pour ne pas gêner le vol",
        "Esthétique japonaise traditionnelle",
      ],
      allowed: [
        "Colliers de perles de rosée",
        "Brassards de fil de soie",
        "Petits sacs en pétale de lotus",
        "Amulettes gravées dans des graines",
        "Capes tissées de mousse",
      ],
      forbidden: [
        "Armures métalliques",
        "Armes fabriquées",
        "Vêtements humains",
        "Objets en plastique ou métal moderne",
        "Technologie",
      ],
    },
  },

  // === ARCHITECTURE ===
  architecture: {
    style: {
      name: "Jardin Japonais Micro-échelle",
      influences: ["Architecture traditionnelle japonaise", "Jardins zen", "Nature organique"],
      forbidden: [
        "Architecture occidentale moderne",
        "Béton ou métal industriel",
        "Lignes droites artificielles",
        "Éclairage électrique",
      ],
    },
    elements: {
      pagodas: "Mini-pagodes construites dans les troncs de bonsaï creux",
      bridges: "Ponts en arc faits de brindilles laquées rouge",
      lanterns: "Lanternes de pierre miniatures avec lueurs de lucioles",
      torii: "Portails torii tissés de tiges de bambou",
      ponds: "Flaques d'eau de pluie transformées en étangs sacrés",
      gardens: "Jardins zen avec gravier de sable fin et rochers-montagnes",
    },
    lighting: {
      primary: "Lumière naturelle filtrée à travers les feuilles",
      secondary: "Lueurs de lucioles et champignons bioluminescents",
      forbidden: [
        "Lumière électrique",
        "Néons",
        "Éclairage artificiel moderne",
      ],
    },
    materials: [
      "Bambou (structures)",
      "Pierre de jardin (fondations)",
      "Mousse (isolation, confort)",
      "Pétales séchés (toitures)",
      "Soie d'araignée (liens)",
      "Résine d'arbre (colle, finitions)",
      "Coquilles de noix (bols, conteneurs)",
    ],
  },

  // === TECHNOLOGIE ===
  technology: {
    era: "Nature-magique traditionnel japonais",
    allowed: [
      "Parchemins de pétales pour l'écriture",
      "Encre de baies pour calligraphie",
      "Instruments de musique en bambou et feuilles",
      "Médecine à base de plantes et rosée",
      "Navigation par les étoiles et courants d'air",
      "Communication par chants et vibrations d'ailes",
    ],
    forbidden: [
      "Toute technologie humaine moderne",
      "Électricité",
      "Machines",
      "Métal forgé industriellement",
      "Plastique",
      "Armes fabriquées",
    ],
    combat: {
      weapons: "SOUFFLE ÉLÉMENTAIRE uniquement - leur don naturel est leur seule arme",
      tactics: "Formations de vol coordonnées, embuscades aériennes, boucliers de souffle combinés",
      armor: "Aucune - ils comptent sur leur agilité et leur souffle",
    },
  },

  // === LORE ===
  lore: {
    timeline: {
      ancientPact: {
        name: "Le Pacte Ancien",
        description: `
          Il y a mille ans, les premiers Ryujin ont fait un pacte avec les Kami (esprits)
          du jardin. En échange de la protection du jardin sacré, ils ont reçu le don
          du Souffle Élémentaire et la longévité.
        `,
        keyEvents: [
          "Apparition des premiers Ryujin",
          "Rencontre avec le Grand Kami du Jardin",
          "Signature du Pacte en flammes sacrées",
          "Attribution des 4 éléments aux 4 clans",
        ],
      },
      goldenAge: {
        name: "L'Âge d'Or",
        description: `
          Pendant des siècles, les Ryujin ont prospéré dans le jardin. Ils ont construit
          leurs villages dans les bonsaïs, établi des routes aériennes entre les lanternes,
          et maintenu l'harmonie avec la nature.
        `,
        keyEvents: [
          "Construction de la Pagode du Cœur dans le plus vieux bonsaï",
          "Établissement du Conseil des Quatre Souffles",
          "Première alliance avec les carpes koï",
          "Création de l'école des jeunes souffles",
        ],
      },
      theDisturbance: {
        name: "La Perturbation",
        description: `
          Le jardin a été vendu à un nouveau propriétaire qui veut le "moderniser".
          Les machines menacent de détruire les bonsaïs ancestraux. Les Kami sont
          perturbés, et l'équilibre du jardin est en danger.
        `,
        keyEvents: [
          "Arrivée des humains avec leurs machines",
          "Premier bonsaï abattu - refuge de 50 familles détruit",
          "Réveil du Kami de la Colère",
          "Appel aux armes des 4 clans",
        ],
      },
    },

    factions: {
      fireBreathers: {
        name: "Les Souffles de Flamme (Hi-no-Iki)",
        motto: "La flamme éclaire et protège",
        leader: "Grand-père Kasai",
        description: "Clan du feu - guerriers et protecteurs. Vivent près des lanternes de pierre.",
        ranks: ["Braise (novice)", "Flamme (guerrier)", "Brasier (vétéran)", "Fournaise (maître)"],
      },
      waterSingers: {
        name: "Les Chanteurs d'Eau (Mizu-no-Uta)",
        motto: "L'eau coule, l'eau guérit",
        leader: "Matriarche Shizuku",
        description: "Clan de l'eau - guérisseurs et diplomates. Vivent près de l'étang aux carpes.",
        ranks: ["Goutte (novice)", "Ruisseau (soigneur)", "Cascade (maître)", "Océan (sage)"],
      },
      earthKeepers: {
        name: "Les Gardiens de la Terre (Tsuchi-no-Ban)",
        motto: "La terre se souvient",
        leader: "Ancien Iwa",
        description: "Clan de la terre - bâtisseurs et archivistes. Vivent dans les racines du vieux pin.",
        ranks: ["Graine (novice)", "Pousse (ouvrier)", "Racine (maître)", "Montagne (sage)"],
      },
      windDancers: {
        name: "Les Danseurs du Vent (Kaze-no-Mai)",
        motto: "Le vent voit tout",
        leader: "Maîtresse Hayate",
        description: "Clan de l'air - éclaireurs et messagers. Vivent dans les hauteurs des bambous.",
        ranks: ["Brise (novice)", "Rafale (éclaireur)", "Tempête (guerrier)", "Typhon (maître)"],
      },
    },

    secrets: [
      "Le plus vieux bonsaï cache l'entrée du monde des Kami",
      "Les carpes koï peuvent voir l'avenir dans les reflets de l'eau",
      "Grand-père Kasai a perdu son aile droite en protégeant le jardin d'un chat",
      "Il existe un cinquième élément - le Vide - connu seulement des plus anciens",
      "La lanterne centrale ne s'est jamais éteinte depuis le Pacte",
    ],

    prophecies: [
      "Quand les quatre souffles s'uniront, même les machines s'arrêteront",
      "L'enfant aux ailes de papillon réveillera le Grand Kami",
      "Le jardin mourra trois fois avant de renaître éternel",
    ],
  },

  // === CULTURE ===
  culture: {
    rituals: {
      firstFlight: {
        name: "Premier Vol (Hatsu-tobi)",
        description: "Cérémonie où un jeune Ryujin vole pour la première fois devant tout le clan",
        importance: "Marque le passage à l'âge adulte",
        traditions: [
          "Bénédiction par l'ancien du clan",
          "Don d'une perle de rosée",
          "Vol autour de la lanterne centrale 3 fois",
        ],
      },
      breathCeremony: {
        name: "Cérémonie du Souffle",
        description: "Révélation de l'élément d'un jeune dragon",
        importance: "Détermine le clan d'appartenance",
      },
      moonDance: {
        name: "Danse de la Lune (Tsuki-no-Mai)",
        description: "Célébration mensuelle à la pleine lune",
        traditions: [
          "Vol synchronisé des 4 clans",
          "Chants anciens",
          "Offrandes aux Kami",
        ],
      },
    },
    music: {
      dragonSong: "Chants mélodieux utilisés pour la communication longue distance",
      windFlute: "Flûtes de bambou jouées par les Danseurs du Vent",
      waterDrums: "Percussion sur les feuilles de lotus flottantes",
    },
    food: {
      nectarDew: "Rosée du matin - boisson de base",
      pollenCakes: "Gâteaux de pollen - nourriture festive",
      honeyDrops: "Gouttes de miel - friandise rare",
      steamedPetals: "Pétales cuits à la vapeur de souffle",
    },
    beliefs: {
      kamiRespect: "Les Kami vivent dans chaque élément du jardin",
      balanceIs: "L'équilibre entre les 4 éléments maintient l'harmonie",
      ancestorSpirits: "Les ancêtres guident depuis l'au-delà",
    },
    expressions: [
      "Que ton souffle soit chaud (bénédiction)",
      "Par les écailles de mes ancêtres (juron)",
      "L'eau trouve toujours son chemin (patience)",
      "Même le plus petit dragon peut déplacer des montagnes (courage)",
    ],
  },

  // === INVARIANTS ===
  invariants: [
    "Style: Ghibli-ethereal 3D feature film quality, soft lighting, magical atmosphere",
    "Ryujin: MICROSCOPIC dragons (15-30cm) with serpentine bodies, feathered wings, visible elemental breath",
    "SOUFFLE ÉLÉMENTAIRE TOUJOURS VISIBLE - subtle glow/smoke near nostrils",
    "Setting: Traditional Japanese garden at micro-scale, bonsai-sized architecture",
    "Technology: Nature-magic ONLY - no modern tech, no electricity",
    "Humans: Japanese ethnicity ONLY if shown, usually only hands or feet visible from Ryujin POV",
    "Lighting: Natural filtered light, bioluminescent glow, lantern light - NO electric lights",
    "Colors: Jade greens, warm ambers, soft pinks (sakura), deep browns",
    "Architecture: Japanese traditional at micro-scale - pagodas, torii, zen gardens",
    "Scale: Everything from Ryujin POV - flowers are trees, pebbles are boulders",
  ],

  // === NEGATIVE PROMPTS ===
  negativePrompts: {
    global: [
      "western architecture",
      "modern buildings",
      "electricity",
      "technology",
      "machines",
      "plastic",
      "metal industrial",
      "neon lights",
      "cars vehicles",
      "phones computers screens",
      "western dragons",
      "fire-breathing western style",
      "scales without iridescence",
      "dragon without visible breath",
      "anime style",
      "cartoon flat shading",
      "realistic photo",
      "dark gritty",
    ],
    character: [
      "western dragon body shape",
      "bat wings",
      "dragon without elemental breath visible",
      "dragon without whiskers",
      "metal armor",
      "human clothes",
    ],
    location: [
      "western garden",
      "modern architecture",
      "concrete",
      "glass buildings",
      "electric lights",
      "human-scale furniture",
    ],
  },

  // === HUMAINS ===
  humans: {
    ethnicity: "Japanese",
    skinTone: "East Asian skin tones",
    style: "Ghibli-stylized, warm and approachable",
    visibility: "Usually only hands, feet, or silhouettes from Ryujin POV",
    rules: [
      "Shown as GIANTS from Ryujin perspective",
      "Gardening tools are massive weapons",
      "Footsteps cause earthquakes",
      "Children are less threatening than adults",
      "Some humans can sense the Ryujin (rare gift)",
    ],
  },

  // === ÉCHELLE ===
  scale: {
    enabled: true,
    type: "microscopic",
    cues: [
      "Flowers appear as large as trees",
      "Pebbles are boulders",
      "Blades of grass are forests",
      "Water droplets are lakes",
      "Insects are the size of dogs",
      "Bonsai trees are ancient forests",
    ],
    povRules: [
      "Camera always at Ryujin eye level unless establishing shot",
      "Human elements shown as colossal",
      "Weather effects exaggerated (rain = waterfall)",
      "Sounds amplified (footstep = earthquake)",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONNAGES EXEMPLE
// ═══════════════════════════════════════════════════════════════════════════════

export const DRAGONS_REALM_CHARACTERS: Character<"ryujin" | "human">[] = [
  {
    id: "grandfather-kasai",
    name: "Grand-père Kasai",
    speciesType: "ryujin",
    role: "protagonist",
    tier: "T3",
    title: "Chef des Souffles de Flamme",
    description: "Dragon ancien du feu, sage et protecteur du clan Hi-no-Iki",
    backstory: `
      Kasai a perdu son aile droite il y a 200 ans en protégeant le jardin d'un chat errant.
      Depuis, il ne vole plus mais sa sagesse et la puissance de son souffle sont légendaires.
      Il a formé des générations de jeunes dragons et garde les secrets les plus anciens.
    `,
    age: "847 ans",
    visualTraits: [
      "Corps serpentin rouge-orangé avec écailles dorées",
      "Aile gauche magnifique, aile droite cicatrisée (moignon)",
      "Longue barbe de moustaches blanches",
      "Yeux ambre profonds emplis de sagesse",
      "Cornes élaborées avec ramifications complexes",
      "Léger filet de fumée perpétuel des narines",
    ],
    visualSignature: {
      silhouette: "Corps courbé par l'âge, une seule aile",
      face: "Expression bienveillante mais yeux perçants",
      distinctiveFeature: "Aile droite manquante - cicatrice de héros",
    },
    personality: ["Sage", "Patient", "Protecteur", "Nostalgique", "Déterminé"],
    strengths: ["Souffle de feu le plus puissant", "Sagesse millénaire", "Respect de tous"],
    weaknesses: ["Ne peut plus voler", "Parfois trop attaché au passé"],
    quirks: ["Raconte toujours la même histoire du chat", "Tousse des étincelles quand il rit"],
    quotes: [
      "La flamme la plus brillante est celle qui réchauffe les autres",
      "J'ai peut-être perdu mon aile, mais jamais mon feu",
    ],
    relationships: [
      { targetId: "young-hikari", type: "mentor", description: "Son élève la plus prometteuse" },
      { targetId: "matriarch-shizuku", type: "ally", description: "Amie de longue date, équilibre eau/feu" },
    ],
    favoriteLocations: ["fire-lantern-shrine", "old-pine-hollow"],
    referencePrompt: `
      elderly eastern dragon, serpentine body, red-orange scales with gold accents,
      ONE WING ONLY (right wing missing - healed scar), long white whisker beard,
      elaborate antler horns with many branches, amber eyes full of wisdom,
      subtle smoke from nostrils, Ghibli style, warm lighting
    `,
    referenceImages: [],
    validated: false,
  },
  {
    id: "young-hikari",
    name: "Hikari",
    speciesType: "ryujin",
    role: "protagonist",
    tier: "T1",
    title: "Apprentie du Feu",
    description: "Jeune dragonne du feu, curieuse et courageuse, héroïne de l'histoire",
    backstory: `
      Hikari est née avec des ailes aux motifs de papillon inhabituels - un signe de la prophétie.
      Intrépide et parfois imprudente, elle est déterminée à sauver le jardin de la modernisation.
      Elle seule peut peut-être réveiller le Grand Kami.
    `,
    age: "12 ans",
    visualTraits: [
      "Corps élancé rose-corail avec reflets dorés",
      "Ailes avec motifs de papillon monarque",
      "Grands yeux ambre-rose pleins de curiosité",
      "Petites cornes naissantes",
      "Moustaches courtes et expressives",
      "Flamme rose-dorée (rare)",
    ],
    visualSignature: {
      silhouette: "Corps gracieux et énergique",
      face: "Expression curieuse et déterminée",
      distinctiveFeature: "Ailes aux motifs de papillon monarque - unique",
    },
    personality: ["Curieuse", "Courageuse", "Impulsive", "Optimiste", "Empathique"],
    strengths: ["Agilité exceptionnelle", "Intuition spirituelle", "Courage sans limite"],
    weaknesses: ["Imprudente", "Souffle encore instable"],
    quirks: ["Parle aux insectes", "S'endort en volant"],
    quotes: [
      "Si on ne peut pas voler par-dessus, on vole à travers !",
      "Les grands ne voient jamais les petites choses importantes",
    ],
    relationships: [
      { targetId: "grandfather-kasai", type: "student", description: "Son mentor bien-aimé" },
      { targetId: "koi-hanako", type: "best_friend", description: "Sa meilleure amie carpe" },
    ],
    favoriteLocations: ["sakura-branch-lookout", "koi-pond-shore"],
    referencePrompt: `
      young eastern dragon, coral-pink scales with gold shimmer,
      butterfly-patterned feathered wings (monarch butterfly patterns),
      large curious amber-pink eyes, small budding antler horns,
      short expressive whiskers, pink-gold flame breath visible,
      Ghibli style, youthful energy, warm soft lighting
    `,
    referenceImages: [],
    validated: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LIEUX EXEMPLE
// ═══════════════════════════════════════════════════════════════════════════════

export const DRAGONS_REALM_LOCATIONS: Location[] = [
  {
    id: "fire-lantern-shrine",
    name: "Sanctuaire de la Lanterne de Feu",
    type: "temple",
    scale: "tiny",
    region: "Centre du Jardin",
    description: `
      La plus grande lanterne de pierre du jardin abrite le sanctuaire principal du clan du Feu.
      À l'intérieur, une flamme éternelle brûle depuis le Pacte Ancien. Les murs sont gravés
      des noms de tous les chefs du clan.
    `,
    shortDescription: "Sanctuaire du clan du Feu dans la grande lanterne",
    architecture: [
      "Intérieur de lanterne de pierre aménagé en temple",
      "Autel central avec flamme éternelle",
      "Murs gravés de noms ancestraux",
      "Petites alcôves pour méditation",
      "Pont de brindilles vers l'entrée",
    ],
    atmosphere: [
      "Lueur chaude orange-dorée de la flamme éternelle",
      "Odeur d'encens de pin",
      "Silence révérencieux",
      "Chaleur confortable",
    ],
    materials: ["Pierre de lanterne", "Mousse (tapis)", "Résine (décoration)"],
    forbidden: [
      "Eau (éteindrait la flamme)",
      "Architecture moderne",
      "Métal industriel",
    ],
    required: [
      "Flamme éternelle visible",
      "Gravures ancestrales",
      "Lueur chaude",
    ],
    significance: "Cœur spirituel du clan du Feu, lieu de décisions importantes",
    associatedCharacters: ["grandfather-kasai"],
    events: ["Conseil de guerre contre les machines", "Formation de Hikari"],
    referencePrompt: `
      interior of Japanese stone lantern converted to dragon temple,
      eternal flame on central altar, walls carved with dragon names,
      warm orange glow, moss carpeting, tiny meditation alcoves,
      Ghibli style, sacred atmosphere, micro-scale architecture
    `,
    referenceImages: [],
    validated: false,
  },
  {
    id: "koi-pond-shore",
    name: "Rivage de l'Étang aux Koï",
    type: "gathering_place",
    scale: "small",
    region: "Zone Est du Jardin",
    description: `
      Les berges de l'étang aux carpes koï sont le lieu de rencontre entre le clan de l'Eau
      et les autres clans. Les carpes géantes (du point de vue Ryujin) sont des alliées
      précieuses qui partagent leur sagesse et leurs visions.
    `,
    shortDescription: "Lieu de rencontre entre dragons et carpes koï",
    architecture: [
      "Quai miniature en bambou",
      "Pont rouge en arc traversant une racine de nénuphar",
      "Abris sous les feuilles de lotus",
      "Lanternes flottantes sur l'eau",
    ],
    atmosphere: [
      "Reflets dansants sur l'eau",
      "Chants des carpes koï",
      "Bruissement des nénuphars",
      "Fraîcheur apaisante",
    ],
    materials: ["Bambou", "Feuilles de lotus", "Pétales de fleurs"],
    required: [
      "Eau visible",
      "Carpes koï (géantes du POV dragon)",
      "Végétation aquatique",
    ],
    significance: "Lieu de diplomatie et de prophéties",
    associatedCharacters: ["young-hikari", "matriarch-shizuku"],
    referencePrompt: `
      koi pond shore from tiny dragon perspective,
      giant koi fish visible in water, miniature bamboo pier,
      red arched bridge over lotus root, lotus leaf shelters,
      floating paper lanterns, Ghibli style, peaceful atmosphere,
      water reflections, dappled sunlight
    `,
    referenceImages: [],
    validated: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT INDEX
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  config: DRAGONS_REALM_CONFIG,
  characters: DRAGONS_REALM_CHARACTERS,
  locations: DRAGONS_REALM_LOCATIONS,
};
