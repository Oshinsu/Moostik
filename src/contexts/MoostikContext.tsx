"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Episode, Character, Location } from "@/types";

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface MoostikContextType {
  // Data
  episodes: Episode[];
  characters: Character[];
  locations: Location[];
  
  // Loading states
  isLoading: boolean;
  episodesLoading: boolean;
  charactersLoading: boolean;
  locationsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshEpisodes: () => Promise<void>;
  refreshCharacters: () => Promise<void>;
  refreshLocations: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Helpers
  getCharacterById: (id: string) => Character | undefined;
  getLocationById: (id: string) => Location | undefined;
  getEpisodeById: (id: string) => Episode | undefined;
  
  // Stats
  totalImages: number;
  totalShots: number;
}

// ============================================================================
// CONTEXT
// ============================================================================

const MoostikContext = createContext<MoostikContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface MoostikProviderProps {
  children: ReactNode;
}

export function MoostikProvider({ children }: MoostikProviderProps) {
  // State
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch functions
  const refreshEpisodes = useCallback(async () => {
    setEpisodesLoading(true);
    try {
      const res = await fetch("/api/episodes");
      const data = await res.json();
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
      setError("Erreur lors du chargement des épisodes");
    } finally {
      setEpisodesLoading(false);
    }
  }, []);

  const refreshCharacters = useCallback(async () => {
    setCharactersLoading(true);
    try {
      const res = await fetch("/api/characters");
      const data = await res.json();
      setCharacters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch characters:", err);
      setError("Erreur lors du chargement des personnages");
    } finally {
      setCharactersLoading(false);
    }
  }, []);

  const refreshLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      setError("Erreur lors du chargement des territoires");
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshEpisodes(),
      refreshCharacters(),
      refreshLocations()
    ]);
  }, [refreshEpisodes, refreshCharacters, refreshLocations]);

  // Initial fetch
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Helpers
  const getCharacterById = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  const getLocationById = useCallback((id: string) => {
    return locations.find(l => l.id === id);
  }, [locations]);

  const getEpisodeById = useCallback((id: string) => {
    return episodes.find(e => e.id === id);
  }, [episodes]);

  // Computed stats
  const totalShots = episodes.reduce((sum, ep) => sum + ep.shots.length, 0);
  const totalImages = episodes.reduce((sum, ep) => {
    return sum + ep.shots.reduce((shotSum, shot) => {
      return shotSum + shot.variations.filter(v => v.status === "completed").length;
    }, 0);
  }, 0);

  const isLoading = episodesLoading || charactersLoading || locationsLoading;

  // Context value
  const value: MoostikContextType = {
    episodes,
    characters,
    locations,
    isLoading,
    episodesLoading,
    charactersLoading,
    locationsLoading,
    error,
    refreshEpisodes,
    refreshCharacters,
    refreshLocations,
    refreshAll,
    getCharacterById,
    getLocationById,
    getEpisodeById,
    totalImages,
    totalShots
  };

  return (
    <MoostikContext.Provider value={value}>
      {children}
    </MoostikContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useMoostik(): MoostikContextType {
  const context = useContext(MoostikContext);
  if (context === undefined) {
    throw new Error("useMoostik must be used within a MoostikProvider");
  }
  return context;
}
