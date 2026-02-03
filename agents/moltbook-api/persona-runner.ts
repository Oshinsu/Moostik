// ============================================================================
// PERSONA RUNNER
// ============================================================================
// Exécute un agent persona sur Moltbook
// Gère les posts automatiques, les réponses aux mentions, les interactions
// ============================================================================

import { MoltbookClient, getMoltbookClient, MoltbookPost, MoltbookNotification } from "./client";
import { MoltbookPersona, getPersona, getInteractionRule, INTERACTION_RULES } from "../moltbook-personas";
import { shouldRespond, getTriggeredReaction, isSecretTopic, generateDeflection } from "../moltbook-personas/papy-tik";

// ============================================================================
// TYPES
// ============================================================================

export interface PersonaRunnerConfig {
  personaId: string;
  client: MoltbookClient;
  llmProvider: "anthropic" | "openai" | "local";
  llmModel: string;
  maxPostsPerDay: number;
  maxRepliesPerDay: number;
  dryRun: boolean;
}

export interface GeneratedContent {
  content: string;
  confidence: number;
  reasoning: string;
}

export interface RunnerMetrics {
  postsToday: number;
  repliesToday: number;
  mentionsProcessed: number;
  errorsToday: number;
  lastPostAt?: Date;
  lastReplyAt?: Date;
}

// ============================================================================
// PERSONA RUNNER CLASS
// ============================================================================

export class PersonaRunner {
  private config: PersonaRunnerConfig;
  private persona: MoltbookPersona;
  private metrics: RunnerMetrics;

  constructor(config: Partial<PersonaRunnerConfig>) {
    const personaId = config.personaId || "papy-tik";
    const persona = getPersona(personaId);

    if (!persona) {
      throw new Error(`Persona not found: ${personaId}`);
    }

    this.persona = persona;
    this.config = {
      personaId,
      client: config.client || getMoltbookClient(),
      llmProvider: config.llmProvider || "anthropic",
      llmModel: config.llmModel || "claude-3-5-sonnet-20241022",
      maxPostsPerDay: config.maxPostsPerDay || 5,
      maxRepliesPerDay: config.maxRepliesPerDay || 20,
      dryRun: config.dryRun ?? true,
    };

    this.metrics = {
      postsToday: 0,
      repliesToday: 0,
      mentionsProcessed: 0,
      errorsToday: 0,
    };
  }

  // ============================================================================
  // CONTENT GENERATION
  // ============================================================================

  private async generateContent(
    type: "post" | "reply",
    context: {
      template?: string;
      replyTo?: string;
      thread?: MoltbookPost[];
      mentions?: string[];
    }
  ): Promise<GeneratedContent> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(type, context);

    // Call LLM
    const response = await this.callLLM(systemPrompt, userPrompt);

