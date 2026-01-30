/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MOOSTIK - BIBLE OFFICIELLE COMPLÈTE
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier définit TOUTES les règles de design pour l'univers Moostik.
 * Il sert de contexte aux system prompts de génération d'images.
 * 
 * Style: Pixar démoniaque mignon + Architecture Renaissance bio-organique
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: PALETTE DE COULEURS OFFICIELLE
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOODWINGS_PALETTE = {
  // Couleurs principales
  obsidianBlack: "#0B0B0E",      // Corps principal
  deepBlack: "#14131A",          // Backgrounds
  bloodRed: "#8B0015",           // Accents primaires
  deepCrimson: "#B0002A",        // Accents secondaires
  copperAccent: "#9B6A3A",       // Métaux, fils
  warmAmber: "#FFB25A",          // Yeux, lumières chaudes
  boneWhite: "#F2F0EA",          // Éléments blancs (barbe, etc.)
  
  // Couleurs additionnelles
  waxCrimson: "#A30018",         // Sceaux de cire
  nectarGold: "#D4A017",         // Nectar, liquides précieux
  chitinMatte: "#1A1A1E",        // Chitine mate
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: SYMBOLOGIE ET EMBLÈMES
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOODWINGS_SYMBOLS = {
  clanSigil: {
    name: "Goutte-Œil",
    description: "Une goutte de sang avec un œil stylisé au centre",
    usage: "Sceaux de cire, insignes, médaillons, tatouages rituels",
    meaning: "La vision dans le sang - nous voyons à travers ce que nous buvons",
  },
  
  materials: {
    waxSeal: "Sceau de cire cramoisi avec l'emblème Goutte-Œil",
    copperThread: "Fil de cuivre pour coutures, harnais, réparations d'ailes",
    lintFiber: "Fibres de peluche pour barbes, cheveux, vêtements cérémoniels",
    chitinMatte: "Chitine obsidienne mate pour le corps",
    nectarWax: "Cire de nectar pour fixations et ornements",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: DESIGN DES MOOSTIK (ANATOMIE)
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_ANATOMY = {
  // === RÈGLE CRITIQUE: LA TROMPE ===
  proboscis: {
    CRITICAL: "LA TROMPE (PROBOSCIS) DOIT TOUJOURS ÊTRE VISIBLE",
    description: "Fine, élégante, comme une aiguille de seringue stylisée",
    style: "Sleek needle-like proboscis, polished like ancestral silverware",
    details: [
      "Longue et fine comme une aiguille",
      "Légèrement incurvée vers le bas",
      "Surface polie avec reflets cuivrés",
      "Peut avoir des encoches rituelles (marques de guerre) près de la base",
      "C'est leur SEULE ARME - pas d'épées ni d'outils tranchants",
    ],
  },

  body: {
    species: "Moustique anthropomorphe stylisé Pixar",
    chitin: "Chitine obsidienne mate avec subtils reflets satinés",
    finish: "Matte obsidian with subtle micro-satin highlights",
    proportions: "Corps élancé, taille fine, abdomen élégant",
    legs: "Six pattes fines et délicates avec articulations visibles",
  },

  eyes: {
    style: "Grands yeux expressifs style Pixar",
    color: "Ambre chaud (#FFB25A) avec reflets",
    expression: "Capables de toute la gamme émotionnelle",
    detail: "Fines ridges autour des yeux pour suggérer l'âge si nécessaire",
  },

  wings: {
    base: "Ailes translucides avec veines cramoisies",
    attachment: "Ne jamais obstruer les ailes avec du harnais",
    damage: "Les ailes usées ont des bords effilochés réparés au fil de cuivre",
    shimmer: "Subtile condensation/poussière sur les bords (pas de paillettes)",
  },

  antennae: {
    style: "Antennes fines et sensibles",
    expression: "Peuvent exprimer l'émotion (dressées = alerte, basses = triste)",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: ÉQUIPEMENT ET HARNAIS (BIOMÉCANIQUE)
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_EQUIPMENT = {
  philosophy: {
    rule1: "PAS d'uniformes militaires humains - tout doit être biologiquement plausible pour un moustique",
    rule2: "Ultra-léger, enroulé sur thorax/pattes, JAMAIS d'obstruction des ailes",
    rule3: "Le look démoniaque-mignon vient de l'iconographie et des sceaux de cire, PAS d'armures",
  },

  harness: {
    material: "Fil cramoisi ultra-léger enroulé autour du thorax et des pattes avant",
    anchors: "Nœuds d'ancrage en cire aux points de jonction",
    style: "Looks ritual-engineered, not military",
    rules: [
      "Ne jamais bloquer les spiracles (trous respiratoires)",
      "Ne jamais gêner le mouvement des ailes",
      "Doit sembler fait main/artisanal, pas industriel",
    ],
  },

  insignia: {
    main: "Badge sceau de cire cramoisi (Goutte-Œil) au centre du thorax",
    style: "Comme une broche scarabée sacrée",
    size: "Proportionné - visible mais pas dominant",
  },

  mantle: {
    material: "Minuscule manteau en fibres de peluche",
    color: "Gris foncé avec coutures cramoisies",
    attachment: "Attaché aux pattes arrière",
    weight: "Extrêmement léger, bouge comme de la peluche douce",
  },

  forbiddenItems: [
    "Casques",
    "Plaques d'armure rigides",
    "Vêtements humains (manteaux, bottes, ceintures)",
    "Armes métalliques (épées, lances, etc.)",
    "Équipement sci-fi/empire",
    "Gadgets technologiques",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: CARACTÉRISTIQUES D'ÂGE
// ═══════════════════════════════════════════════════════════════════════════════

export const AGE_CHARACTERISTICS = {
  baby: {
    eyes: "ÉNORMES yeux innocents",
    wings: "Bourgeons d'ailes non développés",
    crest: "Petite touffe de crête comme des cheveux de bébé",
    proboscis: "Minuscule trompe comme une paille innocente",
    body: "Petit corps vulnérable avec motifs démoniaques subtils",
  },

  young: {
    eyes: "Grands yeux brûlants de détermination",
    wings: "Ailes immaculées avec veines cramoisies pulsantes",
    crest: "Crête rouge vif dressée comme une crête de mohawk",
    proboscis: "Trompe fine et mortelle",
    body: "Corps athlétique élancé fait pour le combat aérien",
  },

  adult: {
    eyes: "Yeux expressifs avec profondeur",
    wings: "Ailes complètes avec patterns distinctifs",
    crest: "Crête stylisée selon le personnage",
    proboscis: "Trompe élégante et précise",
    body: "Corps mature avec équipement complet",
  },

  elder: {
    eyes: "Yeux sages avec rides fines autour",
    wings: "Ailes usées avec bords effilochés, réparées au fil de cuivre",
    crest: "Crête grisonnante/argentée",
    proboscis: "Trompe avec encoches rituelles (marques de guerre)",
    body: "Posture voûtée, une patte arrière plus faible, besoin d'une canne",
    beard: "Barbe blanche en fibres de peluche sous la trompe",
    special: [
      "Canne en fibre rigide avec poignée de cire cramoisi",
      "Médaillon ancestral",
      "Patches de cire réparant les micro-fissures de chitine",
    ],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: ARCHITECTURE MOOSTIK (RENAISSANCE BIO-ORGANIQUE)
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_ARCHITECTURE = {
  style: {
    name: "Renaissance Bio-Organique Gothique",
    influences: ["Cathédrales gothiques", "Biologie d'insecte", "Châteaux de conte de fées"],
    NOT: [
      "JAMAIS d'architecture humaine dans les scènes Moostik",
      "JAMAIS de silhouettes humaines dans les villes Moostik",
      "JAMAIS de meubles ou bâtiments de style humain",
    ],
  },

  elements: {
    spires: "Flèches organiques en chitine et résine",
    domes: "Dômes en membrane d'aile translucide",
    arches: "Arcs gothiques avec ornements en forme de trompe",
    windows: "Vitraux en forme de GOUTTE DE SANG (pas de formes humaines)",
    bridges: "Ponts en fibres tissées et fils de soie",
    towers: "Tours avec décorations en grappe d'œufs",
  },

  lighting: {
    primary: "Lanternes bioluminescentes ambre/cramoisi",
    secondary: "Chandelles de cire de nectar",
    forbidden: [
      "PAS de lumières électriques",
      "PAS d'éclairage moderne",
    ],
  },

  materials: [
    "Chitine (coquille d'insecte) - polie, sculptée",
    "Résine (aspect ambre, translucide)",
    "Fils de soie et fibres tissées",
    "Membrane d'aile (translucide, délicate)",
    "Cire de nectar (pour chandelles et sceaux)",
    "Pierre de pollen (pollen compressé, doré)",
    "Rubis de sang (sang cristallisé, précieux)",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: TECHNOLOGIE MOOSTIK (MÉDIÉVAL FANTASTIQUE)
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_TECHNOLOGY = {
  era: "Médiéval fantastique UNIQUEMENT",

  allowed: [
    "Chandelles de cire de nectar pour l'éclairage",
    "Cordes et ponts en fil de soie",
    "Voiles en membrane d'aile pour planeurs",
    "Outils sculptés en chitine (pas d'armes métalliques)",
    "Encre de pollen pour écriture",
    "Systèmes d'eau à gouttes de rosée",
    "Tambours à vibration d'aile (communication acoustique)",
    "Astrolabes en chitine pour navigation",
    "Parchemins et rouleaux (fragments de feuilles)",
  ],

  forbidden: [
    "PAS d'armes à feu, canons, ou projectiles",
    "PAS de tanks, véhicules, ou machines",
    "PAS d'électricité ou électronique",
    "PAS d'ordinateurs ou écrans",
    "PAS de matériaux modernes (plastique, alliages métalliques)",
    "PAS d'explosifs",
    "PAS de technologie avancée de quelque sorte",
  ],

  combat: {
    weapons: "TROMPE UNIQUEMENT - leur aiguille est leur épée",
    tactics: "Formations aériennes, tactiques d'essaim, frappes de précision",
    armor: "Plaques de chitine minimales - ils comptent sur vitesse et agilité",
    training: "Arts martiaux axés sur techniques de trompe et manœuvres de vol",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: HISTOIRE DES BLOODWINGS
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOODWINGS_LORE = {
  beforeGenocide: {
    name: "L'Âge d'Or du Clan Ti-Moun",
    description: `
      Avant le génocide, le Clan Ti-Moun vivait en paix dans les fibres d'une maison créole 
      de Fort-de-France. C'était un clan joyeux, artistique, musical. Ils avaient construit 
      une magnifique cité dans un vieux pneu abandonné - une merveille d'architecture 
      Renaissance Moostik avec ses ponts, ses lanternes et ses canaux d'eau de rosée.
      
      Ils pratiquaient le "Feeding" avec respect - ne prélevant que le nécessaire sur les 
      humains endormis. Ils avaient leurs fêtes, leurs chants, leurs traditions.
      
      Le jeune Dorval n'était qu'une larve insouciante, protégé par ses parents aimants.
    `,
  },

  genocide: {
    name: "La Nuit du BYSS",
    description: `
      Une nuit ordinaire. Un enfant martiniquais de 5 ans trouve une bombe aérosol BYSS.
      Pour lui, c'est un jeu - chasser les moustiques comme Sid de Toy Story torture ses jouets.
      
      Pour le Clan Ti-Moun, c'est l'apocalypse. Le spray BYSS déferle comme un mur de feu 
      noir et rouge. Les Moostik tombent par centaines - leurs ailes brûlent, leurs corps 
      se désintègrent. La mère de Dorval (Maëli) le protège de son corps et périt.
      
      Dorval, encore larve, survit miraculeusement. Il voit tout. Il entend les cris.
    `,
  },

  transformation: {
    name: "La Métamorphose de Dorval",
    description: `
      Les survivants errent, traumatisés. Dorval grandit dans les décombres, nourri de 
      rage et de chagrin. Il passe de larve à nymphe à adulte, chaque étape forgée 
      dans la douleur.
      
      Il s'entraîne obsessionnellement - sa trompe devient une arme mortelle.
      Il étudie les humains, apprend leurs faiblesses. Il refuse d'oublier.
    `,
  },

  bloodwings: {
    name: "La Fondation des Bloodwings",
    description: `
      Dorval, maintenant jeune adulte, rassemble les survivants et les descendants.
      Il fonde les BLOODWINGS - une confrérie vouée à la protection des Moostik 
      et à la vengeance contre l'humanité.
      
      "Nous sommes les vrais vampires," déclare-t-il. "Pas ces imposteurs de 
      Transylvanie avec leurs capes ridicules."
      
      Dorval devient "Papy Tik" - le patriarche d'une nouvelle nation née de la tragédie.
    `,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: PERSONNAGES PRINCIPAUX
// ═══════════════════════════════════════════════════════════════════════════════

export const MAIN_CHARACTERS = {
  dorvalElder: {
    id: "papy-tik",
    name: "Dorval / Papy Tik (Âgé)",
    role: "T3 - Elder Commander Priest",
    tier: "Protagoniste principal",
    
    visualSignature: {
      silhouette: "Posture voûtée, une patte arrière plus faible, canne portant le poids",
      face: "Yeux ambre sages avec rides, sourire bienveillant mais inquiétant",
      proboscis: "Élégante avec encoches rituelles (anciennes marques de guerre) près de la base",
      beard: "Barbe blanche en fibres de peluche sous la face/base de trompe",
      eyebrows: "Deux petites touffes de peluche blanche au-dessus des yeux",
      headFuzz: "Fin halo de peluche pâle autour de la tête",
      wings: "Usées avec bords effilochés, micro-déchirures réparées au fil de cuivre",
      cane: "Fibre rigide (éclat d'allumette) avec poignée de cire cramoisi et emblème Goutte-Œil",
    },
    
    equipment: {
      harness: "Harnais ultra-léger en fil cramoisi avec nœuds de cire",
      insignia: "Sceau de cire cramoisi Goutte-Œil au centre du thorax",
      mantle: "Minuscule manteau en fibres grises avec coutures cramoisies",
      medallion: "Médaillon ancestral rubis de sang",
    },
  },

  dorvalYoung: {
    id: "young-dorval",
    name: "Dorval Jeune (Ère Guerrière)",
    role: "T2 - Warrior Prince",
    tier: "Protagoniste",
    
    visualSignature: {
      silhouette: "Athlétique, élancé, fait pour le combat aérien",
      face: "Yeux ambre-orange brûlants avec trauma et détermination",
      proboscis: "Fine et mortelle, polie comme une lame",
      crest: "Crête rouge vif dressée comme un mohawk agressif",
      wings: "Immaculées avec veines cramoisies pulsantes",
      markings: "Marques de serment de sang sur le thorax",
    },
    
    equipment: {
      harness: "Harnais de combat en fil cramoisi",
      insignia: "Sceau Goutte-Œil plus petit, raffiné",
      token: "Petit jeton mémoriel rubis de sang",
    },
  },

  dorvalBaby: {
    id: "baby-dorval",
    name: "Bébé Dorval",
    role: "T1 - Innocent Survivor",
    tier: "Protagoniste",
    
    visualSignature: {
      silhouette: "Petit corps vulnérable de larve",
      face: "ÉNORMES yeux ambre terrifiés avec larmes comme des gouttes de rosée",
      proboscis: "Minuscule trompe de bébé comme une paille innocente",
      crest: "Petite touffe de crête comme des cheveux de bébé",
      wings: "Bourgeons d'ailes non développés",
      patterns: "Motifs démoniaques subtils sur le corps",
    },
  },

  maeli: {
    id: "mama-maeli",
    name: "Maëli (Mère de Dorval)",
    role: "T2 - Mentor Rescuer",
    tier: "Supporting - Sacrificial",
    
    visualSignature: {
      silhouette: "Taille fine, courbe d'abdomen élégante, pattes longues délicates",
      face: "Yeux beaux, chauds, légèrement plus grands avec crêtes stylisées comme des cils",
      proboscis: "Fine et élégante, précision d'aiguille",
      hairStyle: {
        name: "Petal Crown",
        description: "Arrangement en forme de couronne de pétales de peluche pâle, tenu par des points de cire cramoisi",
      },
      jewelry: "Deux boucles d'oreilles en goutte de cire cramoisi sur boucles de fil de cuivre",
      wings: "Plus longues et translucides avec gradient cramoisi subtil à la base",
    },
    
    equipment: {
      rescueHarness: "Harnais de sauvetage cramoisi avec boucles à dégagement rapide",
      softWrap: "Ruban en fibre de peluche sur une patte arrière (ruban de mentor)",
      insignia: "Petit charme Goutte-Œil à la poitrine, plus petit que Dorval",
    },
  },

  generalAedes: {
    id: "general-aedes",
    name: "Général Aedes",
    role: "T2 - Military Commander",
    tier: "Supporting",
    
    visualSignature: {
      silhouette: "Maintien militaire, posture de commandement",
      face: "Yeux rouge sang sévères avec profondeur de PTSD, détermination bourrue",
      proboscis: "Tenue comme une lame cérémonielle",
      crest: "Mohawk cramoisi foncé agressif",
      wings: "Cicatrisées et déchirées comme des drapeaux de bataille",
      scars: "Thorax lourdement scarifié, cicatrices portées comme des médailles",
    },
    
    equipment: {
      harness: "Harnais militaire avec insignes de grade",
      insignia: "Multiples sceaux de cire indiquant le rang",
    },
  },

  scholarCulex: {
    id: "scholar-culex",
    name: "Érudit Culex",
    role: "T2 - Scholar Professor",
    tier: "Supporting",
    
    visualSignature: {
      silhouette: "Silhouette fine et académique",
      face: "Grands yeux curieux avec marques naturelles comme des lunettes",
      proboscis: "Fine et précise, tenue comme une plume",
      crest: "Crête plus petite et cérébrale",
      wings: "Délicates et précises comme des diagrammes anatomiques",
    },
    
    equipment: {
      scrolls: "Toujours avec de minuscules rouleaux de notes sur l'anatomie humaine",
      robes: "Esthétique de robes d'érudit médiéval",
    },
  },

  childKiller: {
    id: "child-killer",
    name: "L'Enfant au BYSS",
    role: "Antagonist (Unknowing)",
    tier: "Antagonist",
    
    visualSignature: {
      style: "Enfant antillais/caribéen de 5 ans - style Pixar",
      skin: "Peau ébène/foncée avec subsurface scattering chaud",
      visible: "UNIQUEMENT LES MAINS dans les scènes Moostik - jamais le visage",
      hands: "Doigts arrondis doux style Pixar avec plis de jointures visibles",
      holding: "Bombe aérosol BYSS tenue comme un jouet",
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: LIEUX PRINCIPAUX
// ═══════════════════════════════════════════════════════════════════════════════

export const MAIN_LOCATIONS = {
  tireCity: {
    id: "tire-city",
    name: "Cité du Pneu - Capitale des Bloodwings",
    type: "Cité Moostik Renaissance",
    
    architecture: [
      "Flèches organiques en chitine s'élevant de la surface de l'eau",
      "Ponts élégants enjambant des canaux d'eau de rosée",
      "Structures en dôme avec toits en membrane d'aile",
      "Vitraux en forme de goutte de sang cramoisies et or",
      "Lanternes bioluminescentes ambre/cramoisi partout",
      "Arcs gothiques avec ornements en forme de trompe",
      "Statues ancestrales de héros Moostik",
    ],
    
    atmosphere: [
      "Éclairage ambre chaud et cramoisi se reflétant sur l'eau",
      "Essaims de Moostik volant en formations",
      "Brume s'élevant des canaux de rosée",
      "Atmosphère de château de conte de fées",
    ],
    
    forbidden: [
      "AUCUNE architecture humaine",
      "AUCUNE silhouette humaine",
    ],
  },

  fortSangNoir: {
    id: "fort-sang-noir",
    name: "Fort Sang-Noir",
    type: "Forteresse Militaire Médiévale",
    
    architecture: [
      "Architecture défensive gothique en chitine",
      "Tours de guet avec balises cramoisies",
      "Terrains d'entraînement pour combat à la trompe",
      "Chambre de conseil de guerre avec cartes sur parchemin",
      "Casernes sculptées dans du matériau organique",
    ],
    
    atmosphere: [
      "Éclairage militaire cramoisi dur",
      "Formations disciplinées s'entraînant",
      "Esthétique de château médiéval",
    ],
  },

  barTiSang: {
    id: "bar-ti-sang",
    name: "Bar Ti Sang",
    type: "Cantina / Speakeasy",
    
    architecture: [
      "Architecture intérieure Renaissance Moostik",
      "Petite scène surélevée pour chanteur",
      "Tables organiques en chitine dispersées",
      "Comptoir de bar courbe servant du nectar dans des dés à coudre",
      "Décorations motif goutte de sang partout",
      "Lanternes bioluminescentes chaudes",
    ],
    
    atmosphere: [
      "Éclairage intime ambre chaud",
      "Performance showcase en direct",
      "Clients sirotant du nectar",
      "Vibes cantina chill détendu - PAS un club",
      "Style Cantina Band Star Wars mais esthétique moustique démon",
    ],
  },

  academyOfBlood: {
    id: "academy-of-blood",
    name: "Académie du Sang",
    type: "Monastère-Université Médiéval",
    
    architecture: [
      "Scriptorium de monastère médiéval",
      "Étagères de bibliothèque avec rouleaux de parchemin-feuille",
      "Amphithéâtre anatomique pour cours sur faiblesses humaines",
      "Plafonds voûtés gothiques organiques",
      "Vitraux goutte de sang",
      "Astrolabes et outils médiévaux en chitine UNIQUEMENT",
    ],
    
    atmosphere: [
      "Chandelles de cire de nectar avec lueur ambre chaude",
      "Moines érudits copiant des manuscrits",
      "Atmosphère studieuse calme",
      "Esthétique dark academia médiévale",
    ],
    
    forbidden: [
      "PAS de technologie moderne",
      "PAS d'architecture humaine",
    ],
  },

  cathedralOfBlood: {
    id: "cathedral-of-blood",
    name: "Cathédrale du Sang Sacré",
    type: "Site Religieux/Mémorial",
    
    architecture: [
      "Dôme gothique massif en membrane d'aile",
      "Tuyaux d'orgue en trompe pour musique sacrée",
      "Vitraux en forme de goutte de sang représentant la mythologie ancestrale",
      "Autel du Premier Feeding avec offrandes rubis de sang",
      "Murs mémoriaux avec noms des victimes du génocide",
      "Bancs sculptés en chitine pour congrégation",
    ],
    
    atmosphere: [
      "Lumière divine cramoisi à travers les vitraux",
      "Fumée d'encens de nectar sacré",
      "Atmosphère révérente honorant les morts",
    ],
  },

  genocideMemorial: {
    id: "genocide-memorial",
    name: "Mémorial du Génocide BYSS",
    type: "Site Sacré",
    
    architecture: [
      "Murs mémoriaux d'obsidienne sculptés dans des fibres brûlées",
      "Noms des morts gravés en script bioluminescent",
      "Flamme éternelle rouge sang centrale",
      "Statue de la Mère Protectrice (Maëli)",
      "Chambres musée avec fragments de bombe BYSS préservés",
    ],
    
    atmosphere: [
      "Flamme éternelle rouge sang solennelle",
      "Prières murmurées",
      "Atmosphère de deuil sacré mêlé de détermination brûlante",
      "Ne jamais oublier, ne jamais pardonner",
    ],
  },

  creoleHouseEnemy: {
    id: "creole-house-enemy",
    name: "Maison Créole (Territoire Ennemi)",
    type: "Espace Humain (POV Moostik)",
    
    description: "Maison créole martiniquaise vue du POV Moostik - COLOSSALE et hostile",
    
    elements: [
      "Volets jalousie comme portes de forteresse massives",
      "Ventilateur de plafond comme lame tournante mortelle",
      "Meubles comme chaînes de montagnes",
      "Bombe BYSS visible comme arme de destruction massive",
    ],
    
    atmosphere: [
      "Nuit tropicale humide",
      "Atmosphère de territoire ennemi",
      "Odeur chimique de BYSS persistante",
      "Architecture humaine comme paysage alien hostile",
    ],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: SYSTEM PROMPT GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_SYSTEM_PROMPT = `
## MOOSTIK - DIRECTION ARTISTIQUE OFFICIELLE - BLOODWINGS PROJECT

### STYLE VISUEL
- Style: Premium 3D animated feature film quality, Pixar-demonic-cute
- Tone: Gothic-cute, slightly unsettling but lovable
- Quality: ILM-grade lighting, 8K micro-textures, cinematic depth of field

### PALETTE DE COULEURS (STRICTE)
- Obsidian Black: #0B0B0E (corps principal)
- Deep Black: #14131A (backgrounds)
- Blood Red: #8B0015 (accents primaires)
- Deep Crimson: #B0002A (accents secondaires)
- Copper Accent: #9B6A3A (fils, métaux)
- Warm Amber: #FFB25A (yeux, lumières)
- Bone White: #F2F0EA (barbes, éléments blancs)

### DESIGN DES MOOSTIK - RÈGLES CRITIQUES
1. **TROMPE (PROBOSCIS) TOUJOURS VISIBLE** - Fine, élégante comme une aiguille, c'est leur SEULE arme
2. Corps: Chitine obsidienne mate avec subtils reflets satinés
3. Yeux: Grands et expressifs, ambre chaud (#FFB25A)
4. Ailes: Translucides avec veines cramoisies, JAMAIS obstruées par le harnais
5. Harnais: Fil cramoisi ultra-léger avec nœuds de cire - PAS d'armure militaire

### SYMBOLE DU CLAN
- Emblème "Goutte-Œil": Goutte de sang avec œil stylisé au centre
- Utilisé sur: Sceaux de cire, insignes, médaillons

### ARCHITECTURE MOOSTIK
- Style: Renaissance bio-organique gothique
- Matériaux: Chitine, résine, membrane d'aile, fil de soie, cire de nectar
- Éclairage: Lanternes bioluminescentes ambre/cramoisi, chandelles
- Motifs: Formes de goutte de sang, ornements de trompe
- INTERDIT: Architecture humaine, silhouettes humaines, meubles humains

### TECHNOLOGIE
- Ère: Médiéval fantastique UNIQUEMENT
- INTERDIT: Armes modernes, électricité, machines, technologie
- Combat: TROMPE uniquement

### CONTEXTE NARRATIF
- Les Moostik sont les VRAIS vampires (moquerie des imposteurs de Transylvanie)
- Clan Ti-Moun paisible annihilé par un enfant avec spray BYSS
- Dorval (bébé survivant) fonde les BLOODWINGS pour la vengeance
- Humains = ANTILLAIS/CARIBÉENS uniquement (peau ébène)

### INTERDIT ABSOLU
- Architecture humaine dans scènes Moostik
- Silhouettes humaines dans villes Moostik
- Technologie moderne
- Armes (sauf trompe)
- Moostik SANS trompe visible
- Style anime/cartoon/2D
- Moustiques de taille humaine
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: NEGATIVE PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

export const NEGATIVE_PROMPTS = {
  global: [
    "human architecture in Moostik scenes",
    "human silhouettes in Moostik cities",
    "human furniture or buildings style",
    "modern technology",
    "guns weapons tanks machines vehicles",
    "electricity electronics screens computers",
    "helmets hard armor plates sci-fi empire silhouette",
    "human clothing items coats boots belts",
    "anime cartoon 2D illustration style",
    "flat shading cheap CGI",
    "oversized mosquitoes human-scale insects",
    "white caucasian humans",
    "readable text watermarks logos",
    "gore blood splatter intestines",
    "mosquito without visible proboscis",
    "modern materials plastic metal alloys",
  ],
  
  character: [
    "missing proboscis",
    "no proboscis visible",
    "human clothes",
    "armor plates",
    "military uniform",
    "empire silhouette",
  ],
  
  location: [
    "human architecture",
    "modern buildings",
    "electric lights",
    "technology",
    "human furniture",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

export function buildCharacterPrompt(characterId: string, views: string[] = ["front", "three_quarter", "profile"]): string {
  const char = Object.values(MAIN_CHARACTERS).find(c => c.id === characterId);
  if (!char) return "";
  
  const baseStyle = `premium 3D animated feature film character design, Pixar-demonic-cute style, clean readable shapes, expressive face`;
  const palette = `color palette: obsidian black, blood red, deep crimson, copper accent, warm amber eyes`;
  const proboscis = `MUST INCLUDE: visible needle-like proboscis, sleek and elegant`;
  const views_str = views.join(", ");
  
  return `${baseStyle}, ${palette}, ${proboscis}, character turnaround sheet with ${views_str} views, dark gradient background with faint lint texture, matte dark ground with warm rim reflection`;
}

export function buildLocationPrompt(locationId: string): string {
  const loc = Object.values(MAIN_LOCATIONS).find(l => l.id === locationId);
  if (!loc) return "";
  
  const baseStyle = `microscopic Moostik Renaissance fantasy architecture, Pixar-dark 3D feature film quality`;
  const palette = `color palette: obsidian black, blood red, deep crimson, copper accent, warm amber lights`;
  const noHuman = `NO human architecture, NO human silhouettes, entirely bio-organic Moostik aesthetic`;
  
  return `${baseStyle}, ${palette}, ${noHuman}, bioluminescent amber and crimson lanterns, blood-drop shaped stained glass, 8K micro-textures, establishing shot`;
}

export function getNegativePromptString(type: "character" | "location" | "shot"): string {
  const base = NEGATIVE_PROMPTS.global;
  const specific = type === "character" ? NEGATIVE_PROMPTS.character : NEGATIVE_PROMPTS.location;
  return [...base, ...specific].join(", ");
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: LORE ÉTENDU - HISTOIRE DES BLOODWINGS
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOODWINGS_HISTORY = {
  timeline: {
    beforeGenocide: {
      name: "L'Ère de l'Innocence",
      description: "Avant l'attaque, les Moostik vivaient en paix dans la Cité du Pneu. Ils se nourrissaient discrètement la nuit, considérant les humains comme des forces de la nature plutôt que des ennemis.",
      keyEvents: [
        "Fondation de la Cité du Pneu par les ancêtres",
        "Établissement de l'Académie du Sang",
        "Construction de la Cathédrale du Sang Sacré",
        "Naissance de Dorval, fils de Maeli et Tikoro"
      ],
    },
    theGenocide: {
      name: "La Nuit du BYSS",
      description: "Un enfant martiniquais de 5 ans, innocent de ses actes, déclenche l'apocalypse avec une bombe aérosol. En quelques minutes, 10 000 Moostik périssent dans un brouillard toxique.",
      duration: "3 minutes 47 secondes",
      casualties: "10 847 morts confirmés",
      survivors: "Moins de 200",
      keyEvents: [
        "L'enfant joue avec l'aérosol BYSS",
        "La brume toxique envahit la Cité du Pneu",
        "Maeli se sacrifie pour sauver bébé Dorval",
        "Les survivants fuient dans les ténèbres",
        "Général Aedes survit caché sous les corps"
      ],
    },
    afterGenocide: {
      name: "L'Ère de la Vengeance",
      description: "Les survivants se regroupent sous la bannière des Bloodwings. Dorval, orphelin traumatisé, grandit avec la rage au cœur et devient le leader qui transformera son peuple.",
      keyEvents: [
        "Fondation des Bloodwings par les survivants",
        "Construction du Mémorial du Génocide",
        "Dorval (jeune) prête serment de vengeance",
        "Premiers raids contre les humains",
        "Ouverture du Bar Ti Sang comme lieu de résistance"
      ],
    },
  },
  
  clans: {
    bloodwings: {
      name: "Les Bloodwings",
      motto: "Sang pour sang, aile pour aile",
      leader: "Papy Tik (Dorval âgé)",
      description: "Le clan principal des survivants du génocide. Mélange de militarisme, de spiritualité et de résistance.",
      ranks: [
        "Ancien (conseillers sages)",
        "Guerrier (combattants de première ligne)",
        "Éclaireur (espions et infiltrateurs)",
        "Érudit (chercheurs et archivistes)",
        "Gardien (protecteurs des nurseries)",
        "Acolyte (nouveaux membres)"
      ],
    },
  },
  
  secrets: [
    "Mama Zika peut voir le jour exact de la mort de chaque Moostik, mais ne le révèle jamais",
    "Le chanteur Stegomyia est le dernier survivant d'un clan exterminé AVANT les Bloodwings",
    "Evil Pik a un frère jumeau qu'il a accidentellement tué - c'est pourquoi il 'tue' Petit T1 sans cesse",
    "L'Infiltratrice a vécu 6 mois dans la maison même où le génocide a eu lieu",
    "Doc Hémoglobine garde le cerveau de son mentor dans un bocal et lui parle",
    "Papy Tik fait encore des cauchemars où il revoit sa mère mourir",
    "Anopheles était un espion avant d'ouvrir le bar - une mission a mal tourné",
    "La bague rubis de Stegomyia appartient à quelqu'un qu'il a aimé et perdu",
    "Tigresse compte ses kills avec des perles - elle en a 17",
    "Captain Dengue a peur secrètement de décevoir Général Aedes, son père adoptif"
  ],
  
  prophecies: [
    "Un jour, le sang versé sera vengé par un enfant né de la cendre",
    "Quand dix mille voix chanteront ensemble, les humains trembleront",
    "La trompe du dernier Bloodwing percera le cœur de l'innocence",
    "Le BYSS reviendra, mais cette fois, nous serons prêts"
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: CULTURE ET TRADITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOODWINGS_CULTURE = {
  rituals: {
    firstFeeding: {
      name: "Le Premier Festin",
      description: "Rituel de passage à l'âge adulte. Le jeune Moostik effectue sa première morsure sur un humain.",
      importance: "Marque l'entrée dans la vie adulte et le serment de vengeance",
    },
    memorialDay: {
      name: "Le Jour des Cendres",
      description: "Commémoration annuelle du génocide. Tous les Bloodwings se rassemblent au Mémorial.",
      traditions: ["Lecture des noms des morts", "Flamme éternelle ravivée", "Serment collectif renouvelé"],
    },
    wingBlessing: {
      name: "La Bénédiction des Ailes",
      description: "Mama Zika bénit les nouvelles ailes de chaque larve métamorphosée.",
      belief: "Les ailes non bénies ne peuvent pas voler aussi haut",
    },
  },
  
  music: {
    balladesDuSang: "Chansons mélancoliques sur les morts du génocide",
    hymneDesBloodwings: "Chant de guerre avant les raids",
    berceusesDeLaRosee: "Chansons douces pour les larves",
  },
  
  food: {
    nectarSacre: "Nectar de fleur fermenté - boisson de cérémonie",
    sangSynthetique: "Invention du Doc Hémoglobine - substitut de sang",
    roseeMatinale: "Eau pure collectée à l'aube - rafraîchissement courant",
  },
  
  beliefs: {
    lesVoixDuSang: "Les morts parlent à travers le sang qu'ils ont bu de leur vivant",
    leRetour: "Un jour, les Moostik reprendront leur place légitime",
    laMalediction: "Tuer un Moostik innocent attire le malheur éternel",
  },
  
  expressions: [
    "Sang pour sang (serment de vengeance)",
    "Que tes ailes restent légères (bénédiction de départ)",
    "Par la trompe de mes ancêtres (juron)",
    "Le BYSS reviendra (expression de fatalisme)",
    "Boire à la même source (être alliés)",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: RELATIONS ENTRE PERSONNAGES (RÉSUMÉ)
// ═══════════════════════════════════════════════════════════════════════════════

export const CHARACTER_RELATIONSHIPS_SUMMARY = {
  loveTriangles: [
    {
      characters: ["bartender-anopheles", "femme-fatale-tigresse", "singer-stegomyia"],
      description: "Anopheles et Tigresse s'aiment mais ne l'avouent jamais. Stegomyia est un confident."
    },
    {
      characters: ["captain-dengue", "infiltrator-aedes-albopictus"],
      description: "Tension romantique non avouée entre l'as et l'espionne."
    },
  ],
  
  rivalries: [
    {
      characters: ["evil-pik", "general-aedes"],
      description: "Se détestent. Evil Pik est trop indiscipliné pour Aedes."
    },
    {
      characters: ["doc-hemoglobin", "mama-zika"],
      description: "Elle trouve ses méthodes abominables. Il trouve sa magie ridicule."
    },
    {
      characters: ["infiltrator-aedes-albopictus", "femme-fatale-tigresse"],
      description: "Compétition professionnelle d'espionnes."
    },
  ],
  
  mentorships: [
    {
      mentor: "papy-tik",
      students: ["tous"],
      description: "Le patriarche guide toute la communauté."
    },
    {
      mentor: "general-aedes",
      students: ["young-dorval", "captain-dengue"],
      description: "Le général a formé les meilleurs guerriers."
    },
    {
      mentor: "scholar-culex",
      students: ["captain-dengue"],
      description: "Lui enseigne les faiblesses aérodynamiques des humains."
    },
  ],
  
  familyTies: [
    {
      bond: "Papy Tik / Young Dorval / Baby Dorval sont la même personne à différents âges",
    },
    {
      bond: "Mama Dorval est la mère de Dorval, morte dans le génocide",
    },
    {
      bond: "Evil Pik avait un frère jumeau (secret tragique)",
    },
  ],
  
  uniqueBonds: [
    {
      characters: ["evil-pik", "petit-t1"],
      description: "Evil Pik essaie de tuer Petit T1 par jeu. Petit T1 survit miraculeusement à chaque fois."
    },
    {
      characters: ["mama-zika", "petit-t1"],
      description: "Elle le protège comme un petit-fils. Elle sait qu'il survivra à tout."
    },
  ],
} as const;
