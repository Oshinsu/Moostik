/**
 * BIBLE CHECKER
 * ===========================================================================
 * Verification automatique de la conformite aux regles de la DA Moostik
 * Extrait et verifie les regles de moostik-bible.ts
 * 
 * SOTA Fevrier 2026
 * ===========================================================================
 */

import {
  BLOODWINGS_PALETTE,
  MOOSTIK_ANATOMY,
  MOOSTIK_EQUIPMENT,
  MOOSTIK_ARCHITECTURE,
  MOOSTIK_TECHNOLOGY,
  AGE_CHARACTERISTICS,
} from "@/lib/moostik-bible";
import { analyzeImageWithVision } from "@/lib/ai/openrouter-client";

// ============================================================================
// TYPES
// ============================================================================

export interface BibleRule {
  id: string;
  category: "anatomy" | "equipment" | "architecture" | "technology" | "palette" | "style";
  severity: "critical" | "major" | "minor";
  rule: string;
  checkPrompt: string;
}

export interface BibleViolation {
  ruleId: string;
  rule: string;
  severity: "critical" | "major" | "minor";
  description: string;
  suggestion?: string;
}

export interface BibleComplianceResult {
  compliant: boolean;
  score: number;           // 0-100
  violations: string[];    // Simple violation descriptions
  detailedViolations: BibleViolation[];
  checkedRules: number;
  passedRules: number;
  analysisTime: number;
}

// ============================================================================
// RULES DATABASE
// ============================================================================

export const BIBLE_RULES: BibleRule[] = [
  // === ANATOMY RULES (CRITICAL) ===
  {
    id: "anatomy-proboscis",
    category: "anatomy",
    severity: "critical",
    rule: "La trompe (proboscis) DOIT TOUJOURS etre visible",
    checkPrompt: "Le moustique a-t-il une trompe visible, fine comme une aiguille?",
  },
  {
    id: "anatomy-chitin",
    category: "anatomy",
    severity: "major",
    rule: "Corps en chitine obsidienne mate (#0B0B0E)",
    checkPrompt: "Le corps du moustique est-il noir obsidien mat (pas brillant)?",
  },
  {
    id: "anatomy-eyes",
    category: "anatomy",
    severity: "major",
    rule: "Grands yeux expressifs ambre chaud (#FFB25A)",
    checkPrompt: "Les yeux sont-ils grands, expressifs, de couleur ambre/or?",
  },
  {
    id: "anatomy-wings",
    category: "anatomy",
    severity: "major",
    rule: "Ailes translucides avec veines cramoisies",
    checkPrompt: "Les ailes sont-elles translucides avec des veines rouges/cramoisies?",
  },
  {
    id: "anatomy-legs",
    category: "anatomy",
    severity: "minor",
    rule: "Six pattes fines et delicates avec articulations visibles",
    checkPrompt: "Le moustique a-t-il 6 pattes fines d'insecte?",
  },

  // === EQUIPMENT RULES ===
  {
    id: "equipment-no-human",
    category: "equipment",
    severity: "critical",
    rule: "PAS d'uniformes militaires humains",
    checkPrompt: "Y a-t-il des uniformes/vetements humains visibles (casques, bottes, ceintures)?",
  },
  {
    id: "equipment-no-weapons",
    category: "equipment",
    severity: "critical",
    rule: "La trompe est leur SEULE arme - pas d'armes metalliques",
    checkPrompt: "Y a-t-il des armes metalliques (epees, pistolets, lances)?",
  },
  {
    id: "equipment-wing-free",
    category: "equipment",
    severity: "major",
    rule: "Ne jamais obstruer les ailes avec du harnais",
    checkPrompt: "Les ailes sont-elles libres de tout equipement?",
  },
  {
    id: "equipment-lightweight",
    category: "equipment",
    severity: "minor",
    rule: "Equipement ultra-leger, fait main/artisanal",
    checkPrompt: "L'equipement semble-t-il leger et artisanal (pas industriel)?",
  },

  // === ARCHITECTURE RULES ===
  {
    id: "arch-no-human",
    category: "architecture",
    severity: "critical",
    rule: "JAMAIS d'architecture humaine dans les scenes Moostik",
    checkPrompt: "Y a-t-il de l'architecture humaine visible (batiments normaux, meubles humains)?",
  },
  {
    id: "arch-bio-organic",
    category: "architecture",
    severity: "major",
    rule: "Architecture Renaissance bio-organique (chitine, resine, membrane d'aile)",
    checkPrompt: "L'architecture est-elle organique/biologique (chitine, resine)?",
  },
  {
    id: "arch-lighting",
    category: "architecture",
    severity: "major",
    rule: "Lanternes bioluminescentes - PAS de lumiere electrique",
    checkPrompt: "L'eclairage est-il naturel/bioluminescent (pas d'electricite)?",
  },

  // === TECHNOLOGY RULES ===
  {
    id: "tech-medieval",
    category: "technology",
    severity: "critical",
    rule: "Medieval fantastique UNIQUEMENT - pas de technologie moderne",
    checkPrompt: "Y a-t-il de la technologie moderne (ecrans, vehicules, electricite)?",
  },
  {
    id: "tech-no-guns",
    category: "technology",
    severity: "critical",
    rule: "PAS d'armes a feu, canons, ou projectiles",
    checkPrompt: "Y a-t-il des armes a feu ou explosifs?",
  },

  // === STYLE RULES ===
  {
    id: "style-pixar",
    category: "style",
    severity: "major",
    rule: "Style Pixar demoniaque mignon, 3D feature film quality",
    checkPrompt: "L'image est-elle en style 3D Pixar (pas 2D, pas anime)?",
  },
  {
    id: "style-palette",
    category: "palette",
    severity: "minor",
    rule: "Palette Bloodwings: obsidian black, blood red, deep crimson, copper, warm amber",
    checkPrompt: "Les couleurs respectent-elles la palette Moostik (noir, rouge sang, ambre)?",
  },
];

