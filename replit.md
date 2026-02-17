# Member Net Verification System

## Overview

This is a **Discord verification system** that pairs a Discord bot with a web-based verification page. Users complete a Linkvertise flow, receive a temporary verification code on the web page, then submit that code in Discord to receive a temporary role (3 hours).

**Core flow:**
1. A staff member runs `,linkvertise #channel @role <link>` in Discord
2. The bot posts a verification panel with a "Get Code" button
3. Users click the button, complete a Linkvertise redirect, and land on the `/verify` web page
4. The web page generates a unique code with a countdown timer
5. Users copy the code and submit it back in Discord via a modal
6. The bot grants them a temporary Discord role for 3 hours

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a **client/server/shared** monorepo pattern:
- `client/` — React frontend (Vite + TypeScript)
- `server/` — Express backend + Discord bot (TypeScript, runs with tsx)
- `shared/` — Shared types, schemas, and API route definitions

### Frontend (client/)
- **Framework:** React with TypeScript
- **Bundler:** Vite (config in `vite.config.ts`)
- **Routing:** Wouter (lightweight client-side router)
- **Styling:** Tailwind CSS with CSS variables for theming (dark space theme with violet/cyan accents)
- **UI Components:** shadcn/ui (new-york style) — full component library in `client/src/components/ui/`
- **State/Data Fetching:** TanStack React Query
- **Animations:** Framer Motion for entry effects, canvas-confetti for celebration on code copy
- **Custom Fonts:** Space Grotesk (display), Inter (body), JetBrains Mono (mono)
- **Path aliases:** `@/` → `client/src/`, `@shared/` → `shared/`

### Backend (server/)
- **Framework:** Express.js on Node.js
- **Discord Bot:** discord.js with gateway intents for Guilds and GuildMessages
- **Code Generation:** In-memory storage using `nanoid` with custom alphabet (no confusing chars like I, O, 1, 0)
- **Code Format:** XXX-XXX-XXX (9 chars with dashes = 11 chars total)
- **Cycle System:** 3-hour global cycles — codes expire with each cycle, auto-resets
- **Bot Command:** `,linkvertise #channel @role <link>` — posts embed panel, handles modal code submission

### Shared Layer (shared/)
- `schema.ts` — Drizzle ORM table definitions (PostgreSQL) and TypeScript interfaces
- `routes.ts` — API route contract with Zod validation schemas

### Database
- **Drizzle ORM** with PostgreSQL dialect configured via `DATABASE_URL` environment variable
- Schema defined in `shared/schema.ts` with a `verification_codes` table
- **However:** The actual verification logic uses **in-memory storage** (`server/storage.ts`) — the database schema exists for type definitions but the system was designed to work without persistent storage
- Migrations output to `./migrations/` directory
- Push schema with `npm run db:push`

### API Endpoints
- `GET /api/code` — Generates and returns a fresh verification code with expiry info
- Internal bot verification — code validation happens in-memory on the server, triggered by Discord interactions

### Build System
- **Dev:** `tsx server/index.ts` with Vite dev server middleware (HMR)
- **Production Build:** Custom `script/build.ts` using esbuild for server + Vite for client
- Server bundles to `dist/index.cjs`, client builds to `dist/public/`
- Selective dependency bundling via allowlist to optimize cold starts

### Key Design Decisions
1. **In-memory storage over database** — Verification codes are ephemeral (3-hour cycles), no persistence needed. The Drizzle/Postgres setup exists but the core logic doesn't depend on it.
2. **Shared API contract** — Zod schemas in `shared/routes.ts` are used by both client and server for type safety and validation.
3. **Single HTTP server** — Express serves both the API and the built React frontend (SPA fallback to index.html).
4. **Bot token hardcoded** — Currently the Discord bot token is hardcoded in `server/bot.ts`. This should ideally be moved to environment variables.

## External Dependencies

### Services & APIs
- **Discord API** via discord.js — Bot for posting verification panels, handling modal interactions, and granting temporary roles
- **Linkvertise** — External monetization/verification redirect (URL provided by staff via bot command)
- **PostgreSQL** — Database provisioned via `DATABASE_URL` environment variable (used by Drizzle ORM)

### Key NPM Packages
- `discord.js` — Discord bot framework
- `drizzle-orm` + `drizzle-kit` — ORM and migration tooling for PostgreSQL
- `nanoid` — Unique code generation with custom alphabets
- `express` — HTTP server
- `zod` + `drizzle-zod` — Schema validation
- `@tanstack/react-query` — Client-side data fetching
- `framer-motion` — Animation library
- `canvas-confetti` — Confetti celebration effect
- `wouter` — Lightweight React router
- Full shadcn/ui component suite (Radix UI primitives)

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- Discord bot token (currently hardcoded, should be `DISCORD_BOT_TOKEN`)