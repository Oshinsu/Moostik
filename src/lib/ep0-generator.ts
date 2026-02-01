/**
 * MOOSTIK - Générateur de Shots pour l'Épisode 0
 * 
 * Ce script convertit le scénario de l'EP0 en objets JsonMoostik structurés
 * pour une génération SOTA (cinématique, cohérente, haute qualité).
 */

import { JsonMoostik, createEmptyJsonMoostik } from "./json-moostik-standard";
import { SceneType, CameraAngle } from "@/types";

interface Ep0ShotDefinition {
  id: string;
  name: string;
  description: string;
  sceneType: SceneType;
  characterIds: string[];
  locationId: string;
  cameraAngle: CameraAngle;
  goal: string;
}

export const EP0_SHOTS_DEFINITIONS: Ep0ShotDefinition[] = [
  // --- ACTE 1: LE GÉNOCIDE ---
  {
    id: "ep0-s1",
    name: "L'Ombre de la Mort",
    description: "Une main d'enfant colossale tenant une bombe BYSS s'approche d'un village Moostik paisible.",
    sceneType: "genocide",
    characterIds: ["child-killer"],
    locationId: "tire-city",
    cameraAngle: "low_angle",
    goal: "Montrer la menace colossale de l'humain face à la fragilité du village Moostik."
  },
  {
    id: "ep0-s2",
    name: "Le Sacrifice de Maeli",
    description: "Mama Dorval (Maeli) protège le bébé Dorval sous ses ailes alors que le nuage chimique approche.",
    sceneType: "emotional",
    characterIds: ["mama-dorval", "baby-dorval"],
    locationId: "tire-city",
    cameraAngle: "close_up",
    goal: "Capturer l'héroïsme tragique de la mère et la terreur pure du bébé."
  },
  {
    id: "ep0-s3",
    name: "Le Nuage Toxique",
    description: "Le gaz BYSS se répand dans les canaux de rosée, transformant le paradis en enfer.",
    sceneType: "genocide",
    characterIds: [],
    locationId: "tire-city",
    cameraAngle: "extreme_wide",
    goal: "Montrer l'échelle de la destruction environnementale."
  },
  
  // --- ACTE 2: LA SURVIE ---
  {
    id: "ep0-s4",
    name: "Seul dans les Cendres",
    description: "Bébé Dorval émerge des décombres de chitine, seul survivant au milieu des cadavres.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationId: "genocide-memorial",
    cameraAngle: "high_angle",
    goal: "Accentuer la vulnérabilité et la solitude du survivant."
  },
  {
    id: "ep0-s5",
    name: "La Rencontre avec Aedes",
    description: "Le Général Aedes, blessé et scarifié, trouve le bébé Dorval dans les ruines.",
    sceneType: "survival",
    characterIds: ["general-aedes", "baby-dorval"],
    locationId: "genocide-memorial",
    cameraAngle: "medium",
    goal: "Établir le lien entre le futur mentor et son pupille."
  },

  // --- ACTE 3: L'ENTRAÎNEMENT ---
  {
    id: "ep0-s6",
    name: "L'Éveil du Guerrier",
    description: "Jeune Dorval s'entraîne au combat à la trompe contre des mannequins de paille au Fort Sang-Noir.",
    sceneType: "training",
    characterIds: ["young-dorval", "general-aedes"],
    locationId: "fort-sang-noir",
    cameraAngle: "wide",
    goal: "Montrer la discipline et la rage de Dorval qui grandit."
  },
  {
    id: "ep0-s7",
    name: "L'Étude de l'Ennemi",
    description: "Dorval et Culex analysent des schémas d'anatomie humaine à l'Académie du Sang.",
    sceneType: "planning",
    characterIds: ["young-dorval", "scholar-culex"],
    locationId: "academy-of-blood",
    cameraAngle: "medium",
    goal: "Montrer que la vengeance est aussi intellectuelle."
  },

  // --- ACTE 4: LE PRÉSENT (TI SANG) ---
  {
    id: "ep0-s8",
    name: "Le Repaire des Bloodwings",
    description: "Papy Tik observe la nouvelle génération de guerriers depuis son trône au Bar Ti Sang.",
    sceneType: "bar_scene",
    characterIds: ["papy-tik", "bartender-anopheles"],
    locationId: "bar-ti-sang",
    cameraAngle: "wide",
    goal: "Établir l'ambiance actuelle de résistance et de camaraderie sombre."
  },
  {
    id: "ep0-s9",
    name: "Le Showcase de Stegomyia",
    description: "Le chanteur Stegomyia performe sur scène, hypnotisant la foule avec sa ballade du sang.",
    sceneType: "bar_scene",
    characterIds: ["singer-stegomyia"],
    locationId: "bar-ti-sang",
    cameraAngle: "medium",
    goal: "Ajouter la dimension culturelle et mélancolique des Bloodwings."
  },
  {
    id: "ep0-s10",
    name: "L'Appel aux Armes",
    description: "Gros plan sur l'œil d'Evil Pik qui s'illumine alors qu'il s'apprête à partir en mission.",
    sceneType: "battle",
    characterIds: ["evil-pik"],
    locationId: "fort-sang-noir",
    cameraAngle: "extreme_close_up",
    goal: "Finir sur une note de tension extrême et d'action imminente."
  }
];

