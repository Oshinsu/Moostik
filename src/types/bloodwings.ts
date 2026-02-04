/**
 * BLOODWINGS STUDIO - Types principaux
 * 
 * Architecture:
 * - Public: Pages marketing (Landing, Série Moostik, Studio, Pricing)
 * - App: Dashboard utilisateurs connectés
 * - Community: Hub communautaire + soumission épisodes
 */

// ============================================================================
// TIERS & PLANS
// ============================================================================

export type PlanTier = "free" | "creator" | "studio" | "production" | "enterprise";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  nameFr: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    imagesPerMonth: number;
    videosPerMonth: number;
    videoSeconds: number;
    universes: number;
    episodesPerMonth: number;
    exportQuality: "720p" | "1080p" | "4K" | "4K_HDR";
    beatSyncSymphonies: number;
    multiProvider: boolean;
    edlExport: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    support: "community" | "email" | "priority" | "slack" | "dedicated";
  };
  limits: {
    maxCreditsPerMonth: number;
    rolloverCredits: boolean;
    teamMembers: number;
  };
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    nameFr: "Gratuit",
    price: { monthly: 0, yearly: 0 },
    features: {
      imagesPerMonth: 20,
      videosPerMonth: 5,
      videoSeconds: 5,
      universes: 1,
      episodesPerMonth: 0,
      exportQuality: "720p",
      beatSyncSymphonies: 0,
      multiProvider: false,
      edlExport: false,
      apiAccess: false,
      whiteLabel: false,
      support: "community",
    },
    limits: {
      maxCreditsPerMonth: 50,
      rolloverCredits: false,
      teamMembers: 1,
    },
  },
  creator: {
    id: "creator",
    name: "Creator",
    nameFr: "Créateur",
    price: { monthly: 129, yearly: 1290 },
    features: {
      imagesPerMonth: 100,
      videosPerMonth: 30,
      videoSeconds: 5,
      universes: 1,
      episodesPerMonth: 2,
      exportQuality: "1080p",
      beatSyncSymphonies: 5,
      multiProvider: false,
      edlExport: false,
      apiAccess: false,
      whiteLabel: false,
      support: "email",
    },
    limits: {
      maxCreditsPerMonth: 200,
      rolloverCredits: false,
      teamMembers: 1,
    },
  },
  studio: {
    id: "studio",
    name: "Studio",
    nameFr: "Studio",
    price: { monthly: 349, yearly: 3490 },
    features: {
      imagesPerMonth: 500,
      videosPerMonth: 150,
      videoSeconds: 10,
      universes: 3,
      episodesPerMonth: 5,
      exportQuality: "4K",
      beatSyncSymphonies: 20,
      multiProvider: true,
      edlExport: true,
      apiAccess: false,
      whiteLabel: false,
      support: "priority",
    },
    limits: {
      maxCreditsPerMonth: 800,
      rolloverCredits: true,
      teamMembers: 3,
    },
  },
  production: {
    id: "production",
    name: "Production",
    nameFr: "Production",
    price: { monthly: 799, yearly: 7990 },
    features: {
      imagesPerMonth: 1500,
      videosPerMonth: 500,
      videoSeconds: 10,
      universes: 10,
      episodesPerMonth: 15,
      exportQuality: "4K_HDR",
      beatSyncSymphonies: 20,
      multiProvider: true,
      edlExport: true,
      apiAccess: true,
      whiteLabel: false,
      support: "slack",
    },
    limits: {
      maxCreditsPerMonth: 2500,
      rolloverCredits: true,
      teamMembers: 10,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    nameFr: "Entreprise",
    price: { monthly: 1499, yearly: 14990 },
    features: {
      imagesPerMonth: 5000,
      videosPerMonth: 2000,
      videoSeconds: 10,
      universes: -1, // illimité
      episodesPerMonth: -1, // illimité
      exportQuality: "4K_HDR",
      beatSyncSymphonies: 20,
      multiProvider: true,
      edlExport: true,
      apiAccess: true,
      whiteLabel: true,
      support: "dedicated",
    },
    limits: {
      maxCreditsPerMonth: 10000,
      rolloverCredits: true,
      teamMembers: -1, // illimité
    },
  },
};

// ============================================================================
// CRÉDITS
// ============================================================================

export type CreditType = "image" | "video_second" | "audio_second" | "export";

export interface CreditCost {
  type: CreditType;
  amount: number;
  description: string;
}

export const CREDIT_COSTS: Record<string, CreditCost> = {
  image_standard: { type: "image", amount: 1, description: "Image standard (Flux Schnell)" },
  image_hd: { type: "image", amount: 2, description: "Image HD (Flux Pro)" },
  video_runway_turbo: { type: "video_second", amount: 2, description: "Vidéo Runway Turbo/s" },
  video_runway_alpha: { type: "video_second", amount: 4, description: "Vidéo Runway Alpha/s" },
  video_kling: { type: "video_second", amount: 3, description: "Vidéo Kling/s" },
  video_kling_audio: { type: "video_second", amount: 6, description: "Vidéo Kling + Audio/s" },
  export_1080p: { type: "export", amount: 5, description: "Export 1080p" },
  export_4k: { type: "export", amount: 15, description: "Export 4K" },
};