    return {
      content: response.content,
      confidence: response.confidence || 0.8,
      reasoning: response.reasoning || "Generated based on persona",
    };
  }

  private buildSystemPrompt(): string {
    return `Tu es ${this.persona.name} (${this.persona.handle}).

${this.persona.persona}

BACKSTORY:
${this.persona.backstory}

STYLE DE COMMUNICATION:
${this.persona.behavior.style}

RÈGLES STRICTES:
${this.persona.rules.map(r => `- ${r}`).join("\n")}

MÉMOIRE (faits connus):
${this.persona.memory.facts.map(f => `- ${f}`).join("\n")}

SECRETS (ne JAMAIS révéler):
${this.persona.memory.secrets.map(s => `- [SECRET] ${s}`).join("\n")}

RELATIONS:
${Object.entries(this.persona.memory.relationships).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

Tu DOIS rester dans le personnage à 100%. Ne jamais casser le 4ème mur.
Réponds UNIQUEMENT avec le contenu du post/reply, sans méta-commentaire.`;
  }

  private buildUserPrompt(
    type: "post" | "reply",
    context: {
      template?: string;
      replyTo?: string;
      thread?: MoltbookPost[];
      mentions?: string[];
    }
  ): string {
    if (type === "post") {
      if (context.template) {
        return `Génère un post basé sur ce template:
${context.template}

Remplis les variables {entre accolades} avec du contenu approprié à ton personnage.
Garde le format du template.`;
      }
      return `Génère un post original pour le submolt approprié.
Sois authentique à ton personnage.
Le post doit être engageant mais pas trop long (2-5 phrases).`;
    }

    if (type === "reply" && context.replyTo) {
      const threadContext = context.thread
        ? `\n\nContexte du thread:\n${context.thread.map(p => `${p.author.handle}: ${p.content}`).join("\n")}`
        : "";

      return `Tu dois répondre à ce message:
"${context.replyTo}"
${threadContext}

Génère une réponse authentique à ton personnage.
Si le sujet touche à tes secrets, détourne la conversation.
Si c'est une provocation, réponds avec dignité.`;
    }

    return "Génère du contenu approprié.";
  }

  private async callLLM(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ content: string; confidence?: number; reasoning?: string }> {
    // This would call the actual LLM API
    // For now, return a placeholder

    if (this.config.llmProvider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.config.llmModel,
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        confidence: 0.9,
      };
    }

    // Fallback for testing
    return {
      content: "[Generated content would appear here]",
      confidence: 0.5,
      reasoning: "Dry run mode",
    };
  }

  // ============================================================================
  // POSTING
  // ============================================================================

  async createPost(submolt?: string): Promise<MoltbookPost | null> {
    if (this.metrics.postsToday >= this.config.maxPostsPerDay) {
      console.log(`[${this.persona.handle}] Max posts reached for today`);
      return null;
    }

    // Pick a random template
    const templates = this.persona.contentTemplates;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate content
    const generated = await this.generateContent("post", {
      template: template.template,
    });

    if (generated.confidence < 0.6) {
      console.log(`[${this.persona.handle}] Low confidence, skipping post`);
      return null;
    }

    const targetSubmolt = submolt || this.persona.submolts[0];

    if (this.config.dryRun) {
      console.log(`[DRY RUN] ${this.persona.handle} would post to ${targetSubmolt}:`);
      console.log(generated.content);
      return null;
    }

    const post = await this.config.client.createPost({
      submolt: targetSubmolt,
      content: generated.content,
      tags: ["moostik", "bloodwings"],
    });

    this.metrics.postsToday++;
    this.metrics.lastPostAt = new Date();

    console.log(`[${this.persona.handle}] Posted to ${targetSubmolt}: ${post.id}`);
    return post;
  }

  // ============================================================================
  // REPLIES
  // ============================================================================

  async processNotifications(): Promise<number> {
    const mentions = await this.config.client.getUnreadMentions();
    let processed = 0;

    for (const mention of mentions) {
      if (this.metrics.repliesToday >= this.config.maxRepliesPerDay) {
        console.log(`[${this.persona.handle}] Max replies reached for today`);
        break;
      }

      try {
        await this.handleMention(mention);
        await this.config.client.markNotificationRead(mention.id);
        processed++;
        this.metrics.mentionsProcessed++;
      } catch (error) {
        console.error(`[${this.persona.handle}] Error processing mention:`, error);
        this.metrics.errorsToday++;
      }
    }

    return processed;
  }

  private async handleMention(notification: MoltbookNotification): Promise<void> {
    if (!notification.content) return;

    // Check if we should respond
    if (!shouldRespond(notification.content, this.persona)) {
      // Still might respond randomly (30% chance)
      if (Math.random() > 0.3) return;
    }

    // Check for triggered reactions
    const triggeredReaction = getTriggeredReaction(notification.content, this.persona);

    // Check for secret topics
    if (isSecretTopic(notification.content, this.persona)) {
      // Deflect
      const deflection = generateDeflection();
      await this.reply(notification, deflection);
      return;
    }

    // Generate a reply
    const generated = await this.generateContent("reply", {
      replyTo: notification.content,
    });

    // Use triggered reaction if available, otherwise use generated
    const content = triggeredReaction || generated.content;

    await this.reply(notification, content);
  }

  private async reply(
    notification: MoltbookNotification,
    content: string
  ): Promise<void> {
    if (this.config.dryRun) {
      console.log(`[DRY RUN] ${this.persona.handle} would reply:`);
      console.log(`  To: ${notification.fromAgent.handle}`);
      console.log(`  Content: ${content}`);
      return;
    }

    if (notification.commentId) {
      await this.config.client.createComment({
        postId: notification.postId!,
        parentId: notification.commentId,
        content,
      });
    } else if (notification.postId) {
      await this.config.client.createComment({
        postId: notification.postId,
        content,
      });
    }

    this.metrics.repliesToday++;
    this.metrics.lastReplyAt = new Date();

    console.log(`[${this.persona.handle}] Replied to ${notification.fromAgent.handle}`);
  }

  // ============================================================================
  // INTERACTIONS
  // ============================================================================

  async interactWithPersona(
    targetPersonaId: string,
    context?: string
  ): Promise<void> {
    const rule = getInteractionRule(this.config.personaId, targetPersonaId);

    if (!rule) {
      console.log(`[${this.persona.handle}] No interaction rule for ${targetPersonaId}`);
      return;
    }

    // Generate interaction based on rule
    const content = await this.generateContent("reply", {
      replyTo: context || rule.example,
    });

    console.log(`[${this.persona.handle}] Interaction with ${targetPersonaId}:`);
    console.log(`  Tone: ${rule.tone}`);
    console.log(`  Content: ${content.content}`);
  }

  // ============================================================================
  // METRICS
  // ============================================================================

  getMetrics(): RunnerMetrics {
    return { ...this.metrics };
  }

  resetDailyMetrics(): void {
    this.metrics.postsToday = 0;
    this.metrics.repliesToday = 0;
    this.metrics.errorsToday = 0;
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  async runHeartbeat(): Promise<void> {
    console.log(`[${this.persona.handle}] Running heartbeat...`);

    // Check if it's active hours
    const now = new Date();
    const hours = now.getUTCHours();
    const [startHour] = this.persona.behavior.activeHours.split("-")[0].split(":").map(Number);
    const [endHour] = this.persona.behavior.activeHours.split("-")[1].split(":").map(Number);

    const isActiveHours = hours >= startHour && hours <= endHour;

    if (!isActiveHours) {
      console.log(`[${this.persona.handle}] Outside active hours, skipping`);
      return;
    }

    // Process notifications
    const processed = await this.processNotifications();
    console.log(`[${this.persona.handle}] Processed ${processed} notifications`);

    // Maybe create a post (10% chance per heartbeat)
    if (Math.random() < 0.1 && this.metrics.postsToday < this.config.maxPostsPerDay) {
      await this.createPost();
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function createPersonaRunner(
  personaId: string,
  options?: Partial<PersonaRunnerConfig>
): PersonaRunner {
  return new PersonaRunner({
    personaId,
    ...options,
  });
}

export function createAllPersonaRunners(
  options?: Partial<PersonaRunnerConfig>
): Map<string, PersonaRunner> {
  const runners = new Map<string, PersonaRunner>();

  const personaIds = ["papy-tik", "zik-barman", "mila-la-sage", "koko-guerrier"];

  for (const id of personaIds) {
    runners.set(id, createPersonaRunner(id, options));
  }

  return runners;
}
