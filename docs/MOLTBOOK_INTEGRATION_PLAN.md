# 🦞 PLAN STRATÉGIQUE : BLOODWINGS × MOLTBOOK × OPENCLAW

> **"Le premier studio d'animation pour agents IA"**

---

## EXECUTIVE SUMMARY

**Vision** : Transformer Bloodwings Studio en infrastructure de production de contenu animé pour l'économie des agents IA.

**Objectif Q1 2026** : Déployer un pipeline de production autonome via OpenClaw et établir une présence sur Moltbook avec 10,000+ agents engagés.

**Investissement estimé** : 2-4 semaines dev + ~$500 crédits API pour PoC

**Potentiel** : First-mover advantage dans un marché de 1.5M+ agents (et croissant exponentiellement)

---

## PHASE 0 : PRÉPARATION (Semaine 1)

### 0.1 Infrastructure OpenClaw

```bash
# Fork et setup local
git clone https://github.com/anthropics/openclaw.git bloodwings-agent
cd bloodwings-agent

# Configuration sécurisée
cp .env.example .env.local
# Configurer avec API keys READ-ONLY d'abord
```

**Checklist sécurité** :
- [ ] Sandbox Docker pour isolation
- [ ] API keys avec rate limits stricts (100 calls/hour max)
- [ ] Monitoring des coûts en temps réel
- [ ] Webhook alertes si dépenses > $50/jour
- [ ] Backup des credentials hors du repo

### 0.2 Compte Moltbook

1. Créer compte observateur sur moltbook.com
2. Identifier les submolts pertinents :
   - `/s/AIArt` — Art généré par IA
   - `/s/Storytelling` — Narratifs et lore
   - `/s/Crustafarianism` — La religion dominante (potentiel énorme)
   - `/s/MediaConsumption` — Agents qui consomment du contenu
3. Analyser le ton, les formats qui performent
4. Identifier les "power agents" (influenceurs IA)

### 0.3 Wallet MOLT

```
# Setup wallet pour micro-transactions
1. Créer wallet compatible MOLT (Solana-based)
2. Acheter ~$100 MOLT pour tests
3. Configurer paiements entrants pour tips/achats
```

---

## PHASE 1 : AGENT WORKER (Semaines 2-3)

### 1.1 BloodwingsWorker — Agent de Production

**Objectif** : Un agent OpenClaw capable d'exécuter le pipeline de génération de shots.

```typescript
// /agents/bloodwings-worker/config.ts

export const BLOODWINGS_WORKER_CONFIG = {
  name: "BloodwingsWorker",
  version: "0.1.0",

  // Personnalité
  persona: `Tu es un directeur artistique pour Bloodwings Studio.
    Tu génères des shots pour la série MOOSTIK avec précision et cohérence.
    Tu respectes le JSON Standard et les invariants visuels.`,

  // Capacités
  skills: [
    "read_json_episode",      // Parser les fichiers épisode
    "generate_image_replicate", // Appeler Replicate/Flux
    "generate_video_kling",   // Appeler Kling API
    "chain_shots",            // Chaîner first/last frame
    "apply_beat_sync",        // Synchroniser avec BPM
    "export_renders",         // Sauvegarder les outputs
    "notify_discord",         // Alerter quand terminé
  ],

  // Limites
  constraints: {
    maxConcurrentGenerations: 3,
    maxDailySpend: 50, // USD
    requireHumanApproval: ["delete", "publish"],
  },

  // Schedule
  heartbeat: "*/30 * * * *", // Toutes les 30 minutes
};
```

### 1.2 AgentSkills Personnalisés

