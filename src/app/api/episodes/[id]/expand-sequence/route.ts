/**
 * API Route: Expand Narrative Sequence
 * POST /api/episodes/[id]/expand-sequence
 * 
 * Adds new shots to expand a narrative sequence for cinematic depth
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode, getCharacters, getLocations } from "@/lib/storage";
import type { Shot, Variation, MoostikPrompt } from "@/types";

interface ExpandRequest {
  sequenceId: string; // Act ID to expand (e.g., "seq-5" for genocide)
  targetShotCount: number; // How many shots the sequence should have
}

// Pre-defined shot expansions for key sequences
const GENOCIDE_EXPANSION: Array<{
  name: string;
  description: string;
  sceneType: string;
  characterIds: string[];
  locationIds: string[];
  promptDetails: {
    task: string;
    goal: string;
    foreground: { subjects: string[]; emotion: string };
    midground: { environment: string[]; action: string[] };
  };
}> = [
  {
    name: "L'Innocence Brisée",
    description: "L'enfant humain approche avec le BYSS, sourire innocent sur le visage. Mama Dorval sent le danger.",
    sceneType: "genocide",
    characterIds: ["child-killer", "mama-dorval", "baby-dorval"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: The child-killer approaches with BYSS aerosol, innocent smile hiding deadly purpose",
      goal: "Capture the horrific irony of a child as instrument of genocide, innocence weaponized",
      foreground: {
        subjects: ["Human child 5 years old, Caribbean features, innocent smile, holding BYSS aerosol can like a toy"],
        emotion: "Childlike curiosity mixed with impending doom, dramatic irony",
      },
      midground: {
        environment: ["Creole house interior, warm afternoon light, deceptive tranquility before storm"],
        action: ["Child approaching playfully, aerosol raised, Mama Dorval sensing danger"],
      },
    },
  },
  {
    name: "Le Premier Spray",
    description: "Le premier jet de BYSS - l'instant où tout bascule. Le nuage toxique commence à se répandre.",
    sceneType: "genocide",
    characterIds: ["child-killer"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: The first spray of BYSS - the moment everything changes, toxic cloud begins spreading",
      goal: "Freeze the precise moment of genocide initiation with visceral horror",
      foreground: {
        subjects: ["BYSS aerosol spraying, toxic cloud emerging, deadly mist expanding"],
        emotion: "Frozen horror, point of no return, irreversible doom",
      },
      midground: {
        environment: ["Toxic cloud spreading through Creole house, particles catching light, death visible"],
        action: ["Child spraying innocently, unaware of destruction being caused"],
      },
    },
  },
  {
    name: "Les Premières Victimes",
    description: "Les moustiques Moostik tombent, surpris par l'attaque. Corps minuscules s'effondrant dans l'horreur.",
    sceneType: "genocide",
    characterIds: [],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: First Moostik victims falling, tiny bodies collapsing in the toxic cloud",
      goal: "Show the mass death beginning with unflinching horror",
      foreground: {
        subjects: ["Falling Moostik mosquitoes, wings crumpling, amber eyes dimming, bodies in free fall"],
        emotion: "Mass terror, sudden death, silent screams",
      },
      midground: {
        environment: ["Toxic BYSS cloud thick in air, victims scattered, domestic space turned killing field"],
        action: ["Bodies falling like rain, desperate last movements, death spreading"],
      },
    },
  },
  {
    name: "Le Cri de Mama Dorval",
    description: "Mama Dorval hurle en voyant le carnage, protégeant baby Dorval de son corps, ailes déployées.",
    sceneType: "genocide",
    characterIds: ["mama-dorval", "baby-dorval"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: Mama Dorval's scream of horror, shielding baby Dorval with her body",
      goal: "Capture maternal sacrifice beginning, fierce protection against impossible odds",
      foreground: {
        subjects: ["Mama Dorval screaming, wings spread as shield, amber eyes fierce with determination"],
        emotion: "Maternal fury, protective desperation, defiant love against death",
      },
      midground: {
        environment: ["Toxic cloud approaching, dead bodies around, shrinking safe space"],
        action: ["Wings spread defensively, body curling around baby, creating living shield"],
      },
    },
  },
  {
    name: "L'Enveloppement Mortel",
    description: "Le nuage toxique engloutit la pièce. Mama Dorval s'enroule autour de baby Dorval, dernier rempart.",
    sceneType: "genocide",
    characterIds: ["mama-dorval", "baby-dorval"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: Toxic cloud engulfing the room, Mama Dorval as last barrier protecting baby",
      goal: "Maximum emotional impact - mother's final protective embrace against death itself",
      foreground: {
        subjects: ["Mama Dorval's wings forming cocoon around baby, her body absorbing toxic cloud"],
        emotion: "Ultimate sacrifice, love stronger than death, final breath given freely",
      },
      midground: {
        environment: ["Room completely filled with toxic cloud, no escape visible, death everywhere"],
        action: ["Mama Dorval's body trembling but holding, filtering poison, giving life through death"],
      },
    },
  },
  {
    name: "Le Dernier Souffle",
    description: "Mama Dorval expire, son dernier souffle protecteur donnant la vie à baby Dorval. Sacrifice ultime.",
    sceneType: "emotional",
    characterIds: ["mama-dorval", "baby-dorval"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: Mama Dorval's final breath, dying while protecting, ultimate sacrifice complete",
      goal: "Devastating emotional climax - death as gift of life, love transcending mortality",
      foreground: {
        subjects: ["Mama Dorval's eyes closing, peaceful expression despite agony, wings still wrapped around baby"],
        emotion: "Transcendent sacrifice, peaceful acceptance, love beyond death",
      },
      midground: {
        environment: ["Toxic cloud settling, stillness of death, single ray of light on baby"],
        action: ["Final exhale, body relaxing in death, baby protected in embrace"],
      },
    },
  },
  {
    name: "L'Éveil du Survivant",
    description: "Baby Dorval émerge des ailes de sa mère morte. Seul survivant, entouré de cendres et de corps.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: Baby Dorval emerging from dead mother's wings, sole survivor in field of death",
      goal: "Birth of the protagonist through ultimate loss, survival as burden and gift",
      foreground: {
        subjects: ["Baby Dorval emerging confused, amber eyes wide with incomprehension, mother's lifeless wings parting"],
        emotion: "Shock, survival guilt, innocence shattered, grief beginning",
      },
      midground: {
        environment: ["Death all around, bodies of community, mother's sacrifice visible"],
        action: ["First movements of survival, looking around in horror, alone"],
      },
    },
  },
  {
    name: "Les Cendres du Génocide",
    description: "Vue d'ensemble de la dévastation. Baby Dorval seul parmi les morts. Naissance d'une vengeance.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationIds: ["martinique-house-interior"],
    promptDetails: {
      task: "Create: Wide shot of genocide aftermath, baby Dorval alone among the dead",
      goal: "Establish the scope of loss and the origin of vengeance",
      foreground: {
        subjects: ["Baby Dorval tiny figure among destruction, sole movement in stillness of death"],
        emotion: "Devastation, utter loss, first ember of future vengeance",
      },
      midground: {
        environment: ["Bodies everywhere, settling dust and toxin, destroyed innocence visible"],
        action: ["Baby crawling over bodies, seeking life, finding only death"],
      },
    },
  },
];

const ESCAPE_EXPANSION: Array<{
  name: string;
  description: string;
  sceneType: string;
  characterIds: string[];
  locationIds: string[];
  promptDetails: {
    task: string;
    goal: string;
    foreground: { subjects: string[]; emotion: string };
    midground: { environment: string[]; action: string[] };
  };
}> = [
  {
    name: "La Découverte des Jalousies",
    description: "Baby Dorval aperçoit la lumière filtrant à travers les jalousies. Premier espoir d'évasion.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationIds: ["jalousies-gateway"],
    promptDetails: {
      task: "Create: Baby Dorval spots light through the jalousies, first hope of escape",
      goal: "Visual metaphor of hope - light through shutters as path to survival",
      foreground: {
        subjects: ["Baby Dorval looking up, amber eyes catching light rays, hope flickering"],
        emotion: "First hope, survival instinct awakening, desperate determination",
      },
      midground: {
        environment: ["Jalousies wooden shutters, light streaming through slats, escape route visible"],
        action: ["Small body turning toward light, instinct pulling toward safety"],
      },
    },
  },
  {
    name: "L'Approche du Passage",
    description: "Baby Dorval rampe vers les jalousies, déterminé malgré sa terreur. Chaque centimètre est un combat.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationIds: ["jalousies-gateway"],
    promptDetails: {
      task: "Create: Baby Dorval crawling toward jalousies, determined despite terror",
      goal: "Show the struggle for survival, every inch a battle won",
      foreground: {
        subjects: ["Baby Dorval crawling desperately, tiny wings helping propel forward, eyes fixed on light"],
        emotion: "Desperate determination, primal survival, infant courage",
      },
      midground: {
        environment: ["Floor covered with dust and bodies, jalousies getting closer, light getting brighter"],
        action: ["Crawling motion, reaching, struggling, never stopping"],
      },
    },
  },
  {
    name: "Le Passage Étroit",
    description: "Baby Dorval se faufile entre les lattes des jalousies. Le moment le plus périlleux de l'évasion.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationIds: ["jalousies-gateway"],
    promptDetails: {
      task: "Create: Baby Dorval squeezing through jalousie slats, most perilous moment",
      goal: "Maximum tension - will the infant fit? Will escape succeed?",
      foreground: {
        subjects: ["Baby Dorval's tiny body between wooden slats, wings folded tight, squeezing through"],
        emotion: "Maximum tension, desperate squeeze, life or death moment",
      },
      midground: {
        environment: ["Jalousie slats close together, light beyond, darkness behind"],
        action: ["Wedging through, wings pressed flat, final push toward freedom"],
      },
    },
  },
  {
    name: "L'Émergence vers la Lumière",
    description: "Baby Dorval traverse les jalousies. La lumière l'accueille. Survie achevée, trauma commencé.",
    sceneType: "survival",
    characterIds: ["baby-dorval"],
    locationIds: ["martinique-exterior-storm"],
    promptDetails: {
      task: "Create: Baby Dorval emerges through jalousies into light, survival achieved",
      goal: "Triumphant survival moment, but tinged with loss - freedom bought with everything",
      foreground: {
        subjects: ["Baby Dorval emerging into light, tiny form silhouetted, wings unfurling in freedom"],
        emotion: "Relief and devastation combined, survival guilt beginning, alone in the world",
      },
      midground: {
        environment: ["Exterior Caribbean landscape, storm clearing, new world without family"],
        action: ["First breath of free air, looking back at death, looking forward to unknown"],
      },
    },
  },
  {
    name: "Seul dans le Monde",
    description: "Baby Dorval à l'extérieur, minuscule contre le paysage martiniquais. Seul survivant d'un monde effacé.",
    sceneType: "establishing",
    characterIds: ["baby-dorval"],
    locationIds: ["martinique-exterior-storm"],
    promptDetails: {
      task: "Create: Baby Dorval alone in vast Caribbean landscape, sole survivor of erased world",
      goal: "Establish scale of loss - tiny figure against huge world, alone",
      foreground: {
        subjects: ["Baby Dorval as tiny silhouette, lost in vastness, alone"],
        emotion: "Utter isolation, survivor's burden, beginning of long journey",
      },
      midground: {
        environment: ["Martinique tropical landscape, post-storm clearing, beautiful indifference of nature"],
        action: ["Standing still, processing loss, beginning new existence"],
      },
    },
  },
];

// Camera angles for variations
const CAMERA_ANGLES = ["extreme_wide", "wide", "medium", "close_up", "low_angle"] as const;

function createShotFromExpansion(
  expansion: typeof GENOCIDE_EXPANSION[0],
  shotNumber: number,
  timestamp: number
): Shot {
  const shotId = `shot-exp-${timestamp}-${shotNumber}`;
  
  const prompt: MoostikPrompt = {
    task: expansion.promptDetails.task,
    deliverable: "One single cinematic frame, Pixar-dark 3D, ILM-grade VFX, 8K micro-textures",
    goal: expansion.promptDetails.goal,
    invariants: [
      "Style: Pixar-dark 3D feature-film quality, ILM-grade lighting, démoniaque mignon aesthetic",
      "Moostik: MICROSCOPIC anthropomorphic mosquitoes with large expressive amber/orange eyes, translucent wings with red veins, thin proboscis",
      "Humans: Antillean/Caribbean ONLY (ebony skin), Pixar-stylized",
      "Lighting: Dramatic cinematic lighting appropriate to scene",
      "Materials: Chitin, resin, wing-membrane, silk threads - organic only",
      "Context: Martinique/Caribbean setting, Bloodwings genocide origin",
    ],
    foreground: {
      subjects: expansion.promptDetails.foreground.subjects,
      micro_detail: [
        "Intricate chitin textures",
        "Translucent wing membranes with red veins",
        "Expressive amber compound eyes",
      ],
      emotion: expansion.promptDetails.foreground.emotion,
    },
    midground: {
      environment: expansion.promptDetails.midground.environment,
      micro_city_architecture: [],
      action: expansion.promptDetails.midground.action,
      threat: [],
    },
    background: {
      location: [],
      human_threat: [],
      martinique_cues: ["Caribbean tropical atmosphere", "Martinique cultural elements"],
    },
    lighting: {
      key: "Dramatic cinematic lighting",
      fill: "Mood-appropriate ambient",
      effects: "Volumetric atmosphere",
    },
    camera: {
      framing: "Cinematic composition",
      lens: "Macro equivalent",
      movement: "Static keyframe",
      depth_of_field: "Shallow focus on subject",
    },
    grade: {
      look: "Pixar-dark cinematic, high contrast, rich blacks",
      mood: "Démoniaque mignon - dark but beautiful",
    },
    negative_prompt: [
      "human architecture in Moostik scenes",
      "modern technology",
      "anime cartoon 2D illustration style",
      "flat shading cheap CGI",
      "oversized mosquitoes",
      "white caucasian humans",
      "readable text watermarks logos",
    ],
  };

  const variations: Variation[] = CAMERA_ANGLES.map((angle) => ({
    id: `var-${angle}-${timestamp}-${shotNumber}`,
    cameraAngle: angle,
    status: "pending" as const,
  }));

  return {
    id: shotId,
    number: shotNumber,
    name: expansion.name,
    description: expansion.description,
    sceneType: expansion.sceneType as Shot["sceneType"],
    prompt,
    characterIds: expansion.characterIds,
    locationIds: expansion.locationIds,
    variations,
    status: "pending",
    durationSeconds: 10, // Default 10 seconds for emotional scenes
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;
    const body: ExpandRequest = await request.json();
    const { sequenceId, targetShotCount } = body;

    console.log(`[Expand] Expanding sequence ${sequenceId} in episode ${episodeId} to ${targetShotCount} shots`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    // Find the act to expand
    const actIndex = episode.acts?.findIndex(a => a.id === sequenceId);
    if (actIndex === undefined || actIndex === -1) {
      return NextResponse.json(
        { error: `Sequence ${sequenceId} not found` },
        { status: 404 }
      );
    }

    const act = episode.acts![actIndex];
    const currentShotCount = act.shotIds.length;
    
    if (currentShotCount >= targetShotCount) {
      return NextResponse.json({
        success: true,
        message: `Sequence already has ${currentShotCount} shots (target: ${targetShotCount})`,
        shotsAdded: 0,
      });
    }

    // Determine which expansion to use based on sequence
    let expansionData: typeof GENOCIDE_EXPANSION;
    if (sequenceId === "seq-5" || act.title?.toLowerCase().includes("génocide") || act.title?.toLowerCase().includes("genocide")) {
      expansionData = GENOCIDE_EXPANSION;
    } else if (sequenceId === "seq-6" || act.title?.toLowerCase().includes("évasion") || act.title?.toLowerCase().includes("evasion")) {
      expansionData = ESCAPE_EXPANSION;
    } else {
      return NextResponse.json(
        { error: `No expansion data available for sequence ${sequenceId}` },
        { status: 400 }
      );
    }

    // Calculate how many shots to add
    const shotsToAdd = Math.min(
      targetShotCount - currentShotCount,
      expansionData.length
    );

    const timestamp = Date.now();
    const newShots: Shot[] = [];
    const newShotIds: string[] = [];
    const maxShotNumber = Math.max(...episode.shots.map(s => s.number || 0));

    // Create new shots from expansion data
    for (let i = 0; i < shotsToAdd; i++) {
      const expansion = expansionData[i];
      const shotNumber = maxShotNumber + 1 + i;
      const newShot = createShotFromExpansion(expansion, shotNumber, timestamp);
      
      newShots.push(newShot);
      newShotIds.push(newShot.id);
      
      console.log(`[Expand] Created shot: ${newShot.name}`);
    }

    // Update episode with new shots
    const updatedShots = [...episode.shots, ...newShots];
    const updatedActs = episode.acts!.map((a, idx) => {
      if (idx === actIndex) {
        return {
          ...a,
          shotIds: [...a.shotIds, ...newShotIds],
        };
      }
      return a;
    });

    const updatedEpisode = {
      ...episode,
      shots: updatedShots,
      acts: updatedActs,
      updatedAt: new Date().toISOString(),
    };

    await saveEpisode(updatedEpisode);

    const totalVariations = newShots.reduce((sum, s) => sum + (s.variations?.length || 0), 0);

    const response = {
      success: true,
      sequenceId,
      sequenceTitle: act.title,
      previousShotCount: currentShotCount,
      newShotCount: currentShotCount + shotsToAdd,
      shotsAdded: shotsToAdd,
      variationsAdded: totalVariations,
      newShots: newShots.map(s => ({
        id: s.id,
        name: s.name,
        sceneType: s.sceneType,
        variationCount: s.variations?.length || 0,
      })),
      totalEpisodeShots: updatedShots.length,
    };

    console.log(`[Expand] Done: Added ${shotsToAdd} shots to ${act.title}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Expand] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
