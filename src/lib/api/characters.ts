/**
 * MOOSTIK - API Client pour les personnages
 */

import type { Character } from "@/types";

const BASE_URL = "/api/characters";

export async function fetchCharacters(): Promise<Character[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des personnages");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchCharacter(id: string): Promise<Character | null> {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Erreur lors du chargement du personnage");
  }
  return response.json();
}

export async function updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour du personnage");
  }
  
  return response.json();
}

export async function generateCharacterReference(characterId: string): Promise<{ imageUrl: string }> {
  const response = await fetch("/api/references/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "character", id: characterId })
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la génération de l'image de référence");
  }
  
  return response.json();
}
