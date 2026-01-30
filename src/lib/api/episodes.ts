/**
 * MOOSTIK - API Client pour les épisodes
 */

import type { Episode } from "@/types";

const BASE_URL = "/api/episodes";

export async function fetchEpisodes(): Promise<Episode[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des épisodes");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchEpisode(id: string): Promise<Episode | null> {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Erreur lors du chargement de l'épisode");
  }
  return response.json();
}

export async function createEpisode(title: string, description: string): Promise<Episode> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description })
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la création de l'épisode");
  }
  
  return response.json();
}

export async function updateEpisode(id: string, data: Partial<Episode>): Promise<Episode> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour de l'épisode");
  }
  
  return response.json();
}

export async function deleteEpisode(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression de l'épisode");
  }
}
