"use client";

import { useState, useEffect, useCallback } from "react";
import type { Episode, Shot } from "@/types";

interface UseEpisodesOptions {
  autoFetch?: boolean;
}

interface UseEpisodesReturn {
  episodes: Episode[];
  loading: boolean;
  error: string | null;
  fetchEpisodes: () => Promise<void>;
  getEpisodeById: (id: string) => Episode | undefined;
  createEpisode: (title: string, description: string) => Promise<Episode | null>;
  getTotalShots: () => number;
  getTotalImages: () => number;
}

export function useEpisodes(options: UseEpisodesOptions = {}): UseEpisodesReturn {
  const { autoFetch = true } = options;
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/episodes");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des épisodes");
      }
      const data = await response.json();
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchEpisodes();
    }
  }, [autoFetch, fetchEpisodes]);

  const getEpisodeById = useCallback((id: string): Episode | undefined => {
    return episodes.find(e => e.id === id);
  }, [episodes]);

  const createEpisode = useCallback(async (title: string, description: string): Promise<Episode | null> => {
    try {
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'épisode");
      }
      
      const newEpisode = await response.json();
      setEpisodes(prev => [...prev, newEpisode]);
      return newEpisode;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    }
  }, []);

  const getTotalShots = useCallback((): number => {
    return episodes.reduce((sum, ep) => sum + ep.shots.length, 0);
  }, [episodes]);

  const getTotalImages = useCallback((): number => {
    return episodes.reduce((sum, ep) => {
      return sum + ep.shots.reduce((shotSum, shot) => {
        return shotSum + shot.variations.filter(v => v.status === "completed").length;
      }, 0);
    }, 0);
  }, [episodes]);

  return {
    episodes,
    loading,
    error,
    fetchEpisodes,
    getEpisodeById,
    createEpisode,
    getTotalShots,
    getTotalImages
  };
}
