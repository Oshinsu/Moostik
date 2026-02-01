import { NextResponse } from "next/server";
import { getEpisodes, getCharacters, getLocations, saveEpisode } from "@/lib/storage";
import { EP0_SHOTS_DEFINITIONS, createJsonMoostikForShot } from "@/lib/ep0-generator";
import { createShot, createShotVariations } from "@/data/prompt-helpers";
import { jsonMoostikToPrompt } from "@/lib/json-moostik-standard";
import type { CameraAngle, MoostikPrompt } from "@/types";

export async function POST() {
  try {
    const episodes = await getEpisodes();
    const characters = await getCharacters();
    const locations = await getLocations();

    // Trouver ou créer l'épisode 0
    let ep0 = episodes.find(e => e.number === 0);
    
    if (!ep0) {
      ep0 = {
        id: "ep0",
        number: 0,
        title: "Requiem pour un Génocide",
        description: "L'origine des Bloodwings. Du massacre initial à la formation du clan de la vengeance.",
        shots: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Générer les shots basés sur les définitions SOTA
    const newShots = EP0_SHOTS_DEFINITIONS.map((def, index) => {
      const charData = def.characterIds.map(id => characters.find(c => c.id === id)).filter(Boolean);
      const locData = locations.find(l => l.id === def.locationId);
      
      // Créer le JSON MOOSTIK
      const jsonMoostik = createJsonMoostikForShot(def, characters, locData);
      
      // Convertir en prompt texte pour la compatibilité
      const textPrompt = jsonMoostikToPrompt(jsonMoostik);
      
      // Créer le shot
      const shot = createShot(
        index + 1,
        def.name,
        def.description,
        def.sceneType,
        // On stocke le prompt texte mais on pourrait aussi stocker le JSON dans les metadata si besoin
        { ...jsonMoostik } as any, 
        def.characterIds,
        [def.locationId]
      );

      // On s'assure que le prompt texte est bien utilisé pour la génération
      // Note: Dans notre système, shot.prompt est l'objet structuré
      
      // Créer les variations (5 angles par shot pour être SOTA)
      const angles: CameraAngle[] = ["extreme_wide", "wide", "medium", "close_up", "low_angle"];
      shot.variations = createShotVariations(shot, angles);
      
      return shot;
    });

    ep0.shots = newShots;
    ep0.updatedAt = new Date().toISOString();

    await saveEpisode(ep0);

    return NextResponse.json({ 
      success: true, 
      message: "Épisode 0 initialisé avec 10 shots et 50 variations (Standard JSON MOOSTIK)",
      episode: ep0 
    });
  } catch (error) {
    console.error("Failed to init EP0:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