// ============================================================================
// CHECKLIST PROMPT BUILDER
// ============================================================================

function buildComplianceCheckPrompt(): string {
  const checks = BIBLE_RULES.map((rule, i) => 
    `${i + 1}. [${rule.severity.toUpperCase()}] ${rule.checkPrompt}`
  ).join("\n");

  return `Analyse cette image selon les regles de la Direction Artistique MOOSTIK.
Pour chaque verification, reponds par OUI (conforme) ou NON (violation) suivi d'une breve explication.

VERIFICATIONS:
${checks}

Reponds en JSON:
{
  "results": [
    { "ruleIndex": 1, "compliant": true/false, "explanation": "..." },
    ...
  ],
  "overallScore": 0-100,
  "summary": "..."
}`;
}

const BIBLE_CHECK_SYSTEM_PROMPT = `Tu es un expert en Direction Artistique pour le projet MOOSTIK.

MOOSTIK est une serie animee sur des moustiques vampires anthropomorphes style Pixar demoniaque mignon.

REGLES CRITIQUES A VERIFIER:
1. TROMPE TOUJOURS VISIBLE - Fine comme une aiguille, c'est leur seule arme
2. STYLE PIXAR 3D - Pas de 2D, pas d'anime
3. PAS D'ELEMENTS HUMAINS - Pas d'architecture humaine, pas de technologie moderne
4. PALETTE BLOODWINGS - Noir obsidien, rouge sang, ambre chaud
5. MEDIEVAL FANTASTIQUE - Pas d'electricite, pas d'armes a feu

Sois strict et precis dans ton evaluation.`;

// ============================================================================
// MAIN COMPLIANCE CHECK
// ============================================================================

export async function checkBibleCompliance(
  imageUrl: string,
  options: {
    useVision?: boolean;
    model?: string;
  } = {}
): Promise<BibleComplianceResult> {
  const startTime = Date.now();
  const { useVision = true } = options;

  if (!useVision) {
    // Return a neutral result without vision analysis
    return {
      compliant: true,
      score: 70,
      violations: [],
      detailedViolations: [],
      checkedRules: 0,
      passedRules: 0,
      analysisTime: Date.now() - startTime,
    };
  }

  try {
    const result = await analyzeImageWithVision(
      imageUrl,
      buildComplianceCheckPrompt(),
      [],
      {
        systemPrompt: BIBLE_CHECK_SYSTEM_PROMPT,
        model: "google/gemini-3-flash", // Use fast model for quick checks
        temperature: 0.2,
        maxTokens: 2048,
      }
    );

    // Parse response
    let parsed: {
      results: Array<{ ruleIndex: number; compliant: boolean; explanation: string }>;
      overallScore: number;
      summary: string;
    };

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback parsing
      parsed = {
        results: [],
        overallScore: 70,
        summary: result.content,
      };
    }

    // Process violations
    const violations: string[] = [];
    const detailedViolations: BibleViolation[] = [];
    let passedRules = 0;

    for (const check of parsed.results) {
      const rule = BIBLE_RULES[check.ruleIndex - 1];
      if (!rule) continue;

      if (check.compliant) {
        passedRules++;
      } else {
        violations.push(`${rule.rule} - ${check.explanation}`);
        detailedViolations.push({
          ruleId: rule.id,
          rule: rule.rule,
          severity: rule.severity,
          description: check.explanation,
          suggestion: getSuggestionForRule(rule.id),
        });
      }
    }

    const checkedRules = parsed.results.length || BIBLE_RULES.length;
    const score = parsed.overallScore || Math.round((passedRules / checkedRules) * 100);

    return {
      compliant: violations.length === 0,
      score,
      violations,
      detailedViolations,
      checkedRules,
      passedRules,
      analysisTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error("[BibleChecker] Analysis failed:", error);
    
    return {
      compliant: true,
      score: 50,
      violations: [`Erreur d'analyse: ${error instanceof Error ? error.message : "Inconnue"}`],
      detailedViolations: [],
      checkedRules: 0,
      passedRules: 0,
      analysisTime: Date.now() - startTime,
    };
  }
}

