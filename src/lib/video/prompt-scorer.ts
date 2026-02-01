/**
 * MOOSTIK Prompt Quality Scorer
 * Evaluates prompt quality for video generation - January 2026
 *
 * Scores prompts on multiple dimensions to predict generation quality
 */

import { VideoProvider } from "./types";
import { PROVIDER_PROMPT_CONFIGS, getMaxPromptLength } from "./provider-configs";

// ============================================
// TYPES
// ============================================

export interface PromptScore {
  /** Overall score 0-100 */
  overall: number;
  /** Length appropriateness for provider */
  lengthScore: number;
  /** Keyword relevance score */
  keywordScore: number;
  /** Style coherence score */
  styleScore: number;
  /** Clarity and specificity score */
  clarityScore: number;
  /** Motion/action description score */
  motionScore: number;
  /** Detected warnings */
  warnings: string[];
  /** Suggestions for improvement */
  suggestions: string[];
  /** Breakdown by category */
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  length: { score: number; detail: string };
  keywords: { score: number; detail: string };
  style: { score: number; detail: string };
  clarity: { score: number; detail: string };
  motion: { score: number; detail: string };
  avoidedTerms: { score: number; detail: string };
}

// ============================================
// SCORING WEIGHTS
// ============================================

const SCORE_WEIGHTS = {
  length: 0.15,
  keywords: 0.20,
  style: 0.20,
  clarity: 0.25,
  motion: 0.15,
  avoidedTerms: 0.05,
};

// ============================================
// QUALITY INDICATORS
// ============================================

/** Keywords that indicate good prompts */
const QUALITY_KEYWORDS = [
  // Visual quality
  "cinematic",
  "detailed",
  "high quality",
  "realistic",
  "photorealistic",
  "4K",
  "sharp",
  "crisp",
  // Motion quality
  "smooth motion",
  "fluid",
  "natural movement",
  "dynamic",
  "flowing",
  // Lighting
  "dramatic lighting",
  "soft lighting",
  "ambient",
  "backlit",
  "rim light",
  "golden hour",
  // Camera
  "camera movement",
  "tracking shot",
  "dolly",
  "pan",
  "tilt",
  "zoom",
  "crane",
  "handheld",
  // Composition
  "composition",
  "framing",
  "depth of field",
  "bokeh",
  "foreground",
  "background",
];

/** Keywords that suggest weak prompts */
const WEAK_INDICATORS = [
  "good",
  "nice",
  "beautiful",
  "cool",
  "awesome",
  "amazing",
  // Vague terms
  "some",
  "thing",
  "stuff",
  "something",
  // Generic
  "video",
  "make a video",
  "generate",
];

/** Terms that suggest motion description */
const MOTION_KEYWORDS = [
  "moving",
  "walking",
  "running",
  "talking",
  "breathing",
  "blinking",
  "gesture",
  "action",
  "movement",
  "motion",
  "animate",
  "dynamic",
  "static",
  "subtle",
  "slow",
  "fast",
  "rapid",
  "gentle",
];

// ============================================
// MAIN SCORING FUNCTION
// ============================================

export function scorePrompt(prompt: string, provider: VideoProvider): PromptScore {
  const config = PROVIDER_PROMPT_CONFIGS[provider];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Calculate individual scores
  const lengthResult = scoreLengthScore(prompt, config.maxLength);
  const keywordResult = scoreKeywords(prompt, config);
  const styleResult = scoreStyle(prompt, config.preferredStyle);
  const clarityResult = scoreClarity(prompt);
  const motionResult = scoreMotion(prompt);
  const avoidedResult = scoreAvoidedTerms(prompt, config.avoidTerms);

  // Collect warnings
  if (lengthResult.score < 50) {
    warnings.push(lengthResult.detail);
  }
  if (keywordResult.score < 50) {
    suggestions.push("Consider adding quality keywords like 'cinematic', 'detailed', or specific lighting terms");
  }
  if (clarityResult.score < 50) {
    suggestions.push("Add more specific details about the scene, subjects, and desired output");
  }
  if (motionResult.score < 50) {
    suggestions.push("Describe the desired motion/animation more explicitly");
  }
  if (avoidedResult.score < 100) {
    warnings.push(avoidedResult.detail);
  }

  // Calculate overall score
  const overall = Math.round(
    lengthResult.score * SCORE_WEIGHTS.length +
    keywordResult.score * SCORE_WEIGHTS.keywords +
    styleResult.score * SCORE_WEIGHTS.style +
    clarityResult.score * SCORE_WEIGHTS.clarity +
    motionResult.score * SCORE_WEIGHTS.motion +
    avoidedResult.score * SCORE_WEIGHTS.avoidedTerms
  );

  return {
    overall,
    lengthScore: lengthResult.score,
    keywordScore: keywordResult.score,
    styleScore: styleResult.score,
    clarityScore: clarityResult.score,
    motionScore: motionResult.score,
    warnings,
    suggestions,
    breakdown: {
      length: lengthResult,
      keywords: keywordResult,
      style: styleResult,
      clarity: clarityResult,
      motion: motionResult,
      avoidedTerms: avoidedResult,
    },
  };
}

