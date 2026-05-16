# Beer League Check-In

A web app for a small group of players to manage game attendance and beer duty. Users log in via magic link, see upcoming games, mark attendance, and volunteer to bring beer.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Vercel serverless functions (`/api`)
- **Database:** Supabase (Postgres) with Row-Level Security
- **Auth:** Supabase Auth (magic link email)
- **Real-time:** Supabase Realtime (WebSocket subscriptions)
- **Email:** Resend (server-side only)
- **Monitoring:** Sentry (client + server)

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) (for local Supabase)

## Getting Started

```bash
# Install dependencies
npm install

# Start Supabase (requires Docker running)
npx supabase start

# Apply migrations and seed data
npx supabase db reset

# Start the dev server
npm run dev
```

## Local URLs

| Service         | URL                          |
|-----------------|------------------------------|
| App             | http://localhost:5173         |
| Supabase Studio | http://127.0.0.1:54323       |
| Mailpit (email) | http://127.0.0.1:54324       |

Magic link emails are captured by Mailpit locally — check there after signing in.

## Commands

```bash
# Dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Type check
npm run typecheck

# Reset database (re-applies migrations + seed data)
npx supabase db reset

# Regenerate TypeScript types after schema changes
npx supabase gen types typescript --local 2>/dev/null > src/lib/supabase/database.types.ts
```

## Shutting Down

```bash
# Stop the dev server (Ctrl+C in its terminal, or)
pkill -f vite

# Stop Supabase
npx supabase stop
```

## Environment Variables

Copy `.env.local.example` to `.env.local` for local dev. Set all of these in Vercel for production.

| Variable                    | Scope       | Description                  |
|-----------------------------|-------------|------------------------------|
| `VITE_SUPABASE_URL`        | Client      | Supabase project URL         |
| `VITE_SUPABASE_ANON_KEY`   | Client      | Supabase public anon key     |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key    |
| `RESEND_API_KEY`            | Server only | Resend API key for emails    |
| `VITE_SENTRY_DSN`          | Client      | Sentry DSN for frontend      |
| `SENTRY_DSN`               | Server only | Sentry DSN for API routes    |
| `ADMIN_EMAILS`             | Server only | Comma-separated admin emails |

## API Routes

| Endpoint                    | Description                                              |
|-----------------------------|----------------------------------------------------------|
| `POST /api/send-reminder`   | Sends game reminder to all attending players              |
| `POST /api/beer-reminder`   | Game-day nudge if no one has volunteered for beer         |
| `POST /api/admin/create-user`| Creates a new player (auth user + profile + team member) |

All routes require a valid JWT in the `Authorization: Bearer <token>` header.
