# Padyna: AI customer support bot for everyone

This is an AI-powered customer support application with a web interface and server backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local database)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local database (Docker required)
pnpm -F server db:start

# Run all apps (server + web)
pnpm dev

# Or run individually
pnpm dev:server  # Backend on port 3000
pnpm dev:web     # Frontend on port 3001
```

## Environment Setup

Copy the example environment files and fill in your values:

```bash
# Root project
cp .env.whatsapp.example .env.whatsapp

# Server config (apps/server/.env)
cp apps/server/.env.example apps/server/.env

# Web config (apps/web/.env)
cp apps/web/.env.example apps/web/.env
```

### Required Variables

**apps/server/.env:**
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Random 32+ character string for auth
- `BETTER_AUTH_URL` — Your app URL (e.g., http://localhost:3001)

**apps/web/.env:**
- `VITE_SERVER_URL` — Server API URL (e.g., http://localhost:3000)
- `DATABASE_URL` — Same as server DATABASE_URL

### Optional: WhatsApp Integration

To enable WhatsApp support, add to `.env.whatsapp`:
- `WHATSAPP_APP_ID` — From Meta Developer Portal
- `WHATSAPP_APP_SECRET` — From Meta Developer Portal
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` — Your chosen verify token

## Tech Stack

- **Web:** React, Vite, Shadcn/ui, Better Auth, Drizzle
- **Server:** Express, Drizzle ORM, WebSockets
- **Database:** PostgreSQL + Redis (for rate limiting)
- **AI:** Google Gemini, OpenAI

## Available Commands

| Command | Description |
|--------|------------|
| `pnpm dev` | Run all apps |
| `pnpm dev:server` | Run server only |
| `pnpm dev:web` | Run web only |
| `pnpm build` | Build all apps |
| `pnpm check` | Format & lint |
| `pnpm check-types` | Type check |

### Database Commands (server)

```bash
pnpm -F server db:start    # Start local DB
pnpm -F server db:push    # Push schema to DB
pnpm -F server db:studio  # Open DB studio
pnpm -F server db:stop    # Stop local DB
```