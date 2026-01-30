/**
 * MOOSTIK - Export centralisé de l'API client
 */

// Episodes
export {
  fetchEpisodes,
  fetchEpisode,
  createEpisode,
  updateEpisode,
  deleteEpisode
} from "./episodes";

// Characters
export {
  fetchCharacters,
  fetchCharacter,
  updateCharacter,
  generateCharacterReference
} from "./characters";

// Locations
export {
  fetchLocations,
  fetchLocation,
  updateLocation,
  generateLocationReference,
  generateLocationVariations
} from "./locations";
