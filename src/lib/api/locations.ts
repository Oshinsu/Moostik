/**
 * MOOSTIK - API Client pour les lieux
 */

import type { Location } from "@/types";

const BASE_URL = "/api/locations";

export async function fetchLocations(): Promise<Location[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des territoires");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchLocation(id: string): Promise<Location | null> {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Erreur lors du chargement du territoire");
  }
  return response.json();
}

export async function updateLocation(id: string, data: Partial<Location>): Promise<Location> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour du territoire");
  }
  
  return response.json();
}

export async function generateLocationReference(locationId: string): Promise<{ imageUrl: string }> {
  const response = await fetch("/api/references/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "location", id: locationId })
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la génération de l'image de référence");
  }
  
  return response.json();
}

export async function generateLocationVariations(locationId: string): Promise<{ images: string[] }> {
  const response = await fetch("/api/references/generate-location-variations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locationId })
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la génération des variations");
  }
  
  return response.json();
}
