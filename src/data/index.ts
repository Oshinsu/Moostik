/**
 * MOOSTIK - Export centralisé des données
 */

// Characters
export {
  MOOSTIK_CHARACTERS,
  HUMAN_CHARACTERS,
  getAllCharacters,
  getCharacterById,
  getMoostikCharacters,
  getHumanCharacters,
  getCharactersByRole
} from "./characters.data";

// Locations
export {
  MOOSTIK_LOCATIONS,
  getLocationById,
  getMoostikCities,
  getHumanSpaces,
  getLocationsByType
} from "./locations.data";

// Invariants
export {
  MOOSTIK_INVARIANTS,
  MOOSTIK_NEGATIVE_PROMPT
} from "./invariants";

// Camera angles
export {
  CAMERA_ANGLE_PROMPTS,
  CAMERA_ANGLES
} from "./camera-angles";