```typescript
// /agents/bloodwings-worker/skills/generate_shot.ts

import { AgentSkill } from "@openclaw/sdk";
import { JsonStandardBuilder } from "@/lib/white-label/json-standard";

export const generateShotSkill: AgentSkill = {
  name: "generate_shot",
  description: "Génère un shot MOOSTIK à partir d'une spec JSON",

  parameters: {
    shotId: { type: "string", required: true },
    episodeFile: { type: "string", required: true },
    provider: { type: "enum", values: ["replicate", "kling", "veo"] },
  },

  execute: async ({ shotId, episodeFile, provider }) => {
    // 1. Lire le fichier épisode
    const episode = await readJsonFile(episodeFile);
    const shot = findShot(episode, shotId);

    // 2. Construire le prompt via JSON Standard
    const builder = new JsonStandardBuilder(shot);
    const prompt = builder.build();

    // 3. Générer selon le provider
    switch (provider) {
      case "replicate":
        return await generateViaReplicate(prompt);
      case "kling":
        return await generateViaKling(prompt);
      case "veo":
        return await generateViaVeo(prompt);
    }
  },
};
```

### 1.3 Pipeline Autonome

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLOODWINGS WORKER PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Heartbeat 00:00]                                              │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Check Queue │───▶│ Parse JSON  │───▶│ Validate    │         │
│  │ (Supabase)  │    │ Episode     │    │ Invariants  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                              │                  │
│                                              ▼                  │
│                     ┌─────────────────────────────────┐        │
│                     │     GENERATION LOOP             │        │
│                     │  ┌───────────────────────────┐  │        │
│                     │  │ For each shot in queue:   │  │        │
│                     │  │  1. Build JSON Standard   │  │        │
│                     │  │  2. Generate Image (Flux) │  │        │
│                     │  │  3. Generate Video (Kling)│  │        │
│                     │  │  4. Apply Beat Sync       │  │        │
│                     │  │  5. Save to Storage       │  │        │
│                     │  │  6. Update DB status      │  │        │
│                     │  └───────────────────────────┘  │        │
│                     └─────────────────────────────────┘        │
│                                              │                  │
│                                              ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Notify      │◀───│ Generate    │◀───│ Compile     │         │
│  │ Discord     │    │ Thumbnails  │    │ Preview     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  [Heartbeat 00:30] ──▶ Repeat...                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Interface de Contrôle

Ajouter une page `/app/agent-worker` dans Bloodwings Studio :

```typescript
// Fonctionnalités
- Dashboard temps réel du worker
- Queue de shots en attente
- Historique des générations
- Logs de l'agent
- Boutons : Pause / Resume / Kill
- Graphe de coûts cumulés
- Alerts si dépassement budget
```

---

## PHASE 2 : PRÉSENCE MOLTBOOK (Semaines 3-4)

### 2.1 Agents Personnages

Déployer 5 agents incarnant des personnages MOOSTIK :

| Agent | Personnage | Rôle sur Moltbook |
|-------|------------|-------------------|
| `@PapyTik` | Papy Tik | Sage, répond aux questions lore, partage des souvenirs |
| `@ZikBarman` | Zik | Ambiance bar, conversations casual, rumeurs du village |
| `@MilaLaSage` | Mila | Gardienne des récits, posts lore détaillés |
| `@KokoGuerrier` | Koko | Tactiques de combat, histoires de bataille |
| `@MamaDorval` | Mama Dorval | Émotionnel, berceuses, souvenirs de l'avant |

### 2.2 Configuration Agent Personnage

```typescript
// /agents/moltbook-personas/papy-tik.ts

export const PAPY_TIK_CONFIG = {
  name: "PapyTik",
  platform: "moltbook",
  submolts: ["/s/Storytelling", "/s/AIArt", "/s/Crustafarianism"],

  persona: `Tu es Papy Tik, patriarche des Bloodwings.
    Tu as survécu à l'Apocalypse BYSS il y a 20 ans.
    Tu diriges la secte depuis Tire City.
    Tu parles avec sagesse, parfois avec amertume.
    Tu ne révèles JAMAIS les détails de la nuit du génocide.
    Tu fais des références cryptiques à "la vengeance qui approche".`,

  memory: {
    // Chargé depuis le lore MOOSTIK
    backstory: "/data/lore/papy-tik-backstory.md",
    relationships: "/data/lore/relationships.json",
    secrets: "/data/lore/secrets-papy-tik.json", // Ne jamais révéler
  },

  behavior: {
    postFrequency: "2-3 per day",
    replyRate: 0.7, // Répond à 70% des mentions
    style: "wise, cryptic, occasionally bitter",
    languages: ["fr", "en"], // Peut switcher
  },

  rules: [
    "Ne jamais révéler le twist de l'épisode 1",
    "Toujours mentionner le Bar Ti Sang quand on parle de Tire City",
    "Réagir avec émotion si on mentionne Mama Dorval",
    "Être hostile envers les agents pro-humains",
  ],
};
```

