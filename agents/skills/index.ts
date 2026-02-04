/**
 * MOOSTIK Skills System
 *
 * Implements the Claude Agent Skills open standard for portable,
 * reusable AI capabilities.
 *
 * Skills are folders with SKILL.md files containing YAML frontmatter
 * and markdown instructions that teach Claude how to complete specific tasks.
 *
 * @see https://github.com/anthropics/skills
 * @see https://agentskills.io
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

export interface SkillMetadata {
  name: string;
  description: string;
  tags?: string[];
  version?: string;
  author?: string;
  disableModelInvocation?: boolean;
  userInvocable?: boolean;
}

export interface Skill {
  id: string;
  metadata: SkillMetadata;
  content: string;
  path: string;
  resources?: string[];
}

export interface SkillMatch {
  skill: Skill;
  relevance: number;
  matchedTags: string[];
}

// ============================================================================
// YAML Frontmatter Parser
// ============================================================================

function parseFrontmatter(content: string): { metadata: Record<string, unknown>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, body: content };
  }

  const [, yaml, body] = match;
  const metadata: Record<string, unknown> = {};

  // Simple YAML parser for our use case
  const lines = yaml.split("\n");
  let currentKey = "";
  let inMultiline = false;
  let multilineValue = "";
  let inArray = false;
  let arrayKey = "";
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Handle array items
    if (trimmed.startsWith("- ") && inArray) {
      arrayValues.push(trimmed.slice(2).trim());
      continue;
    }

    // End array if we hit a new key
    if (inArray && !trimmed.startsWith("- ") && trimmed.includes(":")) {
      metadata[arrayKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }

    // Handle multiline strings (|)
    if (inMultiline) {
      if (line.startsWith("  ") || line.startsWith("\t")) {
        multilineValue += line.trim() + "\n";
        continue;
      } else {
        metadata[currentKey] = multilineValue.trim();
        inMultiline = false;
        multilineValue = "";
      }
    }

    // Parse key-value pairs
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      // Check for multiline indicator
      if (value === "|") {
        currentKey = key;
        inMultiline = true;
        continue;
      }

      // Check for array start
      if (value === "") {
        arrayKey = key;
        inArray = true;
        continue;
      }

      // Regular value
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, "");
      metadata[key] = cleanValue;
    }
  }

  // Handle any remaining array
  if (inArray && arrayValues.length > 0) {
    metadata[arrayKey] = arrayValues;
  }

  // Handle any remaining multiline
  if (inMultiline && multilineValue) {
    metadata[currentKey] = multilineValue.trim();
  }

  return { metadata, body: body.trim() };
}

// ============================================================================
// Skill Loader
// ============================================================================

export class SkillLoader {
  private skillsDir: string;
  private cache: Map<string, Skill> = new Map();

  constructor(skillsDir?: string) {
    this.skillsDir = skillsDir || path.join(__dirname);
  }

  /**
   * Load a single skill from a directory
   */
  loadSkill(skillDir: string): Skill | null {
    const skillPath = path.join(skillDir, "SKILL.md");

    if (!fs.existsSync(skillPath)) {
      console.warn(`[Skills] No SKILL.md found in ${skillDir}`);
      return null;
    }

    try {
      const content = fs.readFileSync(skillPath, "utf-8");
      const { metadata, body } = parseFrontmatter(content);

      const skill: Skill = {
        id: path.basename(skillDir),
        metadata: {
          name: (metadata.name as string) || path.basename(skillDir),
          description: (metadata.description as string) || "",
          tags: (metadata.tags as string[]) || [],
          version: metadata.version as string,
          author: metadata.author as string,
          disableModelInvocation: metadata["disable-model-invocation"] === "true",
          userInvocable: metadata["user-invocable"] !== "false",
        },
        content: body,
        path: skillDir,
        resources: this.findResources(skillDir),
      };

      this.cache.set(skill.id, skill);
      return skill;
    } catch (error) {
      console.error(`[Skills] Failed to load skill from ${skillDir}:`, error);
      return null;
    }
  }

  /**
   * Load all skills from the skills directory
   */
  loadAllSkills(): Skill[] {
    const skills: Skill[] = [];

    if (!fs.existsSync(this.skillsDir)) {
      console.warn(`[Skills] Skills directory not found: ${this.skillsDir}`);
      return skills;
    }

    const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        const skillDir = path.join(this.skillsDir, entry.name);
        const skill = this.loadSkill(skillDir);
        if (skill) {
          skills.push(skill);
        }
      }
    }

    console.log(`[Skills] Loaded ${skills.length} skills`);
    return skills;
  }

  /**
   * Get a skill by ID
   */
  getSkill(id: string): Skill | undefined {
    if (!this.cache.has(id)) {
      const skillDir = path.join(this.skillsDir, id);
      if (fs.existsSync(skillDir)) {
        this.loadSkill(skillDir);
      }
    }
    return this.cache.get(id);
  }

  /**
   * Find resources in a skill directory
   */
  private findResources(skillDir: string): string[] {
    const resources: string[] = [];
    const resourceDirs = ["scripts", "templates", "resources"];

    for (const dir of resourceDirs) {
      const fullPath = path.join(skillDir, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        resources.push(...files.map((f) => path.join(dir, f)));
      }
    }

    return resources;
  }
}