// ============================================
// INDIVIDUAL SCORING FUNCTIONS
// ============================================

/**
 * Score prompt length appropriateness
 */
function scoreLengthScore(prompt: string, maxLength: number): { score: number; detail: string } {
  const length = prompt.length;

  // Ideal range is 40-90% of max length
  const idealMin = maxLength * 0.3;
  const idealMax = maxLength * 0.9;

  if (length >= idealMin && length <= idealMax) {
    return { score: 100, detail: "Length is optimal for provider" };
  }

  if (length < idealMin) {
    const score = Math.round((length / idealMin) * 80);
    return { score, detail: `Prompt may be too short (${length}/${maxLength} chars)` };
  }

  if (length > maxLength) {
    const overage = ((length - maxLength) / maxLength) * 100;
    const score = Math.max(0, 60 - overage);
    return { score, detail: `Prompt exceeds limit (${length}/${maxLength} chars), will be truncated` };
  }

  // Between idealMax and maxLength - slightly over ideal
  const overIdeal = ((length - idealMax) / (maxLength - idealMax)) * 100;
  const score = Math.round(90 - overIdeal * 0.3);
  return { score, detail: "Prompt is long but within limits" };
}

/**
 * Score keyword quality and relevance
 */
function scoreKeywords(
  prompt: string,
  config: typeof PROVIDER_PROMPT_CONFIGS[VideoProvider]
): { score: number; detail: string } {
  const lowerPrompt = prompt.toLowerCase();
  let score = 50; // Base score
  let foundQuality = 0;
  let foundWeak = 0;
  let foundBoost = 0;

  // Check for quality keywords
  for (const keyword of QUALITY_KEYWORDS) {
    if (lowerPrompt.includes(keyword.toLowerCase())) {
      foundQuality++;
      score += 5;
    }
  }

  // Check for weak indicators (negative)
  for (const weak of WEAK_INDICATORS) {
    if (lowerPrompt.includes(weak.toLowerCase())) {
      foundWeak++;
      score -= 5;
    }
  }

  // Check for provider-specific boost terms
  for (const boost of config.boostTerms) {
    if (lowerPrompt.includes(boost.toLowerCase())) {
      foundBoost++;
      score += 8;
    }
  }

  score = Math.min(100, Math.max(0, score));

  let detail = `Found ${foundQuality} quality keywords`;
  if (foundBoost > 0) detail += `, ${foundBoost} provider-optimized terms`;
  if (foundWeak > 0) detail += `, ${foundWeak} weak/vague terms`;

  return { score, detail };
}

/**
 * Score style coherence
 */
function scoreStyle(
  prompt: string,
  preferredStyle: "concise" | "descriptive" | "cinematic"
): { score: number; detail: string } {
  const wordCount = prompt.split(/\s+/).length;
  const sentenceCount = (prompt.match(/[.!?]/g) || []).length + 1;
  const avgWordsPerSentence = wordCount / sentenceCount;

  let score = 70; // Base score

  switch (preferredStyle) {
    case "concise":
      // Prefer shorter sentences, fewer words
      if (avgWordsPerSentence <= 15) score += 20;
      else if (avgWordsPerSentence <= 20) score += 10;
      else score -= 10;

      if (wordCount <= 50) score += 10;
      else if (wordCount > 100) score -= 10;
      break;

    case "descriptive":
      // Prefer more detail
      if (wordCount >= 40) score += 15;
      if (wordCount >= 60) score += 10;
      if (prompt.includes(",")) score += 5; // Lists of details

      // Check for descriptive adjectives
      const adjectives = /(?:detailed|realistic|dramatic|subtle|soft|harsh|warm|cold|bright|dark)/gi;
      const adjectiveCount = (prompt.match(adjectives) || []).length;
      score += Math.min(15, adjectiveCount * 5);
      break;

    case "cinematic":
      // Prefer cinematic language
      const cinematicTerms = /(?:cinematic|film|shot|camera|frame|scene|lens|dolly|tracking|crane)/gi;
      const cinematicCount = (prompt.match(cinematicTerms) || []).length;
      score += Math.min(20, cinematicCount * 7);

      // Check for narrative structure
      if (prompt.includes(".") && sentenceCount >= 2) score += 10;
      break;
  }

  score = Math.min(100, Math.max(0, score));
  return { score, detail: `Style: ${preferredStyle}, ${wordCount} words, ~${avgWordsPerSentence.toFixed(1)} per sentence` };
}

