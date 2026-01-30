"use client";

import { useState, useEffect, useCallback } from "react";
import type { Character } from "@/types";

interface UseCharactersOptions {
  autoFetch?: boolean;
}

interface UseCharactersReturn {
  characters: Character[];
  loading: boolean;
  error: string | null;
  fetchCharacters: () => Promise<void>;
  getCharacterById: (id: string) => Character | undefined;
  getMoostikCharacters: () => Character[];
  getHumanCharacters: () => Character[];
}

export function useCharacters(options: UseCharactersOptions = {}): UseCharactersReturn {
  const { autoFetch = true } = options;
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/characters");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des personnages");
      }
      const data = await response.json();
      setCharacters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCharacters();
    }
  }, [autoFetch, fetchCharacters]);

  const getCharacterById = useCallback((id: string): Character | undefined => {
    return characters.find(c => c.id === id);
  }, [characters]);

  const getMoostikCharacters = useCallback((): Character[] => {
    return characters.filter(c => c.type === "moostik");
  }, [characters]);

  const getHumanCharacters = useCallback((): Character[] => {
    return characters.filter(c => c.type === "human");
  }, [characters]);

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    getCharacterById,
    getMoostikCharacters,
    getHumanCharacters
  };
}
