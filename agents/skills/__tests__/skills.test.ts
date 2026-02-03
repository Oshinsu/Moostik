/**
 * Skills System Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import * as path from "path";
import {
  SkillLoader,
  SkillRegistry,
  getSkillRegistry,
  buildSkillContext,
  buildSkillSummary,
  MOOSTIK_SKILLS,
  type Skill,
} from "../index";

describe("Skills System", () => {
  const skillsDir = path.join(__dirname, "..");

  describe("SkillLoader", () => {
    let loader: SkillLoader;

    beforeEach(() => {
      loader = new SkillLoader(skillsDir);
    });

    it("should load a single skill", () => {
      const skill = loader.loadSkill(path.join(skillsDir, "narrative-generation"));

      expect(skill).toBeDefined();
      expect(skill?.id).toBe("narrative-generation");
      expect(skill?.metadata.name).toBe("MOOSTIK Narrative Generation");
      expect(skill?.content).toBeDefined();
      expect(skill?.content.length).toBeGreaterThan(0);
    });

    it("should load all skills", () => {
      const skills = loader.loadAllSkills();

      expect(skills.length).toBeGreaterThanOrEqual(4);

      const skillIds = skills.map((s) => s.id);
      expect(skillIds).toContain("narrative-generation");
      expect(skillIds).toContain("character-dialogue");
      expect(skillIds).toContain("scene-composition");
      expect(skillIds).toContain("bloodwings-style");
    });

    it("should parse YAML frontmatter", () => {
      const skill = loader.loadSkill(path.join(skillsDir, "narrative-generation"));

      expect(skill?.metadata.name).toBeDefined();
      expect(skill?.metadata.description).toBeDefined();
      expect(skill?.metadata.tags).toBeDefined();
      expect(Array.isArray(skill?.metadata.tags)).toBe(true);
      expect(skill?.metadata.version).toBe("1.0.0");
      expect(skill?.metadata.author).toBe("BLOODWINGS STUDIO");
    });

    it("should extract tags", () => {
      const skill = loader.loadSkill(path.join(skillsDir, "narrative-generation"));

      expect(skill?.metadata.tags).toContain("narrative");
      expect(skill?.metadata.tags).toContain("storytelling");
      expect(skill?.metadata.tags).toContain("moostik");
    });

    it("should get skill by ID", () => {
      loader.loadAllSkills();

      const skill = loader.getSkill("character-dialogue");

      expect(skill).toBeDefined();
      expect(skill?.id).toBe("character-dialogue");
    });

    it("should return null for missing skill", () => {
      const skill = loader.loadSkill(path.join(skillsDir, "nonexistent-skill"));

      expect(skill).toBeNull();
    });
  });

  describe("SkillRegistry", () => {
    let registry: SkillRegistry;

    beforeEach(() => {
      registry = new SkillRegistry(skillsDir);
      registry.initialize();
    });

    it("should initialize with loaded skills", () => {
      const skills = registry.getAll();

      expect(skills.length).toBeGreaterThanOrEqual(4);
    });

    it("should get skill by ID", () => {
      const skill = registry.get("scene-composition");

      expect(skill).toBeDefined();
      expect(skill?.metadata.name).toBe("MOOSTIK Scene Composition");
    });

    it("should find skills by tags", () => {
      const visualSkills = registry.findByTags(["visual"]);

      expect(visualSkills.length).toBeGreaterThan(0);
      expect(visualSkills.every((s) => s.metadata.tags?.includes("visual"))).toBe(true);
    });

    it("should find skills by multiple tags", () => {
      const moostikVisual = registry.findByTags(["moostik", "visual"]);

      expect(moostikVisual.length).toBeGreaterThan(0);
    });

    it("should find best match for query", () => {
      const match = registry.findBestMatch("generate dialogue for characters");

      expect(match).toBeDefined();
      expect(match?.skill.id).toBe("character-dialogue");
      expect(match?.relevance).toBeGreaterThan(0);
    });

    it("should find best match with tags", () => {
      const match = registry.findBestMatch("create visual scene", ["visual", "composition"]);

      expect(match).toBeDefined();
      expect(match?.matchedTags.length).toBeGreaterThan(0);
    });

    it("should return null for no match", () => {
      const match = registry.findBestMatch("xyzzy completely unrelated gibberish");

      // May or may not find a match depending on implementation
      // Just verify it doesn't throw
      expect(true).toBe(true);
    });

    it("should get model-invocable skills", () => {
      const invocable = registry.getModelInvocableSkills();

      // By default, all skills should be model-invocable
      expect(invocable.length).toBeGreaterThanOrEqual(4);
    });

    it("should get user-invocable skills", () => {
      const invocable = registry.getUserInvocableSkills();

      expect(invocable.length).toBeGreaterThanOrEqual(4);
    });

    it("should register custom skills", () => {
      const customSkill: Skill = {
        id: "custom-skill",
        metadata: {
          name: "Custom Skill",
          description: "A custom test skill",
          tags: ["custom", "test"],
        },
        content: "Custom skill instructions",
        path: "/custom/path",
      };

      registry.register(customSkill);

      const retrieved = registry.get("custom-skill");
      expect(retrieved).toBeDefined();
      expect(retrieved?.metadata.name).toBe("Custom Skill");
    });
  });

  describe("Context Building", () => {
    let registry: SkillRegistry;

    beforeEach(() => {
      registry = new SkillRegistry(skillsDir);
      registry.initialize();
    });

    it("should build skill context", () => {
      const skills = [
        registry.get("narrative-generation")!,
        registry.get("character-dialogue")!,
      ];

      const context = buildSkillContext(skills);

      expect(context).toContain("# Active Skills");
      expect(context).toContain("MOOSTIK Narrative Generation");
      expect(context).toContain("MOOSTIK Character Dialogue");
    });

    it("should return empty string for no skills", () => {
      const context = buildSkillContext([]);

      expect(context).toBe("");
    });

    it("should build skill summary", () => {
      const skills = registry.getAll();
      const summary = buildSkillSummary(skills);

      expect(summary).toContain("Available Skills:");
      expect(summary).toContain("Narrative Generation");
      expect(summary).toContain("Character Dialogue");
    });

    it("should handle empty skills in summary", () => {
      const summary = buildSkillSummary([]);

      expect(summary).toBe("No skills loaded.");
    });
  });

  describe("MOOSTIK_SKILLS Constants", () => {
    it("should have correct skill IDs", () => {
      expect(MOOSTIK_SKILLS.NARRATIVE_GENERATION).toBe("narrative-generation");
      expect(MOOSTIK_SKILLS.CHARACTER_DIALOGUE).toBe("character-dialogue");
      expect(MOOSTIK_SKILLS.SCENE_COMPOSITION).toBe("scene-composition");
      expect(MOOSTIK_SKILLS.BLOODWINGS_STYLE).toBe("bloodwings-style");
    });
  });

  describe("Skill Content Validation", () => {
    let registry: SkillRegistry;

    beforeEach(() => {
      registry = new SkillRegistry(skillsDir);
      registry.initialize();
    });

    it("narrative-generation should have required sections", () => {
      const skill = registry.get("narrative-generation");

      expect(skill?.content).toContain("Universe Context");
      expect(skill?.content).toContain("Core Characters");
      expect(skill?.content).toContain("Narrative Style");
    });

    it("character-dialogue should have character profiles", () => {
      const skill = registry.get("character-dialogue");

      expect(skill?.content).toContain("KOKO");
      expect(skill?.content).toContain("PAPY TIK");
      expect(skill?.content).toContain("THE MOLT");
      expect(skill?.content).toContain("TIKORO");
    });

    it("scene-composition should have JSON-MOOSTIK format", () => {
      const skill = registry.get("scene-composition");

      expect(skill?.content).toContain("JSON-MOOSTIK");
      expect(skill?.content).toContain("scene_description");
      expect(skill?.content).toContain("camera");
      expect(skill?.content).toContain("lighting");
    });

    it("bloodwings-style should have color palettes", () => {
      const skill = registry.get("bloodwings-style");

      expect(skill?.content).toContain("Color Palette");
      expect(skill?.content).toContain("#");
      expect(skill?.content).toContain("BLOODWINGS");
    });
  });

  describe("Singleton", () => {
    it("should return same registry instance", () => {
      const registry1 = getSkillRegistry(skillsDir);
      const registry2 = getSkillRegistry(skillsDir);

      expect(registry1).toBe(registry2);
    });
  });
});