/**
 * Convertit une définition de shot en objet JsonMoostik complet
 */
export function createJsonMoostikForShot(
  shot: Ep0ShotDefinition,
  characters: any[],
  location: any
): JsonMoostik {
  const json = createEmptyJsonMoostik();
  
  json.goal = shot.goal;
  
  // Sujets - avec injection des images de référence
  json.subjects = shot.characterIds.map(id => {
    const char = characters.find(c => c.id === id);
    const referenceImage = char?.referenceImages?.[0]; // Prendre la première image de référence
    
    return {
      id,
      name: char?.name || id,
      description: char?.referencePrompt || `Character ${id}`,
      importance: "primary",
      priority: 1,
      action: shot.description,
      // Injecter l'image de référence si disponible
      ...(referenceImage && { reference_image: referenceImage }),
    };
  });

  // Scène
  json.scene = {
    location: location?.name || shot.locationId,
    time: shot.sceneType === "genocide" ? "Daylight filtered through tropical leaves" : "Night with bioluminescent glow",
    atmosphere: [
      shot.sceneType === "genocide" ? "Toxic chemical haze" : "Dusty ancient library",
      "Volumetric lighting",
      "Cinematic particles"
    ],
    materials: location?.architecturalFeatures || ["Chitin", "Silk", "Resin"]
  };

  // Caméra
  const angleToLens: Record<CameraAngle, number> = {
    macro: 100,
    extreme_close_up: 85,
    close_up: 50,
    medium: 35,
    wide: 24,
    extreme_wide: 14,
    low_angle: 24,
    high_angle: 35,
    dutch_angle: 35,
    pov: 24
  };

  json.camera = {
    angle: shot.cameraAngle.replace("_", " "),
    lens_mm: angleToLens[shot.cameraAngle] || 35,
    format: "Anamorphic",
    aperture: "f/2.8"
  };

  // Composition
  const angleToFraming: Record<CameraAngle, string> = {
    extreme_wide: "extreme_wide",
    wide: "wide",
    medium: "medium",
    close_up: "close",
    extreme_close_up: "extreme_close",
    macro: "macro",
    low_angle: "wide",
    high_angle: "medium",
    dutch_angle: "medium",
    pov: "medium"
  };

  json.composition = {
    framing: (angleToFraming[shot.cameraAngle] || "medium") as "extreme_wide" | "wide" | "medium" | "close" | "extreme_close" | "macro",
    layout: "Golden ratio",
    depth: "Layered foreground and background"
  };

  // Lighting
  if (shot.sceneType === "genocide") {
    json.lighting = {
      key: "Harsh tropical sun filtering through leaves",
      fill: "Greenish bounce from foliage",
      rim: "High contrast white rim",
      notes: "Dramatic shadows from the child's hand"
    };
  } else {
    json.lighting = {
      key: "Warm amber bioluminescent lanterns",
      fill: "Deep crimson ambient bounce",
      rim: "Sharp blood-red rim light on chitin edges",
      notes: "Flickering candlelight effect"
    }
  }

  return json;
}
