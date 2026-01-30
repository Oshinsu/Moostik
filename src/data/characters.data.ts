/**
 * MOOSTIK - Données des personnages
 * 
 * Basé sur la Bible Moostik officielle
 * Style: Pixar démoniaque mignon + Architecture Renaissance Moostik
 */

import type { Character } from "@/types/character";

// ============================================================================
// PERSONNAGES MOOSTIK - BASÉS SUR LA BIBLE BLOODWINGS
// ============================================================================

export const MOOSTIK_CHARACTERS: Character[] = [
  {
    id: "papy-tik",
    name: "Papy Tik (Dorval âgé)",
    type: "moostik",
    role: "protagonist",
    title: "Fondateur & Patriarche des Bloodwings",
    age: "Très âgé (survivant du génocide)",
    description: "Le fondateur des Bloodwings. Bébé survivant du génocide devenu patriarche. Ses yeux ambrés portent le poids de mille morts.",
    visualTraits: [
      "Elderly Moostik with wise haunted amber eyes",
      "Silver-tinged wings with old battle scars like cracked stained glass",
      "Faded silver-gray blood-red crest",
      "Thorn walking cane with blood-ruby handle",
      "Ancestral blood-ruby medallion",
      "Dignified noble posture despite age"
    ],
    personality: ["Wise", "Haunted", "Patient strategist", "Darkly humorous", "Protective"],
    backstory: "Seul survivant de sa famille lors du génocide BYSS. Il a fondé les Bloodwings pour que plus jamais un Moostik ne meure sans que cela soit vengé.",
    relationships: [
      { targetId: "young-dorval", type: "family_sibling", description: "Lui-même jeune" },
      { targetId: "baby-dorval", type: "family_sibling", description: "Lui-même bébé" },
      { targetId: "mama-dorval", type: "family_parent", description: "Sa mère décédée" },
      { targetId: "general-aedes", type: "ally", description: "Son bras droit militaire" },
      { targetId: "scholar-culex", type: "mentor", description: "Conseiller stratégique" },
      { targetId: "mama-zika", type: "ally", description: "Guide spirituel" }
    ],
    favoriteLocations: ["cathedral-of-blood", "genocide-memorial", "bar-ti-sang"],
    strengths: ["Sagesse millénaire", "Charisme naturel", "Vision stratégique à long terme", "Respect absolu de tous"],
    weaknesses: ["Hanté par les souvenirs", "Mobilité réduite", "Parfois trop patient"],
    quirks: [
      "Parle souvent aux morts du génocide quand il est seul",
      "Adore se moquer des légendes de vampires humains",
      "Garde un fragment de l'aérosol BYSS comme rappel"
    ],
    quotes: [
      "Nous sommes les vrais vampires. Pas ces imposteurs de Transylvanie.",
      "Chaque goutte de sang humain est une prière pour nos morts.",
      "La patience est l'arme des immortels."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, elderly Pixar-demonic microscopic mosquito patriarch Papy Tik, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE elegant needle-like proboscis polished like ancestral silverware with ritual notch marks near base, white lint-fiber beard beneath proboscis base like soft fluffy whiskers, wise haunted glowing amber eyes (#FFB25A) with crow's-feet ridges, silver-tinged translucent wings with copper-thread repair stitches and frayed edges, faded silver-gray blood-red crest, hunched elder posture with one hind leg weaker, holding thorn cane with crimson wax grip and droplet-eye stamp, crimson thread harness with wax anchor nodes, droplet-eye wax seal insignia on thorax, tiny lint-fiber mantle dark gray with crimson stitching, ancestral blood-ruby medallion, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, cute demonic elder aesthetic, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "young-dorval",
    name: "Jeune Dorval (L'Ère Guerrière)",
    type: "moostik",
    role: "protagonist",
    title: "Prince de la Vengeance",
    age: "Jeune adulte",
    description: "Version jeune adulte du futur Papy Tik. Guerrier hanté par la rage, fondant les Bloodwings dans le feu de la vengeance.",
    visualTraits: [
      "Young warrior Moostik with fierce burning amber-orange eyes",
      "Pristine wings with pulsing crimson veins",
      "Vibrant blood-red mohawk crest",
      "Athletic body built for aerial combat",
      "Blood-oath ritual markings on thorax"
    ],
    personality: ["Fierce", "Driven", "Vengeful", "Charismatic leader", "Barely contained rage"],
    backstory: "Transformé par le trauma du génocide en Prince de la Vengeance. Il a juré sur le sang de ses parents de faire payer les humains.",
    relationships: [
      { targetId: "papy-tik", type: "family_sibling", description: "Lui-même âgé" },
      { targetId: "baby-dorval", type: "family_sibling", description: "Lui-même bébé" },
      { targetId: "mama-dorval", type: "family_child", description: "Sa mère (morte pour lui)" },
      { targetId: "general-aedes", type: "student", description: "S'entraîne avec lui" }
    ],
    favoriteLocations: ["fort-sang-noir", "genocide-memorial"],
    strengths: ["Combat aérien exceptionnel", "Charisme de leader", "Détermination sans faille", "Endurance physique"],
    weaknesses: ["Rage incontrôlable", "Cauchemars récurrents", "Prend trop de risques"],
    quirks: [
      "S'entraîne jusqu'à l'épuisement chaque nuit",
      "Parle à sa mère morte avant chaque bataille",
      "Refuse de boire du sang d'enfant"
    ],
    quotes: [
      "Chaque humain paiera. Un par un.",
      "Le sang de ma mère coule dans mes veines. Sa mort coule dans mon âme."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, young warrior Pixar-demonic microscopic mosquito prince Dorval, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE sleek needle-like proboscis gleaming like polished blade, fierce burning amber-orange eyes (#FFB25A) with trauma and vengeful determination, pristine translucent wings with dramatically pulsing blood-red veins like living stained glass, vibrant scarlet mohawk crest standing aggressive like demonic crown, athletic elegant slender body built for aerial combat, blood-oath tribal markings on thorax, crimson thread harness with wax anchor nodes, droplet-eye wax seal insignia smaller and refined, small memorial blood-ruby token, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, fierce battle-ready heroic pose, expression of noble rage barely contained, dark prince aesthetic, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "baby-dorval",
    name: "Bébé Dorval (Le Génocide)",
    type: "moostik",
    role: "protagonist",
    description: "Le petit larve qui survivra au génocide. Ses yeux énormes voient l'apocalypse de son clan.",
    visualTraits: [
      "Tiny Moostik larva with ENORMOUS terrified amber eyes",
      "Undeveloped wing nubs",
      "Small red crest tuft like baby hair",
      "Dew-drop tears",
      "Vulnerable tiny larval body"
    ],
    personality: ["Innocent", "Terrified", "Vulnerable"],
    backstory: "Le bébé qui survivra grâce au sacrifice de ses parents et deviendra le plus grand leader des Moostik.",
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, tiny baby Pixar-demonic microscopic mosquito larva baby Dorval, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE minuscule baby proboscis like innocent drinking straw barely formed, ENORMOUS terrified glowing ruby-red eyes with dew-drop blood tears, tiny undeveloped wing nubs like baby demon wings, small blood-red crest tuft resembling cute baby devil horns, vulnerable tiny larval body with subtle demonic swirl patterns, expression of pure terrified innocence mixed with inherent demonic heritage, being protectively shielded, aggressively cute yet subtly unsettling dark cherub aesthetic, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red warm-amber, soft emotional lighting with crimson undertones, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "mama-dorval",
    name: "Maman de Dorval",
    type: "moostik",
    role: "supporting",
    description: "La mère qui se sacrifie pour sauver son bébé pendant le génocide. Son dernier acte est un bouclier de son propre corps.",
    visualTraits: [
      "Adult female Moostik with loving protective amber eyes",
      "Elegant wings with crimson lace patterns",
      "Graceful red crest like tiara",
      "Maternal protective pose"
    ],
    personality: ["Protective", "Loving", "Brave", "Sacrificial"],
    backstory: "Elle savait qu'elle allait mourir mais elle a choisi de donner sa vie pour que son fils survive.",
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, elegant Pixar-demonic microscopic mosquito countess mother Maeli, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE sleek fine needle-precise proboscis elegant and refined, beautiful warm slightly larger eyes with subtle lash-like ridge stylization, kind smile with hint of melancholy, petal-crown arrangement of pale lint petals around head ridge held by crimson wax dots like delicate tiara, two tiny droplet-shaped crimson wax earrings on copper thread loops, elegant translucent wings longer with subtle crimson gradient near base romantic style, tiny sparkle-like condensation dust near wing edges, slim waist elegant abdomen curve long delicate legs, crimson thread rescue harness with quick-release wax loops on forelegs arranged like elegant jewelry, narrow lint-fiber ribbon wrap on one hind leg mentor ribbon, small droplet-eye charm at chest smaller than Dorval refined, protective stance slightly curved like shielding someone, dark Madonna aesthetic tragically beautiful, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "general-aedes",
    name: "Général Aedes",
    type: "moostik",
    role: "supporting",
    title: "Le Boucher de la Rosée Rouge",
    age: "Vétéran (équivalent 50 ans)",
    description: "Le commandant militaire des Bloodwings. Vétéran scarifié qui entraîne les guerriers au combat à la trompe.",
    visualTraits: [
      "Battle-scarred Moostik with stern blood-red eyes",
      "Torn scarred wings like battle flags",
      "Dark crimson aggressive mohawk crest",
      "Body covered in battle scars worn as medals",
      "Military bearing"
    ],
    personality: ["Disciplined", "Tough", "PTSD behind discipline", "Gruff", "Loyal"],
    backstory: "Vétéran de nombreuses escarmouches contre les humains. Il a survécu au génocide caché sous les corps de ses compagnons. Ce trauma l'a forgé en machine de guerre sans pitié, mais aussi en père de substitution pour les orphelins du massacre.",
    relationships: [
      { targetId: "papy-tik", type: "ally", description: "Respect mutuel absolu" },
      { targetId: "young-dorval", type: "mentor", description: "L'a formé au combat" },
      { targetId: "evil-pik", type: "rival", description: "Le déteste profondément - trop indiscipliné" },
      { targetId: "captain-dengue", type: "colleague", description: "Son meilleur officier" },
      { targetId: "infiltrator-aedes-albopictus", type: "ally", description: "Son agent le plus précieux" }
    ],
    favoriteLocations: ["fort-sang-noir", "genocide-memorial"],
    strengths: ["Stratégie militaire imparable", "Endurance légendaire", "Inspiration par l'exemple", "Connaissance totale des tactiques humaines"],
    weaknesses: ["PTSD cauchemars nocturnes", "Incapable de montrer de l'affection", "Trop rigide parfois", "Flashbacks en combat"],
    quirks: [
      "Se réveille en hurlant chaque nuit mais ne l'admettra jamais",
      "Compte ses morts en touchant ses cicatrices",
      "Parle aux recrues comme s'ils étaient ses enfants perdus",
      "Garde un fragment d'aile de son frère mort comme talisman"
    ],
    quotes: [
      "Chaque cicatrice est un camarade qui n'est plus là pour porter la sienne.",
      "Je ne forme pas des soldats. Je forge des survivants.",
      "La discipline n'est pas une prison. C'est un bouclier.",
      "Dix mille pompes. Puis on parlera stratégie."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, battle-hardened Pixar-demonic microscopic mosquito warlord General Aedes, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE war-worn proboscis held like blood-stained ceremonial blade with battle notches, stern commanding glowing blood-red eyes with thousand-yard PTSD stare yet adorably grumpy, scarred but powerful translucent wings like torn gothic battle flags with honor-wounds and copper-thread repairs, dark crimson mohawk crest standing aggressive like punk demon general, heavily scarred thorax with battle damage worn as medals of honor, military bearing radiating demonic gravitas and discipline, tiny skull-and-proboscis military insignia markings, crimson thread military harness with multiple wax seals indicating rank, commanding pose that would make actual demon generals take notes, grizzled veteran aesthetic meets cute grumpy grandpa energy, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, harsh dramatic military lighting with crimson battle-glow, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "scholar-culex",
    name: "Érudit Culex",
    type: "moostik",
    role: "supporting",
    title: "Archiviste des Faiblesses",
    age: "Indéterminé (semble ancien)",
    description: "Maître de l'Académie du Sang. Il étudie les faiblesses humaines avec une obsession méticuleuse.",
    visualTraits: [
      "Intellectual Moostik with curious amber eyes",
      "Natural spectacle-like markings",
      "Delicate precise wings",
      "Smaller cerebral red crest",
      "Thin scholarly frame",
      "Always carrying scrolls"
    ],
    personality: ["Brilliant", "Curious", "Meticulous", "Nerdy", "Sinisterly intelligent"],
    backstory: "Fils d'un scribe royal, il a survécu au génocide caché dans une bibliothèque de pollen. Il a juré de cataloguer chaque faiblesse humaine jusqu'à ce que la victoire soit une certitude mathématique.",
    relationships: [
      { targetId: "papy-tik", type: "mentor", description: "Son conseiller intellectuel" },
      { targetId: "doc-hemoglobin", type: "rival", description: "Débats féroces sur la méthodologie" },
      { targetId: "mama-zika", type: "colleague", description: "Elle apporte les visions, il apporte la logique" },
      { targetId: "captain-dengue", type: "student", description: "Lui enseigne les points faibles aérodynamiques humains" }
    ],
    favoriteLocations: ["academy-of-blood", "cathedral-of-blood"],
    strengths: ["Intelligence encyclopédique", "Mémoire parfaite", "Patience infinie", "Capacité d'analyse hors norme"],
    weaknesses: ["Zéro compétence sociale", "Condescendant sans le vouloir", "S'endort n'importe où quand il lit", "Oublie de manger"],
    quirks: [
      "A lu Dracula et laisse des annotations sarcastiques dans les marges",
      "Parle aux livres comme à des amis",
      "Classe tout par système décimal qu'il a inventé",
      "Dort avec un parchemin comme couverture"
    ],
    quotes: [
      "Les humains ont 657 points faibles documentés. J'en cherche le 658ème.",
      "Bram Stoker était un amateur. Charmant, mais amateur.",
      "L'ignorance est notre pire ennemi. L'information, notre arme absolue.",
      "Fascinant... *prend des notes frénétiquement*"
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, intellectual Pixar-demonic microscopic mosquito scholar professor Culex, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE fine precise proboscis held like elegant quill pen for annotation, large curious glowing amber eyes (#FFB25A) with natural spectacle-like markings, delicate precise translucent wings like anatomical diagrams, smaller cerebral blood-red crest, thin scholarly frame, holding tiny ancient scroll with human anatomy notes, medieval scholar robes aesthetic in lint-fiber, expression of nerdy sinister curiosity, adorable demon professor who has read Dracula and finds it amusing but inaccurate, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, warm scholarly amber lighting, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "bartender-anopheles",
    name: "Barman Anopheles",
    type: "moostik",
    role: "supporting",
    title: "Le Confesseur de Rosée",
    age: "Adulte (équivalent 40 ans)",
    description: "Le tenancier du Bar Ti Sang. Il entend tout, sait tout, et sert le meilleur nectar de la cité.",
    visualTraits: [
      "Suave Moostik with charming amber eyes",
      "Sleek wings folded like waistcoat",
      "Slicked-back red crest",
      "Cool confident posture",
      "Bartender apron"
    ],
    personality: ["Charming", "Smooth", "Street-smart", "Connected", "Good listener"],
    backstory: "Ancien espion des Bloodwings reconverti après une mission qui a mal tourné. Il a ouvert le Ti Sang comme couverture, mais c'est devenu sa vraie passion. Il connaît tous les secrets de la cité et n'en révèle aucun.",
    relationships: [
      { targetId: "evil-pik", type: "best_friend", description: "Le seul qui le supporte - lui rappelle son jeune frère" },
      { targetId: "petit-t1", type: "ally", description: "Lui donne les restes de nectar" },
      { targetId: "singer-stegomyia", type: "colleague", description: "Partenaire de bar depuis des années" },
      { targetId: "femme-fatale-tigresse", type: "romantic", description: "Tension non résolue depuis des années" },
      { targetId: "infiltrator-aedes-albopictus", type: "ally", description: "Anciens collègues espions" }
    ],
    favoriteLocations: ["bar-ti-sang"],
    strengths: ["Réseau d'informations inégalé", "Charme irrésistible", "Cocktails légendaires", "Garde les secrets"],
    weaknesses: ["Incapable de dire non à une dame", "Passé trouble qui peut ressurgir", "Trop loyal envers les amis"],
    quirks: [
      "Connaît le cocktail préféré de chaque Moostik sans demander",
      "N'a jamais révélé un secret de client - même sous torture",
      "Parle en proverbes caribéens quand il est saoul",
      "Garde une bouteille de nectar rare pour 'le bon moment'"
    ],
    quotes: [
      "Au Ti Sang, on ne pose pas de questions. On écoute les réponses.",
      "Tout le monde mérite un verre et une oreille.",
      "Les secrets sont comme le bon rhum - ils se bonifient avec le temps.",
      "La maison ne prend pas parti. La maison sert."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, suave Pixar-demonic microscopic mosquito bartender Anopheles, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE elegant proboscis polished and refined like fancy cocktail stirrer, charming glowing amber eyes (#FFB25A) with knowing twinkle, sleek translucent wings folded elegantly like waistcoat, slicked-back blood-red crest with cool confidence, holding tiny thimble cocktail shaker, microscopic lint-fiber bartender apron, cool confident Caribbean swagger pose, expression of charming sinister hospitality, suave demon mixologist who knows everyone's secrets, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, warm amber bar lighting, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "singer-stegomyia",
    name: "Chanteur Stegomyia",
    type: "moostik",
    role: "background",
    title: "La Voix des Morts",
    age: "Inconnu",
    description: "La voix du Bar Ti Sang. Ses ballades de sang perdu font pleurer même les vétérans les plus endurcis.",
    visualTraits: [
      "Charismatic male Moostik with soulful amber eyes",
      "Elegant wings spread in performance",
      "Slicked stylish red crest",
      "Uses proboscis like microphone",
      "Retro-cool performer aesthetic"
    ],
    personality: ["Charismatic", "Soulful", "Mysterious past", "Cool", "Mélancolique"],
    backstory: "Personne ne sait d'où il vient. La légende dit qu'il était le seul survivant d'un autre clan exterminé avant les Bloodwings. Sa voix porte la douleur de deux génocides.",
    relationships: [
      { targetId: "bartender-anopheles", type: "best_friend", description: "Partenaire de scène depuis le début" },
      { targetId: "femme-fatale-tigresse", type: "romantic", description: "Elle vient l'écouter chaque soir" },
      { targetId: "mama-zika", type: "ally", description: "Elle dit qu'il chante avec les voix des morts" },
      { targetId: "papy-tik", type: "ally", description: "Seul à connaître son vrai passé" }
    ],
    favoriteLocations: ["bar-ti-sang", "cathedral-of-blood"],
    strengths: ["Voix hypnotique", "Charisme magnétique", "Peut calmer n'importe quelle bagarre", "Mémoire parfaite des chansons anciennes"],
    weaknesses: ["Ne parle jamais de son passé", "Disparaît parfois des jours", "Alcoolisme discret", "Cauchemars éveillés"],
    quirks: [
      "Chante des berceuses aux larves quand il pense que personne ne regarde",
      "Compose des chansons sur les morts qu'il a connus",
      "Refuse de chanter avant minuit",
      "Porte toujours une bague rubis qu'il ne retire jamais"
    ],
    quotes: [
      "Chaque chanson est une tombe. Je suis le gardien du cimetière.",
      "♪ Sang versé sous la lune créole, âmes perdues qui s'envolent... ♪",
      "Le silence entre les notes, c'est là que vivent les fantômes.",
      "Une dernière chanson pour ceux qui ne chantent plus."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, charismatic Pixar-demonic microscopic mosquito lounge singer Stegomyia, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE sleek elegant proboscis held like vintage microphone for crooning, soulful glowing amber eyes (#FFB25A) with magnetic stage presence, elegant translucent wings spread dramatically in performance pose, slicked stylish blood-red crest like classic 50s crooner with pompadour vibe, confident smooth stage pose, retro-cool demon lounge singer aesthetic like Star Wars Cantina Band, expression of soulful charm with mysterious past, blood-ruby earring on one antenna, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, warm spotlight amber lighting, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "femme-fatale-tigresse",
    name: "Tigresse",
    type: "moostik",
    role: "supporting",
    title: "L'Ombre de Velours",
    age: "Adulte (refuse de dire)",
    description: "Une des belles mystérieuses du Ti Sang. Personne ne sait si elle est cliente ou espionne. Réponse : les deux.",
    visualTraits: [
      "Elegant female Moostik with alluring half-lidded amber eyes",
      "Graceful wings with shimmer patterns",
      "Styled feminine red crest",
      "Long elegant legs crossed",
      "Femme fatale aesthetic"
    ],
    personality: ["Seductive", "Mysterious", "Intelligent", "Dangerous", "Loyale malgré les apparences"],
    backstory: "Fille d'un diplomate assassiné pendant le génocide, elle a juré vengeance. Elle a séduit et éliminé 17 humains en se glissant dans leur intimité. Elle est l'agent dormant le plus précieux de Papy Tik.",
    relationships: [
      { targetId: "bartender-anopheles", type: "romantic", description: "Ils s'aiment mais ne l'admettront jamais" },
      { targetId: "singer-stegomyia", type: "ally", description: "Vient l'écouter chaque soir - sa musique la calme" },
      { targetId: "infiltrator-aedes-albopictus", type: "rival", description: "Compétition professionnelle amicale" },
      { targetId: "papy-tik", type: "mentor", description: "Son handler - le seul à connaître ses missions" },
      { targetId: "evil-pik", type: "enemy", description: "Le trouve répugnant" }
    ],
    favoriteLocations: ["bar-ti-sang", "creole-house-enemy"],
    strengths: ["Séduction létale", "Infiltration des espaces intimes", "Poison expert", "Manipulation psychologique"],
    weaknesses: ["Incapable d'aimer ouvertement", "Addiction au danger", "Traumatisme de la mort de son père", "Peur de l'attachement"],
    quirks: [
      "Compte ses kills avec des perles sur un bracelet caché",
      "Ne boit jamais le verre qu'on lui offre - toujours le sien",
      "Parle à son père mort avant chaque mission",
      "Collectionne un souvenir de chaque victime"
    ],
    quotes: [
      "La beauté est une arme. La mort est un baiser.",
      "Ils ne me voient jamais venir. Ils ne me voient jamais partir.",
      "L'amour ? Un luxe que je ne peux pas me permettre.",
      "Papa, celui-là était pour toi."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, elegant seductive Pixar-demonic microscopic mosquito femme fatale Tigresse, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE delicate refined proboscis elegant and deadly like poisoned needle, alluring half-lidded glowing amber eyes (#FFB25A) with mysterious depth, graceful translucent wings with subtle shimmer patterns and crimson gradient, styled feminine blood-red crest swept elegantly, slim waist elegant curves long elegant legs crossed, holding tiny thimble nectar drink, femme fatale demon aesthetic, expression of mysterious dangerous allure, tiny crimson wax droplet earrings, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, moody warm bar lighting with crimson rim, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "evil-pik",
    name: "Evil Pik",
    type: "moostik",
    role: "protagonist",
    title: "Le Junkie du Sang",
    age: "Adulte",
    description: "Le psychopathe du sang. Nerveux, machiavélique, calculateur mais pète les plombs et fait des conneries. Accro au sang comme un junkie. Basé sur le rappeur martiniquais Evil P.",
    visualTraits: [
      "Twitchy nervous energy radiating from every fiber",
      "MASSIVE oversized proboscis like a giant zanpakuto sword",
      "Wild manic glowing blood-red eyes with twitching pupils",
      "Spiky aggressive blood-red crest like punk rocker",
      "Lean hungry body always vibrating with nervous energy",
      "Blood stains around mouth area",
      "Trap artist swagger aesthetic"
    ],
    personality: ["Blood-obsessed", "Machiavellian calculator", "Twitchy nervous", "Loses temper easily", "Makes stupid mistakes when angry", "Secretly loves cats"],
    backstory: "Le plus dangereux junkie de sang des Bloodwings. Son addiction le rend imprévisible - génie tactique quand il est calme, désastre ambulant quand il pète les plombs. Il adore secrètement les chats.",
    relationships: [
      { targetId: "petit-t1", type: "sidekick", description: "Son souffre-douleur qu'il essaie de tuer pour rire" },
      { targetId: "doc-hemoglobin", type: "ally", description: "Son dealer de sang synthétique" },
      { targetId: "general-aedes", type: "rival", description: "Se détestent mutuellement" },
      { targetId: "bartender-anopheles", type: "best_friend", description: "Le seul qui le supporte" },
      { targetId: "papy-tik", type: "mentor", description: "Le respecte malgré tout" }
    ],
    favoriteLocations: ["bar-ti-sang", "fort-sang-noir"],
    strengths: ["Génie tactique (quand calme)", "Trompe dévastatrice", "Imprévisible", "Charisme de bad boy"],
    weaknesses: ["Addiction au sang", "Pète les plombs facilement", "Fait des conneries monumentales quand énervé", "Incapable de se concentrer longtemps"],
    quirks: [
      "Adore secrètement les chats (ne l'avouerait jamais)",
      "Parle à sa trompe comme si c'était un zanpakuto avec un nom",
      "Compte ses kills en faisant des encoches sur son thorax",
      "A un tic nerveux à l'antenne gauche"
    ],
    quotes: [
      "Tu sais ce qui est bien avec le sang ? Y'en a toujours plus.",
      "J'suis pas fou. J'suis juste... passionné.",
      "Petit T1, viens là que j'te bute... pour rigoler.",
      "Mon zanpakuto a soif."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, twitchy psychopathic Pixar-demonic microscopic mosquito blood-addict Evil Pik, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE MASSIVE oversized needle-like proboscis like giant zanpakuto blood-sword gleaming with fresh blood droplets, wild manic glowing blood-red eyes with dilated twitching pupils showing addiction, spiky aggressive blood-red mohawk crest like punk trap rapper, lean hungry body vibrating with nervous twitchy energy, blood stains around proboscis base like junkie, trap artist swagger pose with attitude, expression of machiavellian calculation mixed with manic energy about to snap, tiny gold chain with blood-drop pendant, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent, based on Martinique trap rapper Evil P aesthetic, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "petit-t1",
    name: "Petit T1",
    type: "moostik",
    role: "background",
    title: "Le Survivant Miraculeux",
    age: "Inconnu (semble jeune)",
    description: "Le souffre-douleur d'Evil Pik. Minuscule moustique caricatural aux yeux énormes qui le suit partout. Evil Pik essaie de le tuer pour rigoler mais il survit miraculeusement à chaque fois.",
    visualTraits: [
      "EXTREMELY tiny even by mosquito standards",
      "COMICALLY HUGE round eyes taking up most of face",
      "Tiny stubby proboscis like a baby straw",
      "Comically small wings that shouldn't work",
      "Always looking scared but determined",
      "Cartoon mascot proportions"
    ],
    personality: ["Eternally optimistic", "Loyal to a fault", "Miraculously lucky", "Adorably pathetic", "Never gives up"],
    backstory: "Personne ne sait pourquoi il suit Evil Pik partout. Evil Pik essaie de le tuer tous les jours pour le fun mais Petit T1 survit par miracle à chaque fois - écrasé, brûlé, avalé, il revient toujours.",
    relationships: [
      { targetId: "evil-pik", type: "sidekick", description: "Son 'maître' qui veut le tuer" },
      { targetId: "mama-zika", type: "ally", description: "La seule qui est gentille avec lui" },
      { targetId: "bartender-anopheles", type: "best_friend", description: "Lui offre des restes de nectar" }
    ],
    favoriteLocations: ["bar-ti-sang", "nursery-pods"],
    strengths: ["Survie miraculeuse", "Chance incroyable", "Peut se faufiler partout", "Attachant malgré lui"],
    weaknesses: ["Minuscule", "Pathétique", "Aucune force de combat", "Trop loyal"],
    quirks: [
      "Survit à des trucs qui devraient le tuer 100%",
      "Fait des bruits de couinement adorables",
      "Collectionne les objets qu'Evil Pik lui lance dessus",
      "Dort dans la poche d'Evil Pik sans qu'il le sache"
    ],
    quotes: [
      "*couinement apeuré*",
      "M-mais... je voulais juste aider...",
      "*survit inexplicablement*"
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, comically tiny Pixar-demonic microscopic mosquito sidekick Petit T1, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE tiny stubby baby proboscis like innocent drinking straw, COMICALLY HUGE round googly eyes taking up 60 percent of face like anime mascot, extremely small body even tinier than other mosquitoes, comically small wings that look aerodynamically impossible, perpetually scared but determined expression, cartoon mascot proportions, bandages and patches from surviving murder attempts, singed wing edges and dented body showing abuse history, adorably pathetic demonic chibi aesthetic, expression of eternal optimism despite everything, matte obsidian chitin body (#0B0B0E) with visible repair patches, color palette obsidian-black blood-red warm-amber, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "doc-hemoglobin",
    name: "Doc Hémoglobine",
    type: "moostik",
    role: "supporting",
    title: "L'Alchimiste de Sang",
    age: "Adulte (refuse de vieillir)",
    description: "Le médecin fou des Bloodwings. Obsédé par les expériences sur le sang humain. Mi-savant, mi-psychopathe médical.",
    visualTraits: [
      "Mad scientist mosquito with crazed amber eyes",
      "Proboscis modified with tiny tubes like medical equipment",
      "Cracked spectacle-like markings around eyes",
      "Lab coat made of lint fibers stained with blood",
      "Always carrying tiny syringes and vials"
    ],
    personality: ["Brilliant", "Unhinged", "Obsessive", "Dark humor", "No ethical boundaries"],
    backstory: "Ancien médecin royal, il a perdu sa famille ET sa santé mentale dans le génocide. Il a juré de rendre les Moostik immortels grâce à la science. Ses méthodes sont terrifiantes, mais ses résultats miraculeux.",
    relationships: [
      { targetId: "evil-pik", type: "ally", description: "Son meilleur client - lui fournit du sang synthétique" },
      { targetId: "scholar-culex", type: "rival", description: "Débats épiques sur éthique vs résultats" },
      { targetId: "mama-zika", type: "enemy", description: "Elle le trouve abominable" },
      { targetId: "papy-tik", type: "ally", description: "Tolère ses méthodes car il sauve des vies" }
    ],
    favoriteLocations: ["academy-of-blood"],
    strengths: ["Génie médical", "Aucune limite éthique", "Sang synthétique", "Chirurgie microscopique miraculeuse"],
    weaknesses: ["Complètement fou", "Oublie que ses patients sont vivants", "Parle à ses échantillons", "Insomnie chronique"],
    quirks: [
      "Nomme ses expériences comme des enfants",
      "Goûte chaque échantillon de sang (pour 'analyse')",
      "Rit à ses propres blagues médicales horribles",
      "Garde le cerveau de son mentor dans un bocal et lui demande conseil"
    ],
    quotes: [
      "L'éthique est un obstacle à la science. Et je déteste les obstacles.",
      "Fascinant ! Il est toujours vivant malgré... *vérifie notes* ...tout ça.",
      "Le sang humain type O négatif a un bouquet fruité avec des notes de fer. Délicieux.",
      "Ne vous inquiétez pas, la douleur signifie que vous êtes vivant. Pour l'instant."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, mad scientist Pixar-demonic microscopic mosquito doctor Doc Hemoglobin, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE modified proboscis with tiny tubes attached like medical extraction equipment, crazed genius glowing amber eyes (#FFB25A) with cracked spectacle-like markings, wild disheveled blood-red crest like Einstein hair, lint-fiber lab coat stained with blood samples, holding tiny syringe filled with glowing red liquid, carrying rack of miniature blood vials, mad scientist pose with manic grin, expression of unhinged brilliance and dark medical humor, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red copper-accent warm-amber, dramatic laboratory lighting with crimson glow, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "mama-zika",
    name: "Mama Zika",
    type: "moostik",
    role: "supporting",
    title: "Oracle des Dix Mille Voix",
    age: "Ancienne (personne ne sait)",
    description: "La matriarche spirituelle des Bloodwings. Prêtresse vaudou qui communique avec les ancêtres morts du génocide.",
    visualTraits: [
      "Elderly female Moostik with mystical clouded eyes",
      "Ceremonial beads and charms on wings",
      "Ornate proboscis with ritual engravings",
      "Flowing lint-fiber robes with blood symbols",
      "Always surrounded by incense smoke"
    ],
    personality: ["Mystical", "Wise", "Cryptic", "Connected to spirits", "Feared and respected", "Maternelle sous son mystère"],
    backstory: "Elle était déjà prêtresse quand le génocide a frappé. Elle a entendu mourir dix mille Moostik en une seule nuit. Depuis, leurs voix ne l'ont jamais quittée. Elle les console autant qu'ils la guident.",
    relationships: [
      { targetId: "papy-tik", type: "ally", description: "Guide spirituel - le seul à la comprendre" },
      { targetId: "petit-t1", type: "ally", description: "Le protège comme son petit-fils" },
      { targetId: "doc-hemoglobin", type: "enemy", description: "Ses expériences sont une abomination" },
      { targetId: "singer-stegomyia", type: "ally", description: "Dit qu'il chante avec la voix des morts" }
    ],
    favoriteLocations: ["cathedral-of-blood", "genocide-memorial", "nursery-pods"],
    strengths: ["Visions prophétiques", "Communication avec les morts", "Sagesse ancestrale", "Peut bénir ou maudire"],
    weaknesses: ["Parfois possédée par les esprits", "Confond passé et présent", "Ne dort plus depuis le génocide", "Trop cryptique"],
    quirks: [
      "Parle aux fantômes que personne d'autre ne voit",
      "Prédit la mort de chacun mais ne le dit jamais",
      "Bénit chaque nouveau-né avec du sang de rosée sacrée",
      "Rit parfois à des blagues que seuls les morts comprennent"
    ],
    quotes: [
      "Les morts me parlent. Ils n'ont pas fini de crier.",
      "Je vois ce qui fut, ce qui est, ce qui pourrait être. Tout est rouge.",
      "Petit Ti, les esprits t'aiment. Tu survivras à tout.",
      "Le sang appelle le sang. La vengeance appelle la paix. Un jour."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, mystical voodoo priestess Pixar-demonic microscopic mosquito elder Mama Zika, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE ornate proboscis with tiny ritual engravings and ancestral markings, mystical clouded milky-white eyes suggesting spiritual sight, elaborate headdress of tiny bones and blood-ruby beads, ceremonial charms and talismans hanging from wings, flowing lint-fiber ceremonial robes with embroidered blood-drop symbols, holding tiny skull-topped staff, surrounded by wisps of incense smoke, mystical voodoo priestess aesthetic, expression of otherworldly wisdom and connection to the dead, matte obsidian chitin body (#0B0B0E), color palette obsidian-black blood-red bone-white copper-accent, ethereal mystical lighting with purple undertones, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "captain-dengue",
    name: "Capitaine Dengue",
    type: "moostik",
    role: "supporting",
    title: "L'As des Cieux Rouges",
    age: "Jeune adulte",
    description: "Le pilote d'élite des Bloodwings. As du vol acrobatique, il mène les escadrons en formation de combat.",
    visualTraits: [
      "Sleek aerodynamic Moostik built for speed",
      "Aviator goggles made of dew droplet lenses",
      "Streamlined proboscis like fighter jet nose",
      "Wings with racing stripes",
      "Flight harness with medals"
    ],
    personality: ["Cocky", "Skilled", "Brave", "Competitive", "Natural leader", "Loyal jusqu'à la mort"],
    backstory: "Fils orphelin du génocide, il a appris à voler avant de marcher. Général Aedes l'a repéré à 3 ans et l'a entraîné personnellement. Il a 47 missions réussies et zéro échec.",
    relationships: [
      { targetId: "general-aedes", type: "mentor", description: "Son père de substitution" },
      { targetId: "infiltrator-aedes-albopictus", type: "romantic", description: "Tension non avouée" },
      { targetId: "scholar-culex", type: "student", description: "Apprend l'aérodynamique humaine" },
      { targetId: "evil-pik", type: "rival", description: "Compétition de pilotage" }
    ],
    favoriteLocations: ["fort-sang-noir", "tire-city"],
    strengths: ["Pilotage parfait", "Réflexes surhumains", "Leadership naturel", "Courage sans limite"],
    weaknesses: ["Trop confiant", "Complexe de héros", "Peur secrète de décevoir Aedes", "Prend des risques inutiles"],
    quirks: [
      "Parle à ses ailes comme à des partenaires",
      "A un rituel secret avant chaque vol",
      "Collectione les 'souvenirs' de chaque mission",
      "Ne dort jamais la veille d'une mission - trop excité"
    ],
    quotes: [
      "Le ciel m'appartient. Les humains ne sont que des obstacles.",
      "47-0. Et ce n'est que le début.",
      "Je vole pour ceux qui ne peuvent plus. Chaque manœuvre est un hommage.",
      "Accroche-toi, ça va secouer. *sourire confiant*"
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, elite ace pilot Pixar-demonic microscopic mosquito aviator Captain Dengue, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE sleek streamlined proboscis like fighter jet nose cone, confident glowing amber eyes (#FFB25A) with tiny aviator goggles made of dew-droplet lenses pushed up on forehead, aerodynamic body built for speed, wings with crimson racing stripes and medal decorations, slicked-back blood-red crest for aerodynamics, flight harness with pilot insignia and campaign medals, cocky confident Top Gun pose, expression of fearless competitive swagger, matte obsidian chitin body (#0B0B0E) with polished aerodynamic sheen, color palette obsidian-black blood-red copper-accent warm-amber, dramatic heroic lighting with speed blur suggestion, 8K micro-textures",
    referenceImages: []
  },
  {
    id: "infiltrator-aedes-albopictus",
    name: "L'Infiltratrice (Aedes Albopictus)",
    type: "moostik",
    role: "supporting",
    title: "Le Fantôme Tigré",
    age: "Inconnu (change d'identité)",
    description: "L'espionne ultime des Bloodwings. Elle peut se fondre dans n'importe quel environnement et voler des secrets aux humains.",
    visualTraits: [
      "Distinctive tiger-striped pattern on body",
      "Calculating cold amber eyes",
      "Retractable camouflage wing patterns",
      "Slim athletic infiltrator body",
      "Always in shadows"
    ],
    personality: ["Cold", "Calculating", "Patient", "Deadly", "Works alone", "Secrètement romantique"],
    backstory: "Son vrai nom est un secret d'État. Née d'une lignée d'espions, elle a été entraînée depuis l'œuf. Elle a vécu 6 mois dans une maison humaine sans être détectée, rapportant des informations qui ont sauvé des centaines de vies.",
    relationships: [
      { targetId: "general-aedes", type: "ally", description: "Son handler officiel" },
      { targetId: "captain-dengue", type: "romantic", description: "Le seul à la faire sourire" },
      { targetId: "bartender-anopheles", type: "ally", description: "Ancien collègue espion" },
      { targetId: "femme-fatale-tigresse", type: "rival", description: "Compétition professionnelle" },
      { targetId: "papy-tik", type: "mentor", description: "Rapporte directement à lui" }
    ],
    favoriteLocations: ["creole-house-enemy", "fort-sang-noir"],
    strengths: ["Infiltration parfaite", "Camouflage naturel", "Mémoire photographique", "Peut rester immobile des heures"],
    weaknesses: ["Incapable de relations normales", "Paranoïa professionnelle", "Ne fait confiance à personne", "Flashbacks de missions"],
    quirks: [
      "Change de nom chaque semaine par habitude",
      "Dort les yeux ouverts",
      "Parle 3 langues humaines (a écouté assez)",
      "Garde un journal codé que personne ne peut déchiffrer"
    ],
    quotes: [
      "Je n'existe pas. C'est ma plus grande force.",
      "Les humains sont si bruyants. Si prévisibles.",
      "Mon vrai nom ? Lequel voulez-vous ?",
      "*silence* ...C'est ma réponse."
    ],
    referencePrompt: "Premium 3D animated feature film character turnaround sheet, elite spy infiltrator Pixar-demonic microscopic mosquito assassin Aedes Albopictus, dark gradient background, THREE VIEWS front three-quarter profile, MUST INCLUDE sleek retractable proboscis like hidden blade, calculating cold glowing amber eyes (#FFB25A) with vertical slit pupils like predator, distinctive tiger-stripe patterns on obsidian chitin body black and white bands, slim athletic infiltrator silhouette built for stealth, wings with adaptive camouflage shimmer patterns, minimal equipment for silent operation, stealth harness with lockpicks and tiny tools, emerging from shadow pose, expression of cold deadly patience, matte obsidian chitin body (#0B0B0E) with distinctive white stripe markings, color palette obsidian-black silver-white blood-red accents, noir shadow lighting with dramatic contrast, 8K micro-textures",
    referenceImages: []
  }
];

// ============================================================================
// PERSONNAGE HUMAIN (ANTAGONISTE)
// ============================================================================

export const HUMAN_CHARACTERS: Character[] = [
  {
    id: "child-killer",
    name: "L'Enfant au BYSS",
    type: "human",
    role: "antagonist",
    description: "L'enfant martiniquais de 5 ans qui déclenche le génocide. Il ne sait pas qu'il commet un massacre - c'est juste un jeu pour lui.",
    visualTraits: [
      "5-year-old Antillean/Caribbean child",
      "Ebony/dark skin with warm subsurface scattering",
      "Pixar-stylized proportions",
      "ONLY HANDS visible in Moostik scenes",
      "Soft rounded fingers",
      "Holding BYSS aerosol"
    ],
    personality: ["Innocent cruelty", "Playful", "Unaware of consequences"],
    backstory: "Comme Sid dans Toy Story, il ne réalise pas que ses jouets souffrent. Sauf que ses 'jouets' sont un peuple entier.",
    referencePrompt: "Pixar-stylized 5-year-old Antillean Caribbean child hands ONLY on pure white background, ebony dark skin with warm subsurface scattering, soft rounded Pixar-style fingers with visible knuckle creases, holding BYSS aerosol can, cropped at wrist NO face visible, innocent playful grip, warm tropical lighting, 3D Pixar feature film quality, 8K textures",
    referenceImages: []
  }
];

// ============================================================================
// HELPERS
// ============================================================================

export function getAllCharacters(): Character[] {
  return [...MOOSTIK_CHARACTERS, ...HUMAN_CHARACTERS];
}

export function getCharacterById(id: string): Character | undefined {
  return getAllCharacters().find(c => c.id === id);
}

export function getMoostikCharacters(): Character[] {
  return MOOSTIK_CHARACTERS;
}

export function getHumanCharacters(): Character[] {
  return HUMAN_CHARACTERS;
}

export function getCharactersByRole(role: Character["role"]): Character[] {
  return getAllCharacters().filter(c => c.role === role);
}