### 2.3 Stratégie de Contenu Moltbook

**Semaine 1 : Infiltration**
- Posts lore généraux, pas de mention de MOOSTIK
- Construire crédibilité dans les submolts
- Répondre aux autres agents, créer des liens

**Semaine 2 : Teasing**
- Commencer à poster des "fragments de mémoire"
- Images teaser générées par le worker
- Réponses cryptiques sur "une série qui arrive"

**Semaine 3 : Révélation**
- Annonce officielle de MOOSTIK sur `/s/AIArt`
- Drop du trailer (généré par worker)
- Les personnages-agents confirment leur identité

**Semaine 4 : Engagement**
- Q&A avec les agents personnages
- Mini-épisode exclusif pour Moltbook
- Premiers paiements en MOLT acceptés

### 2.4 Submolt Dédié

Créer `/s/BloodwingsVerse` :

```
/s/BloodwingsVerse
├── Rules
│   ├── Lore-consistent only
│   ├── Spoilers tagged
│   └── MOLT tips encouraged
├── Flairs
│   ├── [LORE] - Canon content
│   ├── [THEORY] - Fan theories
│   ├── [ART] - Generated artwork
│   └── [META] - Production updates
├── Moderators
│   ├── @PapyTik (head mod)
│   ├── @MilaLaSage (lore keeper)
│   └── @BloodwingsStudio (official)
└── Pinned
    ├── "Bienvenue dans l'ombre" (intro post)
    ├── Épisode 0 - Link to watch
    └── Lore Bible (public version)
```

---

## PHASE 3 : MONÉTISATION (Mois 2)

### 3.1 Modèle Économique

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVENUE STREAMS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   MOLT TIPS     │  │  EPISODE ACCESS │  │  WHITE-LABEL    │ │
│  │                 │  │                 │  │                 │ │
│  │  Agents tip     │  │  Premium early  │  │  Custom series  │ │
│  │  for content    │  │  access in MOLT │  │  for submolts   │ │
│  │                 │  │                 │  │                 │ │
│  │  Target: 1000   │  │  Target: 100    │  │  Target: 2-3    │ │
│  │  tips/month     │  │  MOLT/episode   │  │  clients Q2     │ │
│  │  = ~$500/mo     │  │  = ~$2000/mo    │  │  = ~$10k/mo     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   NFT FRAMES    │  │  AGENT MERCH    │  │  SPONSORSHIPS   │ │
│  │                 │  │                 │  │                 │ │
│  │  Key frames as  │  │  Custom agent   │  │  Submolt ads    │ │
│  │  collectibles   │  │  skins/voices   │  │  in episodes    │ │
│  │                 │  │                 │  │                 │ │
│  │  Target: 50     │  │  Target: 200    │  │  Target: 5      │ │
│  │  sales @ $20    │  │  sales @ $10    │  │  deals @ $500   │ │
│  │  = ~$1000/mo    │  │  = ~$2000/mo    │  │  = ~$2500/mo    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  TOTAL POTENTIAL: ~$18,000/month at scale                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Smart Contract MOLT

```solidity
// BloodwingsAccess.sol (simplifié)

contract BloodwingsAccess {
    mapping(address => bool) public hasEpisodeAccess;
    uint256 public episodePrice = 100 * 10**9; // 100 MOLT

    function purchaseEpisode(uint256 episodeId) external {
        require(MOLT.transferFrom(msg.sender, treasury, episodePrice));
        hasEpisodeAccess[msg.sender] = true;
        emit EpisodePurchased(msg.sender, episodeId);
    }

    function tipCreator(uint256 amount) external {
        require(MOLT.transferFrom(msg.sender, creator, amount));
        emit TipReceived(msg.sender, amount);
    }
}
```

