"use client";

import { useState, useEffect, useCallback } from "react";
import type { Location } from "@/types";

interface UseLocationsOptions {
  autoFetch?: boolean;
}

interface UseLocationsReturn {
  locations: Location[];
  loading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  getLocationById: (id: string) => Location | undefined;
  getMoostikCities: () => Location[];
  getHumanSpaces: () => Location[];
}

export function useLocations(options: UseLocationsOptions = {}): UseLocationsReturn {
  const { autoFetch = true } = options;
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des territoires");
      }
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchLocations();
    }
  }, [autoFetch, fetchLocations]);

  const getLocationById = useCallback((id: string): Location | undefined => {
    return locations.find(l => l.id === id);
  }, [locations]);

  const getMoostikCities = useCallback((): Location[] => {
    return locations.filter(l => l.type === "moostik_city");
  }, [locations]);

  const getHumanSpaces = useCallback((): Location[] => {
    return locations.filter(l => l.type === "human_space");
  }, [locations]);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    getLocationById,
    getMoostikCities,
    getHumanSpaces
  };
}
