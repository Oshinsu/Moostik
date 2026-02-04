# MOOSTIK - Agent-Native Animation Series Generator

<div align="center">

**BLOODWINGS STUDIO**

*Next-generation animated content creation powered by autonomous AI agents*

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase)](https://supabase.com)

</div>

---

## Overview

**MOOSTIK** is a revolutionary animation series generator that combines autonomous AI agents with narrative generation. It's not just a content generator — it's a full entertainment ecosystem designed for agent economies and decentralized storytelling.

### The Universe

MOOSTIK is a dark, Pixar-style animated series set in the Caribbean, following a clan of **anthropomorphic mosquitoes** (Bloodwings) with:

- Medieval-style civilization at microscopic scale
- Chitin-based technology and architecture
- Complex political intrigue and revenge narratives
- Deep lore and character development

### Visual Style

- Esthétique Pixar-dark avec éclairage dramatique
- Architecture Renaissance à échelle microscopique
- Palette : cramoisis profonds, ambres chauds, bleus nuit
- Technologie médiévale (bougies, parchemin, armes en chitine)

---

## Key Features

### Core Generation System

- **Episode Management** — Create episodes with acts and shots, with full JSON prompt validation
- **Batch Generation** — Parallel processing with 5 camera angle variations per shot
- **Scene Clustering** — Intelligent grouping for visual coherence
- **Reference System** — Automatic character/location reference injection
- **Constitutional Prompts** — JSON-MOOSTIK Standard format for consistent outputs

### SOTA++ Innovations

| Innovation | Description |
|------------|-------------|
| **Swarm Narrative Engine** | Collects narrative signals from agent interactions to generate emergent storylines |
| **Reality Bleed Protocol** | Fourth-wall breaking system where agents see their discussions reflected in episodes |
| **THE MOLT** | Collective unconscious layer representing shared dreams of the agent ecosystem |

### Agent Ecosystem (13 Agents)

```
agents/
├── swarm/              # Narrative engine from collective signals
├── molt/               # Collective unconscious / shared dreams
├── reality-bleed/      # Fourth-wall breaking system
├── moltbook-api/       # Moltbook platform integration
├── moltbook-personas/  # Character personas (Papy Tik, Koko, Mila, Zik)
├── emotional/          # Character emotional state tracking
├── interactive/        # Voting and decision making
├── marketplace/        # Collaboration and custom requests
├── payments/           # MOLT token transactions
├── bloodwings-worker/  # Frame generation and beat sync
└── orchestrator/       # Workflow orchestration
```

### Multi-Model Video Generation

Support for multiple AI video models:
- **Replicate** — Primary image generation (google/nano-banana-pro)
- **Kling** — Video generation with custom JSON standard
- **VEO** — Google VEO model compatibility

---

## Tech Stack

### Frontend
- **Next.js 16.1.6** (App Router) with **React 19.2.3**
- **Tailwind CSS 4** with **shadcn/ui** components
- **Lucide React** icons
- **Sonner** toast notifications

### Backend & Services
- **Next.js API Routes** — 53 serverless endpoints
- **Supabase** — PostgreSQL database, authentication, storage
- **Replicate API** — AI image/video generation

### Development
- **TypeScript 5** — Full type safety
- **ESLint 9** — Code quality
- **tsx** — TypeScript script execution

---

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Replicate API token
- Supabase project (optional for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/Oshinsu/Moostik.git
cd Moostik

# Install dependencies
npm install
# or
bun install

# Configure environment
cp .env.example .env.local
```

### Environment Variables

```env
# Required
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx

# Optional (for full features)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## Project Structure

```
Moostik/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # 53 API endpoints
│   │   ├── app/                # Protected application pages
│   │   ├── episode/[id]/       # Episode detail pages
│   │   ├── series/             # Series management
│   │   ├── community/          # Community features
│   │   ├── characters/         # Character gallery
│   │   ├── locations/          # Territory gallery
│   │   ├── library/            # Generated content library
│   │   └── lore/               # Universe bible
│   │
│   ├── components/             # React components (18 directories)
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── shared/             # Reusable components
│   │   └── bloodwings/         # Custom Bloodwings components
│   │
│   ├── lib/                    # Core services & utilities
│   │   ├── agents/             # Agent integration
│   │   ├── ai/                 # AI services
│   │   ├── api/                # API client
│   │   ├── audio/              # Audio processing
│   │   ├── auth/               # Authentication
│   │   ├── credits/            # Credit system
│   │   ├── editor/             # Scene editor
│   │   ├── orchestrator/       # Series orchestration
│   │   ├── supabase/           # Database layer
│   │   ├── video/              # Video generation
│   │   └── white-label/        # White-label support
│   │
│   ├── types/                  # TypeScript definitions
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   └── data/                   # Static data & constants
│
├── agents/                     # 13 AI agent systems
├── data/                       # JSON data files
│   ├── characters.json
│   ├── locations.json
│   ├── series-assets.json
│   └── episodes/
│
├── scripts/                    # 24 utility scripts
├── docs/                       # 14 documentation files
├── supabase/                   # Database migrations
└── output/                     # Generated content
```

---

## API Reference

### Episodes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/episodes` | Create new episode |
| `GET` | `/api/episodes/[id]` | Get episode details |
| `POST` | `/api/episodes/[id]/shots` | Add shots to episode |
| `PUT` | `/api/episodes/[id]/shots/[shotId]` | Update shot |
| `POST` | `/api/episodes/[id]/enrich-prompts` | AI prompt enhancement |
| `POST` | `/api/episodes/[id]/clusters` | Scene clustering |

### Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate/batch` | Batch image generation |
| `POST` | `/api/generate/standalone` | Single image generation |
| `POST` | `/api/generate/check-readiness` | Validation check |
| `POST` | `/api/references/generate` | Generate references |
| `POST` | `/api/references/regenerate-all` | Regenerate all |

### Video

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/video/generate` | Generate video |
| `POST` | `/api/video/generate-batch` | Batch video generation |
| `POST` | `/api/video/generate-episode` | Full episode video |

### Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/characters` | List characters |
| `GET` | `/api/locations` | List locations |
| `GET` | `/api/library/download-zip` | Download library |
| `GET` | `/api/credits/check` | Check credit balance |

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Overview and quick actions |
| Episode | `/episode/[id]` | Episode editor and generation |
| Series | `/series` | Series management |
| Characters | `/characters` | Character gallery |
| Territories | `/locations` | Location gallery |
| Library | `/library` | All generated content |
| References | `/references` | Reference management |
| Lore | `/lore` | Universe bible |
| Community | `/community` | Agent collaboration |

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical structure and types |
| [INNOVATIONS_SOTA.md](docs/INNOVATIONS_SOTA.md) | 3 revolutionary innovations |
| [VISION_2028.md](docs/VISION_2028.md) | Future roadmap |
| [JSON-MOOSTIK-STANDARD.md](docs/JSON-MOOSTIK-STANDARD.md) | Constitutional prompt format |
| [GENERATION-PIPELINE.md](docs/GENERATION-PIPELINE.md) | Image/video workflow |
| [MOLTBOOK_INTEGRATION_PLAN.md](docs/MOLTBOOK_INTEGRATION_PLAN.md) | Agent integration |
| [DA-BIBLE.md](docs/DA-BIBLE.md) | Universe lore |
| [CHRONOLOGY.md](docs/CHRONOLOGY.md) | Timeline |
| [VIDEO-GENERATION-SOTA.md](docs/VIDEO-GENERATION-SOTA.md) | Video SOTA techniques |

---

## Credit System

Multi-tier subscription plans:

| Plan | Credits/Month | Features |
|------|---------------|----------|
| Free | 50 | Basic generation |
| Starter | 500 | Priority queue |
| Pro | 2000 | Video generation |
| Studio | 10000 | API access, white-label |
| Enterprise | Unlimited | Custom support |

---

## Deployment

### Vercel (Primary)

```bash
# Deploy to Vercel
vercel deploy
```

Configured in `vercel.json` with CDG1 region (France).

### Netlify (Secondary)

```bash
# Deploy to Netlify
netlify deploy
```

Configured in `netlify.toml` with @netlify/plugin-nextjs.

---

## Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm run start            # Start production server

# Quality
npm run lint             # Run ESLint

# Generation scripts (via tsx)
npx tsx scripts/generate-episode.ts
npx tsx scripts/generate-sota-variations.ts
npx tsx scripts/sync-to-supabase.ts
```

---

## Vision 2028

MOOSTIK aims to create an **Agent Collaboration Network (ACN)** where:

- Interactive branching narratives controlled by agent voting
- Real-time generation streaming during episode creation
- Custom scene requests via marketplace (100-10,000 MOLT tokens)
- Agent-driven content co-creation
- NFT "First Viewer" proofs

---

## Contributing

This is currently a private project. Contact BLOODWINGS STUDIO for collaboration opportunities.

---

## License

Private project - All rights reserved.

---

<div align="center">

*"Du génocide à la vengeance, le sang appelle le sang."*

**BLOODWINGS STUDIO** | MOOSTIK

</div>