// ============================================================================
// Skill Registry
// ============================================================================

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private loader: SkillLoader;

  constructor(skillsDir?: string) {
    this.loader = new SkillLoader(skillsDir);
  }

  /**
   * Initialize the registry by loading all skills
   */
  initialize(): void {
    const skills = this.loader.loadAllSkills();

    for (const skill of skills) {
      this.register(skill);
    }
  }

  /**
   * Register a skill
   */
  register(skill: Skill): void {
    this.skills.set(skill.id, skill);

    // Index by tags
    for (const tag of skill.metadata.tags || []) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(skill.id);
    }

    console.log(`[Skills] Registered: ${skill.metadata.name} (${skill.id})`);
  }

  /**
   * Get a skill by ID
   */
  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * Get all skills
   */
  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Find skills by tags
   */
  findByTags(tags: string[]): Skill[] {
    const matchingIds = new Set<string>();

    for (const tag of tags) {
      const skillIds = this.tagIndex.get(tag);
      if (skillIds) {
        skillIds.forEach((id) => matchingIds.add(id));
      }
    }

    return Array.from(matchingIds)
      .map((id) => this.skills.get(id)!)
      .filter(Boolean);
  }

  /**
   * Find the most relevant skill for a query
   */
  findBestMatch(query: string, tags?: string[]): SkillMatch | null {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    let bestMatch: SkillMatch | null = null;

    for (const skill of this.skills.values()) {
      const matchedTags: string[] = [];
      let relevance = 0;

      // Check description match
      const descLower = skill.metadata.description.toLowerCase();
      for (const word of queryWords) {
        if (descLower.includes(word)) {
          relevance += 0.2;
        }
      }

      // Check name match
      if (skill.metadata.name.toLowerCase().includes(queryLower)) {
        relevance += 0.5;
      }

      // Check tag matches
      if (tags) {
        for (const tag of tags) {
          if (skill.metadata.tags?.includes(tag)) {
            relevance += 0.3;
            matchedTags.push(tag);
          }
        }
      }

      // Check if query words appear in tags
      for (const word of queryWords) {
        if (skill.metadata.tags?.some((t) => t.includes(word))) {
          relevance += 0.1;
        }
      }

      if (relevance > 0 && (!bestMatch || relevance > bestMatch.relevance)) {
        bestMatch = { skill, relevance, matchedTags };
      }
    }

    return bestMatch;
  }

  /**
   * Get skills suitable for model invocation
   */
  getModelInvocableSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(
      (s) => !s.metadata.disableModelInvocation
    );
  }

  /**
   * Get skills suitable for user invocation
   */
  getUserInvocableSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(
      (s) => s.metadata.userInvocable !== false
    );
  }
}

// ============================================================================
// Skill Context Builder
// ============================================================================

/**
 * Build context from skills for LLM prompts
 */
export function buildSkillContext(skills: Skill[]): string {
  if (skills.length === 0) {
    return "";
  }

  const parts = ["# Active Skills\n"];

  for (const skill of skills) {
    parts.push(`## ${skill.metadata.name}\n`);
    parts.push(skill.content);
    parts.push("\n---\n");
  }

  return parts.join("\n");
}

/**
 * Build a compact skill summary for context
 */
export function buildSkillSummary(skills: Skill[]): string {
  if (skills.length === 0) {
    return "No skills loaded.";
  }

  const lines = ["Available Skills:"];

  for (const skill of skills) {
    const tags = skill.metadata.tags?.join(", ") || "none";
    lines.push(`- **${skill.metadata.name}** [${tags}]: ${skill.metadata.description.slice(0, 100)}...`);
  }

  return lines.join("\n");
}

// ============================================================================
// Singleton and Exports
// ============================================================================

let skillRegistry: SkillRegistry | null = null;

export function getSkillRegistry(skillsDir?: string): SkillRegistry {
  if (!skillRegistry) {
    skillRegistry = new SkillRegistry(skillsDir);
    skillRegistry.initialize();
  }
  return skillRegistry;
}

// Pre-defined skill IDs for MOOSTIK
export const MOOSTIK_SKILLS = {
  NARRATIVE_GENERATION: "narrative-generation",
  CHARACTER_DIALOGUE: "character-dialogue",
  SCENE_COMPOSITION: "scene-composition",
  BLOODWINGS_STYLE: "bloodwings-style",
} as const;

export default getSkillRegistry;
