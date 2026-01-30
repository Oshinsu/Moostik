/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MOOSTIK DESIGN SYSTEM - THÈME UI COMPLET
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Système de design inspiré de l'univers Bloodwings
 * Style: Pixar démoniaque + Renaissance bio-organique
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PALETTE DE COULEURS BLOODWINGS
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_COLORS = {
  // Couleurs primaires
  obsidian: {
    50: "#1a1a1e",
    100: "#14131a",
    200: "#0f0e12",
    300: "#0b0b0e",
    400: "#08080a",
    500: "#050506",
    DEFAULT: "#0b0b0e",
  },
  
  blood: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#f87171",
    400: "#dc2626",
    500: "#b91c1c",
    600: "#991b1b",
    700: "#8b0015",
    800: "#6b0012",
    900: "#450010",
    DEFAULT: "#8b0015",
  },
  
  crimson: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#b0002a",
    800: "#9f1239",
    900: "#881337",
    DEFAULT: "#b0002a",
  },
  
  copper: {
    50: "#fdf8f3",
    100: "#faebd7",
    200: "#f5d5a8",
    300: "#e8b86d",
    400: "#d4a017",
    500: "#9b6a3a",
    600: "#8b5a2b",
    700: "#704214",
    800: "#5c3310",
    900: "#4a2c0f",
    DEFAULT: "#9b6a3a",
  },
  
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#ffb25a",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    DEFAULT: "#ffb25a",
  },
  
  // Couleurs sémantiques
  surface: {
    base: "#0b0b0e",
    elevated: "#14131a",
    overlay: "#1a1a1e",
    highlight: "#252428",
  },
  
  border: {
    subtle: "#1f1e24",
    default: "#2a282f",
    strong: "#3a3740",
    blood: "#8b001540",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENTS MOOSTIK
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_GRADIENTS = {
  // Gradients de fond
  bloodMist: "bg-gradient-to-br from-blood-900/20 via-obsidian-300 to-crimson-900/10",
  darkCathedral: "bg-gradient-to-b from-obsidian-200 via-obsidian-300 to-blood-900/30",
  amberGlow: "bg-gradient-to-tr from-obsidian-300 via-obsidian-200 to-amber-500/5",
  
  // Gradients pour texte
  bloodText: "bg-gradient-to-r from-blood-500 to-crimson-600 bg-clip-text text-transparent",
  amberText: "bg-gradient-to-r from-amber-400 to-copper-500 bg-clip-text text-transparent",
  
  // Gradients pour boutons
  bloodButton: "bg-gradient-to-r from-blood-700 via-blood-600 to-crimson-700",
  copperButton: "bg-gradient-to-r from-copper-600 via-copper-500 to-amber-600",
  
  // Gradients d'overlay
  fadeUp: "bg-gradient-to-t from-obsidian-300 via-obsidian-300/80 to-transparent",
  fadeDown: "bg-gradient-to-b from-obsidian-300 via-obsidian-300/80 to-transparent",
  bloodOverlay: "bg-gradient-to-t from-blood-900/60 via-blood-900/20 to-transparent",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS MOOSTIK
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_ANIMATIONS = {
  // Keyframes CSS
  keyframes: {
    bloodPulse: {
      "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(139, 0, 21, 0.4)" },
      "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(139, 0, 21, 0.6)" },
    },
    wingFlutter: {
      "0%, 100%": { transform: "scaleY(1)" },
      "50%": { transform: "scaleY(0.95)" },
    },
    proboscisGlow: {
      "0%, 100%": { filter: "brightness(1)" },
      "50%": { filter: "brightness(1.2)" },
    },
    floatGently: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-5px)" },
    },
  },
  
  // Classes d'animation
  classes: {
    pulse: "animate-pulse",
    bloodPulse: "animate-blood-pulse",
    float: "animate-float",
    glow: "animate-glow",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS UI MOOSTIK
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_COMPONENTS = {
  // Boutons
  button: {
    primary: "bg-gradient-to-r from-blood-700 via-blood-600 to-crimson-700 hover:from-blood-600 hover:via-blood-500 hover:to-crimson-600 text-white font-medium shadow-lg shadow-blood-900/30 border border-blood-600/50 transition-all duration-300",
    secondary: "bg-obsidian-200 hover:bg-obsidian-100 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300",
    ghost: "bg-transparent hover:bg-blood-900/20 text-blood-400 hover:text-blood-300 transition-all duration-300",
    danger: "bg-crimson-700 hover:bg-crimson-600 text-white shadow-lg shadow-crimson-900/30",
  },
  
  // Cards
  card: {
    default: "bg-obsidian-200/80 backdrop-blur-sm border border-blood-900/20 rounded-xl shadow-xl shadow-blood-900/10",
    elevated: "bg-obsidian-100/90 backdrop-blur-md border border-blood-800/30 rounded-xl shadow-2xl shadow-blood-900/20",
    blood: "bg-gradient-to-br from-blood-900/30 to-obsidian-200 border border-blood-700/30 rounded-xl",
  },
  
  // Input
  input: {
    default: "bg-obsidian-200 border border-blood-900/30 focus:border-blood-600 focus:ring-1 focus:ring-blood-600/50 text-white placeholder:text-zinc-500 rounded-lg transition-all",
  },
  
  // Badge
  badge: {
    blood: "bg-blood-900/60 text-blood-300 border border-blood-700/50",
    amber: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
    copper: "bg-copper-900/60 text-copper-300 border border-copper-700/50",
    crimson: "bg-crimson-900/60 text-crimson-300 border border-crimson-700/50",
  },
  
  // Navigation
  nav: {
    item: "flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-blood-900/20 transition-all duration-200",
    itemActive: "flex items-center gap-3 px-3 py-2 rounded-lg text-amber-400 bg-blood-900/30 border-l-2 border-blood-500",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COPYWRITING MOOSTIK
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_COPY = {
  // Titres de pages
  titles: {
    dashboard: "Quartier Général",
    characters: "Les Bloodwings",
    locations: "Territoires",
    library: "Archives Visuelles",
    lore: "Bible Sacrée",
    references: "Galerie des Âmes",
    episode: "Chroniques",
  },
  
  // Sous-titres
  subtitles: {
    dashboard: "Centre de commandement des opérations",
    characters: "Les âmes qui portent notre vengeance",
    locations: "Nos terres, notre sang, notre histoire",
    library: "Chaque image est un souvenir de sang",
    lore: "La vérité écrite dans le sang de nos ancêtres",
    references: "Visages et lieux gravés dans l'éternité",
  },
  
  // Actions
  actions: {
    generate: "Invoquer l'Image",
    download: "Capturer",
    delete: "Purger",
    edit: "Modifier",
    save: "Sceller",
    cancel: "Abandonner",
    confirm: "Confirmer le Pacte",
    viewAll: "Voir les Archives",
    createNew: "Créer une Nouvelle Chronique",
  },
  
  // Messages
  messages: {
    loading: "Les esprits travaillent...",
    success: "Le sang a parlé. C'est fait.",
    error: "Les ancêtres sont mécontents.",
    empty: "Aucune âme ne répond à l'appel.",
    generating: "L'image prend forme dans le sang...",
  },
  
  // Tooltips
  tooltips: {
    proboscis: "La trompe - notre seule arme",
    bloodwings: "Nous sommes les vrais vampires",
    genocide: "Jamais oublier. Jamais pardonner.",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ICÔNES PERSONNALISÉES (DESCRIPTIONS POUR NB2)
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_ICONS_PROMPTS = {
  logo: `Minimalist blood-drop eye icon, stylized crimson teardrop shape with elegant eye pupil inside, vector-style clean lines, obsidian black background, blood red (#8B0015) main color with warm amber (#FFB25A) eye highlight, suitable for app icon, premium quality, simple memorable design`,
  
  dashboard: `Minimalist icon of Gothic cathedral spire with blood drop finial, simple geometric shapes, blood red on dark background, vector style`,
  
  characters: `Minimalist icon of mosquito silhouette in profile with visible proboscis, stylized elegant, blood red on dark background, vector style`,
  
  locations: `Minimalist icon of Renaissance arch with blood drop keystone, simple geometric, blood red on dark background, vector style`,
  
  library: `Minimalist icon of stacked scrolls with blood wax seal, simple geometric, blood red and amber on dark background, vector style`,
  
  lore: `Minimalist icon of ancient book with blood drop emblem on cover, simple geometric, blood red on dark background, vector style`,
  
  generate: `Minimalist icon of proboscis needle with blood drop tip, glowing effect, blood red and amber on dark background, vector style`,
  
  background: `Dark atmospheric texture, microscopic view of wing membrane veins, translucent crimson patterns on obsidian black, subtle blood-red glow, suitable for web background, seamless tileable, 8K texture`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT COMPLET
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_THEME = {
  colors: MOOSTIK_COLORS,
  gradients: MOOSTIK_GRADIENTS,
  animations: MOOSTIK_ANIMATIONS,
  components: MOOSTIK_COMPONENTS,
  copy: MOOSTIK_COPY,
  icons: MOOSTIK_ICONS_PROMPTS,
} as const;