export interface UserCredits {
  userId: string;
  plan: PlanTier;
  credits: {
    available: number;
    used: number;
    monthlyAllowance: number;
    bonusCredits: number;
    rollover: number;
  };
  usage: {
    imagesGenerated: number;
    videosGenerated: number;
    exportsCompleted: number;
  };
  resetDate: Date;
}

// ============================================================================
// UTILISATEURS
// ============================================================================

export interface BloodwingsUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  
  // Plan & Billing
  plan: PlanTier;
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing";
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
  
  // Credits
  credits: UserCredits;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Community
  communityProfile?: {
    username: string;
    bio?: string;
    avatarMoostik?: string; // URL de l'avatar Moostik créé
    followers: number;
    following: number;
    totalLikes: number;
    badges: string[];
  };
  
  // Settings
  settings: {
    theme: "dark" | "blood" | "light";
    language: "fr" | "en";
    notifications: {
      email: boolean;
      community: boolean;
      marketing: boolean;
    };
  };
}

// ============================================================================
// PROJETS / UNIVERS
// ============================================================================

export interface BloodwingsProject {
  id: string;
  userId: string;
  
  // Info
  name: string;
  description?: string;
  coverImage?: string;
  
  // Universe Bible
  universe: {
    title: string;
    logline?: string;
    genre: string[];
    tone: string;
    setting: string;
  };
  
  // Content
  charactersCount: number;
  locationsCount: number;
  episodesCount: number;
  
  // Stats
  totalImages: number;
  totalVideos: number;
  totalCreditsUsed: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt?: Date;
  
  // Sharing
  isPublic: boolean;
  communitySubmission?: {
    status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "published";
    submittedAt?: Date;
    reviewedAt?: Date;
    feedback?: string;
    revenueShare?: number; // 0.15 = 15%
  };
}

// ============================================================================
// COMMUNAUTÉ
// ============================================================================

export type CommunityPostType = "creation" | "episode_submission" | "avatar" | "discussion" | "tutorial";

export interface CommunityPost {
  id: string;
  userId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    avatarMoostik?: string;
    badges: string[];
  };
  
  type: CommunityPostType;
  
  // Content
  title: string;
  content: string;
  mediaUrls: string[];
  thumbnailUrl?: string;
  
  // For episode submissions
  episodeSubmission?: {
    projectId: string;
    episodeNumber: number;
    synopsis: string;
    duration: number;
    status: "pending" | "reviewing" | "approved" | "rejected" | "published";
    revenueEarned?: number;
  };
  
  // For avatar creations
  avatarCreation?: {
    name: string;
    clan: string;
    abilities: string[];
    backstory: string;
    imageUrl: string;
    jsonMoostik: object;
  };
  
  // Engagement
  likes: number;
  comments: number;
  shares: number;
  views: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Moderation
  isApproved: boolean;
  isFeatured: boolean;
  isPinned: boolean;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  createdAt: Date;
  parentCommentId?: string;
  replies?: CommunityComment[];
}

// ============================================================================
// AVATARS MOOSTIK
// ============================================================================

export type MoostikClan = 
  | "bloodwing"    // Ailes de sang - Guerriers
  | "shadowveil"   // Voile d'ombre - Espions
  | "stormborn"    // Nés de la tempête - Élémentaux
  | "ironheart"    // Cœur de fer - Protecteurs
  | "voidwalker"   // Marcheurs du vide - Mystiques
  | "sunfire"      // Feu solaire - Guérisseurs
  | "nightfang"    // Crocs de nuit - Chasseurs
  | "crystalmind"; // Esprit cristal - Sages

export interface MoostikAvatar {
  id: string;
  userId: string;
  
  // Identity
  name: string;
  clan: MoostikClan;
  title?: string; // "Le Marcheur de Cendres"
  
  // Appearance
  basePhotoUrl: string;      // Photo originale uploadée
  referenceImageUrl: string; // Image générée style Moostik
  thumbnailUrl: string;
  
  // Lore
  backstory: string;
  personality: string[];
  abilities: string[];
  weakness?: string;
  
  // JSON Moostik (format standard)
  jsonMoostik: {
    version: string;
    character: {
      name: string;
      clan: MoostikClan;
      visualDescription: string;
      colorPalette: string[];
      distinguishingFeatures: string[];
    };
    promptTemplate: string;
    negativePrompt: string;
  };
  
