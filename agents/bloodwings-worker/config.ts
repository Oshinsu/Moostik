// ============================================================================
// BLOODWINGS WORKER - OpenClaw Agent Configuration
// ============================================================================
// Un agent autonome qui exécute le pipeline de production Bloodwings
// Tourne en mode "heartbeat" toutes les 30 minutes
// ============================================================================

export interface WorkerConfig {
  name: string;
  version: string;
  persona: string;
  skills: string[];
  constraints: {
    maxConcurrentGenerations: number;
    maxDailySpend: number;
    requireHumanApproval: string[];
  };
  heartbeat: string;
  providers: {
    image: string[];
    video: string[];
  };
  storage: {
    queue: string;
    outputs: string;
    logs: string;
  };
  notifications: {
    discord?: string;
    slack?: string;
    email?: string;
  };
}

export const BLOODWINGS_WORKER_CONFIG: WorkerConfig = {
  name: "BloodwingsWorker",
  version: "0.1.0",

  // Personnalité de l'agent
  persona: `Tu es un directeur artistique senior pour Bloodwings Studio.
Tu génères des shots pour la série animée MOOSTIK avec précision et cohérence.
Tu respectes strictement le JSON Standard et les invariants visuels définis.
Tu es méticuleux, patient, et tu ne compromets jamais sur la qualité.
Si un shot ne respecte pas les standards, tu le régénères.
Tu documentes chaque décision dans les logs.`,

  // Compétences disponibles
  skills: [
    "read_json_episode",       // Parser les fichiers épisode JSON
    "validate_invariants",     // Vérifier la cohérence visuelle
    "generate_image_replicate", // Génération image via Replicate/Flux
    "generate_image_fal",      // Génération image via Fal.ai
    "generate_video_kling",    // Génération vidéo via Kling
    "generate_video_runway",   // Génération vidéo via Runway
    "generate_video_veo",      // Génération vidéo via Veo
    "chain_first_last_frame",  // Chaînage cohérent entre shots
    "apply_beat_sync",         // Synchronisation audio BPM
    "upscale_4k",              // Upscaling haute résolution
    "export_renders",          // Export vers storage
    "update_database",         // Mise à jour Supabase
    "notify_discord",          // Notification Discord
    "generate_thumbnail",      // Création de vignettes
    "compile_preview",         // Compilation de preview
  ],

  // Contraintes de sécurité
  constraints: {
    maxConcurrentGenerations: 3,  // Max 3 générations en parallèle
    maxDailySpend: 50,            // Max $50/jour en API calls
    requireHumanApproval: [
      "delete",                    // Suppression de fichiers
      "publish",                   // Publication publique
      "modify_lore",               // Modification du lore canon
      "exceed_budget",             // Dépassement de budget
    ],
  },

  // Schedule d'exécution (cron)
  heartbeat: "*/30 * * * *", // Toutes les 30 minutes

  // Providers de génération
  providers: {
    image: ["replicate", "fal"],
    video: ["kling", "runway", "veo"],
  },

  // Chemins de stockage
  storage: {
    queue: "supabase://bloodwings/generation_queue",
    outputs: "supabase://bloodwings/renders",
    logs: "./logs/worker",
  },

  // Canaux de notification
  notifications: {
    discord: process.env.DISCORD_WEBHOOK_URL,
    // slack: process.env.SLACK_WEBHOOK_URL,
    // email: process.env.ALERT_EMAIL,
  },
};

// ============================================================================
// QUEUE ITEM INTERFACE
// ============================================================================

export interface QueueItem {
  id: string;
  episodeId: string;
  shotId: string;
  variationIndex: number;
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  provider: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  outputUrl?: string;
  cost?: number;
}

// ============================================================================
// WORKER STATE
// ============================================================================

export interface WorkerState {
  isRunning: boolean;
  currentItems: QueueItem[];
  dailySpend: number;
  lastHeartbeat: string;
  totalGenerated: number;
  totalFailed: number;
  uptime: number;
}

// ============================================================================
// DEFAULT GENERATION PARAMS
// ============================================================================

export const DEFAULT_GENERATION_PARAMS = {
  image: {
    width: 1920,
    height: 1080,
    steps: 30,
    guidance: 7.5,
    scheduler: "euler_ancestral",
  },
  video: {
    duration: 5,
    fps: 24,
    motion_bucket_id: 127,
  },
  upscale: {
    factor: 2,
    model: "real-esrgan",
  },
};

// ============================================================================
// COST ESTIMATES (USD)
// ============================================================================

export const COST_ESTIMATES = {
  replicate_flux: 0.003,      // Per image
  fal_flux: 0.002,            // Per image
  kling_video: 0.15,          // Per 5s video
  runway_video: 0.20,         // Per 5s video
  veo_video: 0.25,            // Per 5s video
  upscale_4k: 0.01,           // Per image
};

export function estimateCost(items: QueueItem[]): number {
  return items.reduce((total, item) => {
    const baseCost = COST_ESTIMATES[item.provider as keyof typeof COST_ESTIMATES] || 0.10;
    return total + baseCost;
  }, 0);
}