/**
 * Score clarity and specificity
 */
function scoreClarity(prompt: string): { score: number; detail: string } {
  let score = 50;
  const issues: string[] = [];

  // Check for specific subjects
  const hasSubject = /(?:person|character|figure|man|woman|child|creature|object|building|scene)/i.test(prompt);
  if (hasSubject) {
    score += 15;
  } else {
    issues.push("no clear subject");
  }

  // Check for specific actions
  const hasAction = /(?:walking|running|standing|sitting|looking|moving|talking|holding|reaching)/i.test(prompt);
  if (hasAction) {
    score += 15;
  } else {
    issues.push("no specific action");
  }

  // Check for location/setting
  const hasLocation = /(?:interior|exterior|room|street|forest|city|house|building|outdoor|indoor)/i.test(prompt);
  if (hasLocation) {
    score += 10;
  } else {
    issues.push("no clear location");
  }

  // Check for time/lighting
  const hasTime = /(?:day|night|dawn|dusk|morning|evening|golden hour|noon|midnight)/i.test(prompt);
  if (hasTime) score += 10;

  // Penalize very short prompts
  if (prompt.length < 50) {
    score -= 20;
    issues.push("very short");
  }

  // Bonus for numbers/specifics
  if (/\d/.test(prompt)) score += 5; // Contains numbers

  score = Math.min(100, Math.max(0, score));
  const detail = issues.length > 0 ? `Missing: ${issues.join(", ")}` : "Good specificity";
  return { score, detail };
}

/**
 * Score motion/animation description
 */
function scoreMotion(prompt: string): { score: number; detail: string } {
  const lowerPrompt = prompt.toLowerCase();
  let score = 40; // Base score
  let motionCount = 0;

  for (const keyword of MOTION_KEYWORDS) {
    if (lowerPrompt.includes(keyword)) {
      motionCount++;
      score += 10;
    }
  }

  // Check for camera motion
  const cameraMotion = /(?:pan|tilt|zoom|dolly|track|crane|handheld|static|locked)/i.test(prompt);
  if (cameraMotion) {
    score += 15;
  }

  // Check for speed/intensity descriptors
  const hasSpeed = /(?:slow|fast|gentle|rapid|gradual|sudden|smooth)/i.test(prompt);
  if (hasSpeed) score += 10;

  score = Math.min(100, Math.max(0, score));
  return {
    score,
    detail: `Found ${motionCount} motion descriptors${cameraMotion ? ", includes camera motion" : ""}`,
  };
}

/**
 * Score avoided terms (terms that hurt quality for provider)
 */
function scoreAvoidedTerms(prompt: string, avoidTerms: string[]): { score: number; detail: string } {
  const lowerPrompt = prompt.toLowerCase();
  const found: string[] = [];

  for (const term of avoidTerms) {
    if (lowerPrompt.includes(term.toLowerCase())) {
      found.push(term);
    }
  }

  if (found.length === 0) {
    return { score: 100, detail: "No problematic terms detected" };
  }

  const score = Math.max(0, 100 - found.length * 25);
  return {
    score,
    detail: `Contains terms to avoid: ${found.join(", ")}`,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a quick quality estimate without full analysis
 */
export function quickScore(prompt: string, provider: VideoProvider): number {
  const maxLength = getMaxPromptLength(provider);
  let score = 50;

  // Length check
  if (prompt.length >= maxLength * 0.3 && prompt.length <= maxLength) {
    score += 20;
  }

  // Has motion description
  if (MOTION_KEYWORDS.some((k) => prompt.toLowerCase().includes(k))) {
    score += 15;
  }

  // Has quality keywords
  if (QUALITY_KEYWORDS.some((k) => prompt.toLowerCase().includes(k))) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * Get score grade (A-F)
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Get score description
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) return "Excellent - Optimal for generation";
  if (score >= 80) return "Good - Should produce quality results";
  if (score >= 70) return "Fair - May need minor improvements";
  if (score >= 60) return "Needs work - Consider adding more detail";
  return "Poor - Significant improvements needed";
}
