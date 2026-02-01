/**
 * API Route: Enrich Shot Prompts
 * POST /api/episodes/[id]/enrich-prompts
 * 
 * Automatically fills in missing prompt fields based on shot description,
 * characters, and locations
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode, getCharacters, getLocations } from "@/lib/storage";
import type { Shot, Character, Location } from "@/types";
import type { MoostikPrompt } from "@/types/moostik";

interface EnrichRequest {
  shotIds?: string[]; // Optional: specific shots, otherwise all with empty prompts
}

// Character emotion/action mappings
const CHARACTER_PROMPTS: Record<string, {
  subjects: string[];
  emotion: string;
  action: string;
}> = {
  "baby-dorval": {
    subjects: ["Baby Dorval, tiny infant mosquito, large innocent amber eyes, delicate translucent wings, vulnerable and precious"],
    emotion: "innocent terror, desperate hope, survival instinct",
    action: "clinging, trembling, reaching for safety",
  },
  "mama-dorval": {
    subjects: ["Mama Dorval, protective mother mosquito, fierce amber eyes, wings spread defensively, maternal strength"],
    emotion: "fierce determination, maternal love, sacrifice",
    action: "shielding baby, facing danger, final protective embrace",
  },
  "young-dorval": {
    subjects: ["Young Dorval, warrior prince mosquito, sharp amber eyes, muscular frame, battle-ready wings"],
    emotion: "burning vengeance, cold determination, grief-forged strength",
    action: "training strikes, combat stance, strategic observation",
  },
  "papy-tik": {
    subjects: ["Papy Tik, ancient elder mosquito patriarch, wise weathered amber eyes, tattered wings telling stories"],
    emotion: "ancient sorrow, wise observation, guarded hope",
    action: "sitting watchful, pipe smoking, silent judgment",
  },
  "general-aedes": {
    subjects: ["General Aedes, military commander mosquito, stern amber eyes, decorated chitin armor, commanding presence"],
    emotion: "stoic resolve, hidden grief, duty-bound determination",
    action: "commanding troops, strategic planning, rescuing survivors",
  },
  "evil-pik": {
    subjects: ["Evil Pik, blood-addicted warrior mosquito, crimson-tinged eyes, scarred chitin, predatory stance"],
    emotion: "savage anticipation, controlled bloodlust, dark excitement",
    action: "stalking prey, preparing for hunt, eyes lighting with mission",
  },
  "child-killer": {
    subjects: ["Human child, 5 years old, innocent face, Caribbean features, holding BYSS aerosol can"],
    emotion: "innocent curiosity, unaware of destruction",
    action: "spraying aerosol like playing, childlike movements",
  },
  "koko-survivor": {
    subjects: ["Koko, elder survivor mosquito, scarred veteran, haunted amber eyes, weathered warrior"],
    emotion: "traumatic memories, survivor's guilt, burning remembrance",
    action: "narrating horrors, gesturing to wounds, voice trembling",
  },
  "mila-survivor": {
    subjects: ["Mila, memory keeper mosquito, observant amber eyes, methodical demeanor, archival wings"],
    emotion: "precise grief, documented pain, keeper of truth",
    action: "recording stories, cataloguing loss, preserving memory",
  },
  "trez-survivor": {
    subjects: ["Trez, scout survivor mosquito, alert amber eyes, agile frame, always watching exits"],
    emotion: "permanent vigilance, escape-ready tension, nightmare-touched",
    action: "scanning surroundings, ready to flee, survival instincts",
  },
  "stegomyia": {
    subjects: ["Stegomyia, cabaret singer mosquito, glamorous presence, melodic voice, performer's grace"],
    emotion: "artistic expression, veiled sorrow, performance mask",
    action: "singing requiem, dramatic gestures, stage presence",
  },
  "bartender-anopheles": {
    subjects: ["Bartender Anopheles, barkeep mosquito, knowing amber eyes, polishing proboscis-cups, steady hands"],
    emotion: "quiet understanding, listener's patience, secrets kept",
    action: "serving drinks, wiping counter, silent observation",
  },
};

// Location environment mappings
const LOCATION_PROMPTS: Record<string, {
  environment: string[];
  architecture: string[];
  martinique_cues: string[];
}> = {
  "bar-ti-sang": {
    environment: ["Bar Ti Sang interior, dim amber bioluminescent lighting, smoke curling, nectar-wax candles"],
    architecture: ["Gothic organic bar, chitin counter, wing-membrane tapestries, blood-drop chandeliers"],
    martinique_cues: ["Creole bar atmosphere, Caribbean noir, tropical speakeasy"],
  },
  "cooltik-village": {
    environment: ["Cooltik Village, peaceful pre-genocide, golden afternoon light, idyllic mosquito settlement"],
    architecture: ["Organic village homes, resin-sealed structures, communal gathering spaces, nurturing atmosphere"],
    martinique_cues: ["Tropical paradise, Caribbean tranquility, innocent times"],
  },
  "martinique-house-interior": {
    environment: ["Human Creole house interior, wooden floors, tropical furnishings, BYSS toxic cloud spreading"],
    architecture: ["Colonial Caribbean house, wooden shutters, family portraits, invaded space"],
    martinique_cues: ["Martinique home, Creole architecture, domestic horror scene"],
  },
  "jalousies-gateway": {
    environment: ["Jalousies gateway, wooden slat shutters, light streaming through, escape route"],
    architecture: ["Traditional Martinique jalousies, wooden louvers, threshold between death and survival"],
    martinique_cues: ["Caribbean architectural detail, life-saving passage, hope's corridor"],
  },
  "genocide-memorial": {
    environment: ["Genocide Memorial, sacred ash grounds, eternal candles, mourning atmosphere"],
    architecture: ["Memorial architecture, names carved in chitin, eternal flame, gathering circle"],
    martinique_cues: ["Caribbean sacred ground, Bloodwings holy site, oath-taking place"],
  },
  "tire-city": {
    environment: ["Tire City panorama, reconstruction in progress, hope rising from ashes"],
    architecture: ["New Bloodwings capital, defensive walls, rising towers, phoenix city"],
    martinique_cues: ["Caribbean resistance stronghold, Moostik new beginning, defiant construction"],
  },
  "fort-sang-noir": {
    environment: ["Fort Sang-Noir, military training grounds, disciplined atmosphere, warrior preparation"],
    architecture: ["Bloodwings fortress, training yards, strategy chambers, war rooms"],
    martinique_cues: ["Caribbean military installation, resistance headquarters, vengeance forge"],
  },
  "academy-of-blood": {
    environment: ["Academy of Blood, monastery-university, knowledge and combat combined"],
    architecture: ["Scholar-warrior academy, library-armory hybrid, study chambers"],
    martinique_cues: ["Caribbean knowledge center, enemy-study facility, tactical education"],
  },
};

// Scene type to action/mood mappings
const SCENE_TYPE_ENRICHMENT: Record<string, {
  goal: string;
  mood: string;
  action_suffix: string;
}> = {
  genocide: {
    goal: "Capture the devastating horror of the BYSS genocide with unflinching emotional impact",
    mood: "Harrowing devastation, profound loss, traumatic witness",
    action_suffix: "amidst toxic cloud and falling bodies",
  },
  emotional: {
    goal: "Create an intimate moment of profound emotional connection and sacrifice",
    mood: "Heart-wrenching sacrifice, desperate love, final moments",
    action_suffix: "in moment of ultimate sacrifice",
  },
  survival: {
    goal: "Show the raw desperation and miraculous survival against impossible odds",
    mood: "Desperate hope, miraculous survival, aftermath shock",
    action_suffix: "emerging from destruction",
  },
  training: {
    goal: "Capture the forging of a warrior through discipline and vengeance-fueled determination",
    mood: "Focused determination, growing power, vengeance channeled",
    action_suffix: "in rigorous warrior preparation",
  },
  planning: {
    goal: "Show strategic minds at work, studying the enemy for eventual retribution",
    mood: "Cold calculation, strategic focus, methodical revenge",
    action_suffix: "analyzing enemy weaknesses",
  },
  bar_scene: {
    goal: "Create atmospheric noir ambiance where survivors share their stories",
    mood: "Noir melancholy, shared trauma, dark camaraderie",
    action_suffix: "in smoky bar atmosphere",
  },
  battle: {
    goal: "Capture the explosive moment of Bloodwings rising to war",
    mood: "Rising fury, call to arms, vengeance unleashed",
    action_suffix: "rallying for battle",
  },
  establishing: {
    goal: "Set the scene with atmospheric world-building and narrative context",
    mood: "Atmospheric immersion, world establishment, story context",
    action_suffix: "establishing narrative moment",
  },
  flashback: {
    goal: "Transport viewer to pivotal past moment with dreamlike nostalgic quality",
    mood: "Nostalgic sorrow, memory fragment, time echoes",
    action_suffix: "in memory's embrace",
  },
};

function enrichPrompt(
  shot: Shot,
  characters: Character[],
  locations: Location[]
): MoostikPrompt {
  const prompt = shot.prompt as MoostikPrompt;
  const sceneEnrich = SCENE_TYPE_ENRICHMENT[shot.sceneType || "establishing"] || SCENE_TYPE_ENRICHMENT.establishing;
  
  // Build task from description
  const task = prompt.task || `Create: ${shot.name} - ${shot.description}`;
  
  // Build goal from scene type
  const goal = prompt.goal || sceneEnrich.goal;
  
  // Build foreground from characters
  const characterSubjects: string[] = [];
  const characterEmotions: string[] = [];
  const characterActions: string[] = [];
  
  for (const charId of (shot.characterIds || [])) {
    const charPrompt = CHARACTER_PROMPTS[charId];
    if (charPrompt) {
      characterSubjects.push(...charPrompt.subjects);
      characterEmotions.push(charPrompt.emotion);
      characterActions.push(charPrompt.action);
    }
  }
  
  // Build environment from locations
  const environments: string[] = [];
  const architectures: string[] = [];
  const martiniqueCues: string[] = [];
  
  for (const locId of (shot.locationIds || [])) {
    const locPrompt = LOCATION_PROMPTS[locId];
    if (locPrompt) {
      environments.push(...locPrompt.environment);
      architectures.push(...locPrompt.architecture);
      martiniqueCues.push(...locPrompt.martinique_cues);
    }
  }
  
  // Merge with existing prompt (don't overwrite non-empty fields)
  const enrichedPrompt: MoostikPrompt = {
    ...prompt,
    task,
    goal,
    foreground: {
      subjects: prompt.foreground?.subjects?.length ? prompt.foreground.subjects : characterSubjects,
      micro_detail: prompt.foreground?.micro_detail?.length ? prompt.foreground.micro_detail : [
        "Intricate chitin textures",
        "Translucent wing membranes with red veins",
        "Expressive amber compound eyes",
        "Delicate antennae",
      ],
      emotion: prompt.foreground?.emotion || characterEmotions.join(", ") || sceneEnrich.mood,
    },
    midground: {
      environment: prompt.midground?.environment?.length ? prompt.midground.environment : environments,
      micro_city_architecture: prompt.midground?.micro_city_architecture?.length ? prompt.midground.micro_city_architecture : architectures,
      action: prompt.midground?.action?.length ? prompt.midground.action : [
        characterActions.join(", ") + " " + sceneEnrich.action_suffix,
      ],
      threat: prompt.midground?.threat || [],
    },
    background: {
      location: prompt.background?.location?.length ? prompt.background.location : martiniqueCues,
      human_threat: prompt.background?.human_threat || [],
      martinique_cues: prompt.background?.martinique_cues?.length ? prompt.background.martinique_cues : [
        "Caribbean tropical atmosphere",
        "Martinique cultural elements",
        "Creole aesthetic details",
      ],
    },
  };
  
  return enrichedPrompt;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;
    const body: EnrichRequest = await request.json();
    const { shotIds } = body;

    console.log(`[Enrich] Enriching prompts for episode ${episodeId}`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    // Load characters and locations for reference
    const characters = await getCharacters();
    const locations = await getLocations();

    let enrichedCount = 0;

    // Process each shot
    const updatedShots = episode.shots.map(shot => {
      // Skip if not in shotIds (when specified)
      if (shotIds && !shotIds.includes(shot.id)) {
        return shot;
      }
      
      // Check if prompt needs enrichment (empty task or goal)
      const needsEnrichment = !shot.prompt?.task || !shot.prompt?.goal ||
        !shot.prompt?.foreground?.subjects?.length;
      
      if (!needsEnrichment) {
        return shot;
      }
      
      const enrichedPrompt = enrichPrompt(shot, characters, locations);
      enrichedCount++;
      
      console.log(`[Enrich] Enriched shot ${shot.id}: ${shot.name}`);
      
      return {
        ...shot,
        prompt: enrichedPrompt,
        updatedAt: new Date().toISOString(),
      };
    });

    // Save updated episode
    const updatedEpisode = {
      ...episode,
      shots: updatedShots,
      updatedAt: new Date().toISOString(),
    };

    await saveEpisode(updatedEpisode);

    const response = {
      success: true,
      episodeId,
      enrichedCount,
      totalShots: episode.shots.length,
      enrichedShots: updatedShots
        .filter((s, i) => {
          const original = episode.shots[i];
          return s.prompt?.task !== original?.prompt?.task;
        })
        .map(s => ({
          id: s.id,
          name: s.name,
          task: s.prompt?.task?.slice(0, 100),
          goal: s.prompt?.goal?.slice(0, 100),
        })),
    };

    console.log(`[Enrich] Done: ${enrichedCount} prompts enriched`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Enrich] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