  // Community
  isPublic: boolean;
  likes: number;
  usedInEpisodes: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export const MOOSTIK_CLANS: Record<MoostikClan, {
  name: string;
  nameFr: string;
  description: string;
  color: string;
  icon: string;
  abilities: string[];
}> = {
  bloodwing: {
    name: "Bloodwing",
    nameFr: "Aile de Sang",
    description: "Guerriers ancestraux aux ailes carmines",
    color: "#8B0000",
    icon: "🩸",
    abilities: ["Combat", "Vol", "Régénération"],
  },
  shadowveil: {
    name: "Shadowveil",
    nameFr: "Voile d'Ombre",
    description: "Maîtres de l'infiltration et des secrets",
    color: "#1a1a2e",
    icon: "🌑",
    abilities: ["Invisibilité", "Télépathie", "Illusions"],
  },
  stormborn: {
    name: "Stormborn",
    nameFr: "Né de la Tempête",
    description: "Élémentaux de foudre et de vent",
    color: "#4a90d9",
    icon: "⚡",
    abilities: ["Foudre", "Vol", "Contrôle météo"],
  },
  ironheart: {
    name: "Ironheart",
    nameFr: "Cœur de Fer",
    description: "Protecteurs inébranlables",
    color: "#708090",
    icon: "🛡️",
    abilities: ["Bouclier", "Endurance", "Commandement"],
  },
  voidwalker: {
    name: "Voidwalker",
    nameFr: "Marcheur du Vide",
    description: "Mystiques des dimensions parallèles",
    color: "#4B0082",
    icon: "🌀",
    abilities: ["Téléportation", "Vision", "Manipulation spatiale"],
  },
  sunfire: {
    name: "Sunfire",
    nameFr: "Feu Solaire",
    description: "Guérisseurs de lumière ardente",
    color: "#FFD700",
    icon: "☀️",
    abilities: ["Guérison", "Purification", "Lumière"],
  },
  nightfang: {
    name: "Nightfang",
    nameFr: "Croc de Nuit",
    description: "Chasseurs nocturnes implacables",
    color: "#2d1b4e",
    icon: "🐺",
    abilities: ["Traque", "Vision nocturne", "Métamorphose"],
  },
  crystalmind: {
    name: "Crystalmind",
    nameFr: "Esprit Cristal",
    description: "Sages aux connaissances infinies",
    color: "#00CED1",
    icon: "💎",
    abilities: ["Sagesse", "Mémoire", "Précognition"],
  },
};

// ============================================================================
// NAVIGATION & ROUTES
// ============================================================================

export const ROUTES = {
  // ==========================================
  // PUBLIC MARKETING PAGES
  // ==========================================
  home: "/",
  moostik: "/moostik",
  studio: "/studio",
  series: "/series",
  seriesCharacters: "/series/characters",
  seriesLocations: "/series/locations",
  seriesLore: "/series/lore",
  watch: (id: string) => `/watch/${id}`,
  emergentAi: "/emergent-ai",
  pricing: "/pricing",
  emergentAi: "/emergent-ai",
  contact: "/contact",

  // Legal
  legal: "/legal",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",

  // ==========================================
  // SERIES VIEWER (Public Content)
  // ==========================================
  series: "/series",
  seriesDetail: (id: string) => `/series/${id}`,
  seriesCharacters: "/series/characters",
  seriesCharacter: (id: string) => `/series/characters/${id}`,
  seriesLocations: "/series/locations",
  seriesLocation: (id: string) => `/series/locations/${id}`,
  seriesLore: "/series/lore",
  seriesTimeline: "/series/timeline",
  watch: (id: string) => `/watch/${id}`,

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  login: "/auth/login",
  signup: "/auth/signup",

  // ==========================================
  // APP DASHBOARD (Authenticated)
  // ==========================================
  dashboard: "/app/dashboard",
  app: "/app",
  appAgents: "/app/agents",
  appSwarm: "/app/swarm",
  appRealityBleed: "/app/reality-bleed",
  appMolt: "/app/molt",
  appCredits: "/app/credits",
  appSettings: "/app/settings",

  // ==========================================
  // CREATION STUDIO (Authenticated)
  // ==========================================
  editor: "/editor",
  generate: "/generate",
  video: "/video",
  cinema: "/cinema",
  shots: "/shots",

  // ==========================================
  // CONTENT LIBRARY
  // ==========================================
  library: "/library",
  libraryEpisodeImages: (id: string) => `/library/episodes/${id}/images`,
  libraryEpisodeVideos: (id: string) => `/library/episodes/${id}/videos`,
  characters: "/characters",
  locations: "/locations",
  lore: "/lore",
  references: "/references",
  episode: (id: string) => `/episode/${id}`,
  promo: "/promo",

  // ==========================================
  // USER
  // ==========================================
  profile: "/profile",
  admin: "/admin",

  // ==========================================
  // COMMUNITY
  // ==========================================
  community: "/community",
  communityGallery: "/community/gallery",
  communitySubmit: "/community/submit",
  communityAvatar: "/community/avatar",
  communityPost: (id: string) => `/community/post/${id}`,
  communityProfile: (username: string) => `/community/u/${username}`,

  // ==========================================
  // DEPRECATED (kept for backward compatibility)
  // ==========================================
  /** @deprecated Use seriesCharacters instead */
  moostikCharacters: "/series/characters",
  /** @deprecated Use seriesLore instead */
  moostikWorld: "/series/lore",
  /** @deprecated Use watch instead */
  moostikWatch: (id: string) => `/watch/${id}`,
  /** @deprecated Use appCredits instead */
  credits: "/app/credits",
  /** @deprecated Use appSettings instead */
  settings: "/app/settings",
} as const;
