import { NextRequest, NextResponse } from "next/server";
import { 
  generateMusicalGrid, 
  generateCutPoints,
  DEFAULT_AUTO_EDIT_CONFIG,
  type AudioAnalysis,
  type MusicalGrid,
  type CutPoint,
  type AutoEditConfig,
} from "@/lib/audio/beat-sync";

// ============================================================================
// AUDIO ANALYSIS API
// 
// Analyse un fichier audio pour extraire:
// - BPM (tempo)
// - Positions des beats
// - Grille musicale complète
// - Points de cut suggérés
//
// NOTA: Pour l'analyse BPM côté serveur, on utilise une approche simplifiée
// car music-tempo nécessite Web Audio API. En production, on peut:
// 1. Utiliser un service Python avec librosa
// 2. Faire l'analyse côté client et envoyer les résultats
// 3. Utiliser une API externe (Spotify Audio Analysis, etc.)
// ============================================================================

interface AnalyzeRequest {
  // Option 1: URL du fichier audio
  audioUrl?: string;
  
  // Option 2: BPM déjà connu (skip l'analyse)
  knownBpm?: number;
  
  // Durée de l'audio en secondes
  duration: number;
  
  // Configuration optionnelle
  timeSignature?: {
    numerator: number;
    denominator: number;
  };
  
  // Config pour les cut points
  editConfig?: Partial<AutoEditConfig>;
}

interface AnalyzeResponse {
  analysis: AudioAnalysis;
  grid: MusicalGrid;
  cutPoints: CutPoint[];
  stats: {
    totalBeats: number;
    totalMeasures: number;
    suggestedCuts: number;
    beatDuration: number;
    measureDuration: number;
  };
}

// BPM par défaut si non spécifié (pour tests)
const DEFAULT_BPM = 120;

/**
 * POST /api/audio/analyze
 * 
 * Analyse un fichier audio et retourne la grille musicale
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    
    const {
      audioUrl,
      knownBpm,
      duration,
      timeSignature = { numerator: 4, denominator: 4 },
      editConfig,
    } = body;
    
    if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: "Duration is required and must be positive" },
        { status: 400 }
      );
    }
    
    // Déterminer le BPM
    let bpm = knownBpm || DEFAULT_BPM;
    let confidence = 1.0;
    
    // Si on a une URL audio et pas de BPM connu, on peut analyser
    // Note: L'analyse réelle nécessite Web Audio API (côté client)
    // ou un service Python avec librosa (côté serveur)
    if (audioUrl && !knownBpm) {
      // Pour l'instant, on utilise le BPM par défaut
      // TODO: Implémenter analyse avec service externe
      console.log(`[Audio Analysis] Would analyze: ${audioUrl}`);
      bpm = DEFAULT_BPM;
      confidence = 0.8; // Indique que c'est une estimation
    }
    
    // Générer la grille musicale
    const grid = generateMusicalGrid(bpm, duration, timeSignature);
    
    // Générer les cut points
    const config: AutoEditConfig = {
      ...DEFAULT_AUTO_EDIT_CONFIG,
      ...editConfig,
    };
    const cutPoints = generateCutPoints(grid, config);
    
    // Construire l'analyse
    const analysis: AudioAnalysis = {
      bpm,
      confidence,
      beats: grid.beats,
      measures: grid.measures,
      duration,
      timeSignature,
    };
    
    // Stats
    const stats = {
      totalBeats: grid.beats.length,
      totalMeasures: grid.measures.length,
      suggestedCuts: cutPoints.length,
      beatDuration: grid.beatDuration,
      measureDuration: grid.measureDuration,
    };
    
    const response: AnalyzeResponse = {
      analysis,
      grid,
      cutPoints,
      stats,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("[Audio Analysis] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audio/analyze?bpm=120&duration=180
 * 
 * Version simplifiée pour générer une grille avec BPM connu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const bpm = parseInt(searchParams.get("bpm") || "120");
    const duration = parseFloat(searchParams.get("duration") || "180");
    const numerator = parseInt(searchParams.get("numerator") || "4");
    const denominator = parseInt(searchParams.get("denominator") || "4");
    
    // Paramètres de cut
    const minCut = parseFloat(searchParams.get("minCut") || "2");
    const maxCut = parseFloat(searchParams.get("maxCut") || "8");
    const preferredCuts = (searchParams.get("cuts") || "quarter,half").split(",") as any[];
    
    const timeSignature = { numerator, denominator };
    const grid = generateMusicalGrid(bpm, duration, timeSignature);
    
    const config: AutoEditConfig = {
      ...DEFAULT_AUTO_EDIT_CONFIG,
      minCutDuration: minCut,
      maxCutDuration: maxCut,
      preferredCuts,
    };
    
    const cutPoints = generateCutPoints(grid, config);
    
    return NextResponse.json({
      bpm,
      duration,
      timeSignature,
      beatDuration: grid.beatDuration,
      measureDuration: grid.measureDuration,
      totalBeats: grid.beats.length,
      totalMeasures: grid.measures.length,
      suggestedCuts: cutPoints.length,
      cutPoints: cutPoints.slice(0, 50), // Limiter pour la réponse
      grid: {
        measures: grid.measures.slice(0, 20),
        beats: grid.beats.slice(0, 50),
      },
    });
    
  } catch (error) {
    console.error("[Audio Analysis] Error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