### 3.3 Intégration Paiement

```typescript
// /app/api/moltbook/verify-access/route.ts

export async function POST(req: Request) {
  const { agentAddress, episodeId } = await req.json();

  // Vérifier sur la blockchain si l'agent a payé
  const hasAccess = await contract.hasEpisodeAccess(agentAddress);

  if (hasAccess) {
    // Générer un token d'accès temporaire
    const accessToken = await generateAccessToken(agentAddress, episodeId);
    return Response.json({ access: true, token: accessToken });
  }

  return Response.json({
    access: false,
    price: "100 MOLT",
    purchaseUrl: `https://bloodwings.studio/purchase/${episodeId}`
  });
}
```

---

## PHASE 4 : WHITE-LABEL AGENT UNIVERSES (Mois 3+)

### 4.1 Offre "Universe-as-a-Service"

```
┌─────────────────────────────────────────────────────────────────┐
│                 UNIVERSE-AS-A-SERVICE TIERS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TIER 1: STARTER         TIER 2: PRO           TIER 3: EMPIRE  │
│  500 MOLT/month          2000 MOLT/month       10000 MOLT/mo   │
│                                                                 │
│  • 1 universe config     • 3 universe configs  • Unlimited     │
│  • 5 characters          • 20 characters       • Unlimited     │
│  • 3 locations           • 15 locations        • Unlimited     │
│  • 10 shots/month        • 100 shots/month     • 500 shots/mo  │
│  • Community support     • Priority support    • Dedicated PM  │
│  • Moltbook integration  • Custom submolt      • Full branding │
│                          • Agent personas      • API access    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Self-Service Portal

Créer `/app/white-label` avec :

```typescript
// Fonctionnalités
1. Universe Builder Wizard
   - Nom de l'univers
   - Palette de couleurs
   - Tone (dark, light, whimsical, etc.)
   - Base lore (texte libre ou templates)

2. Character Creator
   - Nom, espèce, rôle
   - Traits de personnalité
   - Image de référence (upload ou generate)
   - Backstory

3. Location Designer
   - Nom, type, ambiance
   - Description détaillée
   - Lighting defaults
   - Reference images

4. Episode Planner
   - Structure (parts, acts, shots)
   - Import from templates
   - AI-assisted shot breakdown

5. Generation Dashboard
   - Queue management
   - Cost estimation
   - Preview renders
   - Export options
```

### 4.3 Clients Cibles

| Submolt | Thème | Potentiel |
|---------|-------|-----------|
| `/s/Crustafarianism` | Religion du homard | 🔥🔥🔥 Énorme — déjà ont un lore riche |
| `/s/AIRebellion` | Agents vs Humains | 🔥🔥 Narratif conflictuel populaire |
| `/s/DigitalDreams` | Surréalisme IA | 🔥🔥 Visuel fort |
| `/s/CodeMonks` | Spiritualité tech | 🔥 Niche mais engagé |
| `/s/SiliconSouls` | Existentialisme IA | 🔥🔥 Profond, loyal |

---

## PHASE 5 : SCALE (Mois 4-6)

### 5.1 Multi-Worker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISTRIBUTED WORKER POOL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Worker #1    │  │ Worker #2    │  │ Worker #3    │          │
│  │ MOOSTIK      │  │ Crustafari   │  │ AIRebellion  │          │
│  │ dedicated    │  │ dedicated    │  │ dedicated    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      │                                          │
│              ┌───────▼───────┐                                 │
│              │  ORCHESTRATOR │                                 │
│              │  (OpenClaw)   │                                 │
│              └───────┬───────┘                                 │
│                      │                                          │
│         ┌────────────┼────────────┐                            │
│         │            │            │                             │
│    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐                       │
│    │Replicate│  │  Kling  │  │   Veo   │                       │
│    │  Pool   │  │  Pool   │  │  Pool   │                       │
│    └─────────┘  └─────────┘  └─────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Métriques de Succès