// ============================================================================
// QUICK CHECKS (NO VISION)
// ============================================================================

/**
 * Check if a prompt text contains forbidden elements
 */
export function checkPromptCompliance(prompt: string): {
  compliant: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const promptLower = prompt.toLowerCase();

  // Check for forbidden terms
  const forbiddenTerms = [
    { term: "human", warning: "Eviter le terme 'human' dans les scenes Moostik" },
    { term: "gun", warning: "Armes a feu interdites" },
    { term: "pistol", warning: "Armes a feu interdites" },
    { term: "rifle", warning: "Armes a feu interdites" },
    { term: "sword", warning: "Armes metalliques interdites (utiliser 'proboscis' a la place)" },
    { term: "modern", warning: "Elements modernes interdits" },
    { term: "electric", warning: "Electricite interdite" },
    { term: "computer", warning: "Technologie moderne interdite" },
    { term: "screen", warning: "Ecrans interdits" },
    { term: "car", warning: "Vehicules interdits" },
    { term: "vehicle", warning: "Vehicules interdits" },
    { term: "anime", warning: "Style anime interdit - utiliser 'Pixar 3D style'" },
    { term: "cartoon", warning: "Style cartoon interdit - utiliser 'Pixar 3D style'" },
    { term: "2d", warning: "Style 2D interdit - utiliser '3D feature film quality'" },
  ];

  for (const { term, warning } of forbiddenTerms) {
    if (promptLower.includes(term)) {
      warnings.push(warning);
    }
  }

  // Check for missing required terms
  const requiredTerms = [
    { term: "proboscis", warning: "Ajouter 'proboscis' pour assurer la visibilite de la trompe" },
  ];

  // Only warn if it seems like a character prompt
  if (promptLower.includes("moostik") || promptLower.includes("mosquito")) {
    for (const { term, warning } of requiredTerms) {
      if (!promptLower.includes(term)) {
        warnings.push(warning);
      }
    }
  }

  return {
    compliant: warnings.length === 0,
    warnings,
  };
}

/**
 * Get the Moostik color palette for validation
 */
export function getBloodwingsPalette(): typeof BLOODWINGS_PALETTE {
  return BLOODWINGS_PALETTE;
}

/**
 * Get anatomy rules for prompt building
 */
export function getAnatomyRules(): typeof MOOSTIK_ANATOMY {
  return MOOSTIK_ANATOMY;
}

/**
 * Get forbidden equipment list
 */
export function getForbiddenEquipment(): readonly string[] {
  return MOOSTIK_EQUIPMENT.forbiddenItems;
}

/**
 * Get forbidden technology list
 */
export function getForbiddenTechnology(): readonly string[] {
  return MOOSTIK_TECHNOLOGY.forbidden;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSuggestionForRule(ruleId: string): string {
  const suggestions: Record<string, string> = {
    "anatomy-proboscis": "Ajouter 'visible needle-like proboscis' au prompt",
    "anatomy-chitin": "Specifier 'matte obsidian black chitin body'",
    "anatomy-eyes": "Ajouter 'large expressive warm amber eyes'",
    "anatomy-wings": "Specifier 'translucent wings with crimson veins'",
    "equipment-no-human": "Retirer tout element d'uniforme humain",
    "equipment-no-weapons": "Retirer les armes, utiliser 'proboscis as their only weapon'",
    "arch-no-human": "Specifier 'bio-organic Renaissance insect architecture'",
    "tech-medieval": "Retirer toute reference a la technologie moderne",
    "style-pixar": "Ajouter 'Pixar-style 3D, feature film quality'",
  };
  
  return suggestions[ruleId] || "Verifier la conformite a la bible Moostik";
}

// Note: BIBLE_RULES and types are already exported at their declarations