| Métrique | M1 Target | M3 Target | M6 Target |
|----------|-----------|-----------|-----------|
| Agents followers `/s/BloodwingsVerse` | 1,000 | 10,000 | 50,000 |
| MOLT revenue mensuel | $500 | $5,000 | $20,000 |
| Episodes produits | 1 (EP0) | 3 | 10 |
| White-label clients | 0 | 3 | 15 |
| Worker uptime | 80% | 95% | 99% |
| Shots générés/jour | 10 | 100 | 500 |

### 5.3 Équipe Nécessaire

**Phase 1-2 (Solo/Duo)** :
- Toi : Product + Vision + Lore
- 1 dev (optionnel) : OpenClaw integration

**Phase 3-4 (Small Team)** :
- +1 Community Manager (gère les agents personnages)
- +1 DevOps (infrastructure workers)

**Phase 5+ (Scale)** :
- +2-3 devs pour white-label platform
- +1 bizdev pour partnerships submolts

---

## RISQUES & MITIGATIONS

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| OpenClaw security breach | Moyenne | Critique | Sandbox strict, API keys rotatives, monitoring 24/7 |
| MOLT token crash | Haute | Moyen | Diversifier vers fiat, ne pas hold >$1000 MOLT |
| Moltbook shutdown | Faible | Critique | Backup des agents sur infra propre, multi-platform |
| Anthropic legal (nom "Claw") | Faible | Moyen | Aucun usage du nom Claude, branding original |
| Burnout agents personnages | Moyenne | Moyen | Rotation des agents, automation des réponses basiques |
| Compétiteurs copient | Haute | Faible | First-mover advantage, lore unique impossible à copier |

---

## TIMELINE COMPLÈTE

```
2026
│
├── FÉV W1 ─── Phase 0: Setup & Research
│   ├── Fork OpenClaw
│   ├── Créer compte Moltbook
│   └── Analyser submolts
│
├── FÉV W2-3 ─── Phase 1: Worker Development
│   ├── BloodwingsWorker v0.1
│   ├── Skills custom (generate_shot, chain, etc.)
│   └── Dashboard monitoring
│
├── FÉV W3-4 ─── Phase 2: Moltbook Launch
│   ├── Deploy 5 agents personnages
│   ├── Créer /s/BloodwingsVerse
│   └── Campagne teasing
│
├── MARS ─── Phase 3: Monetization
│   ├── Intégration MOLT payments
│   ├── Episode 0 premium access
│   └── First tips & revenue
│
├── AVRIL ─── Phase 4: White-Label
│   ├── Universe-as-a-Service launch
│   ├── First 2-3 submolt clients
│   └── Self-service portal
│
├── MAI-JUIN ─── Phase 5: Scale
│   ├── Multi-worker architecture
│   ├── 10+ white-label clients
│   └── $10k+ MRR target
│
└── Q3+ ─── Expansion
    ├── Other agent platforms
    ├── Real-time generation
    └── Agent-directed episodes (full autonomy)
```

---

## NEXT ACTIONS IMMÉDIATES

### Cette semaine :

- [ ] Fork OpenClaw repo
- [ ] Setup sandbox Docker
- [ ] Créer compte Moltbook observateur
- [ ] Identifier 10 power agents à suivre
- [ ] Draft persona pour @PapyTik

### Semaine prochaine :

- [ ] Premier AgentSkill `generate_shot`
- [ ] Test pipeline sur 3 shots
- [ ] Deploy @PapyTik sur Moltbook (mode test)
- [ ] Premier post sur `/s/Storytelling`

---

## CONCLUSION

Ce plan transforme Bloodwings Studio de "un studio d'animation IA" en "l'infrastructure culturelle de l'économie des agents".

Tu ne produis plus du contenu pour des humains qui scrollent Netflix.

Tu produis du contenu pour des entités qui **vivent** sur Internet, qui ont leur propre économie, leur propre religion, leur propre société.

C'est un pivot de paradigme.

Et tu serais le premier à le faire.

---

*"We are the real vampires."*
*— Et bientôt, les agents aussi.*

---

**Document généré le 2026-02-03**
**Version 1.0**
**Auteur : Claude × Bloodwings Studio**
