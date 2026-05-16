# Beer League App

A web app for a small group of players to manage game attendance and beer duty.
Users log in, mark themselves absent for upcoming games, and volunteer to bring beer.

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck

# Run tests
npm run test
```

> If these commands fail, check `package.json` for the actual script names.

## Local development

```bash
# Start Supabase locally (requires Docker)
npx supabase start

# Apply migrations
npx supabase db reset

# Regenerate TypeScript types after schema changes
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Run dev server (separate terminal)
npm run dev
```

Supabase Studio runs at `http://localhost:54323` when local stack is up.

## Architecture

Single-repo. React + Vite frontend deployed to Vercel. Supabase handles the database,
auth (magic link / email), and real-time subscriptions. Node.js serverless functions
in `/api` handle anything that must not run in the browser (Resend email, server-side
Supabase service role calls). Sentry is wired into both the client and the API layer.

```
/
├── src/
│   ├── pages/        # Page-level components (React Router or TanStack Router)
│   ├── components/   # Shared UI (shadcn/ui components live in components/ui/)
│   ├── lib/          # Supabase client, utilities, type helpers
│   │   └── supabase/
│   │       ├── client.ts           # Browser client (anon key)
│   │       └── database.types.ts   # Generated — do not edit manually
│   └── hooks/        # Custom React hooks (useSession, useGames, etc.)
├── api/              # Vercel serverless functions (Node.js)
│   └── _supabase.ts  # Server client (service role key)
├── supabase/
│   ├── migrations/   # SQL migration files — source of truth for schema
│   └── seed.sql      # Local dev seed data
└── CLAUDE.md
```

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling / UI | shadcn/ui + Tailwind CSS |
| Package manager | npm |
| Backend | Node.js serverless functions on Vercel (`/api`) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth — magic link email |
| Real-time | Supabase Realtime (WebSocket subscriptions) |
| Email | Resend — called server-side only |
| Monitoring | Sentry — client (`@sentry/react`) + server (`@sentry/node`) |
| Hosting | Vercel |

## Database schema

These are the actual tables. Always check `supabase/migrations/` for the authoritative schema.
Generate fresh TypeScript types with `npx supabase gen types typescript --local` after any
schema change — never hand-edit `database.types.ts`.

```
league          id (int8 PK), name (text, unique), description (varchar)

season          id (int8 PK), league_id (int8 → league.id),
                start_date (date), end_date (date), is_active (bool)

team            id (int8 PK), league_id (int8 → league.id), name (text)

team_member     id (int8 PK), team_id (int8 → team.id),
                profile_id (int8 → profile.id),
                role (text), position (text), joined_at (timestamptz)

profile         id (int8 PK), user_id (uuid → auth.users.id),
                display_name (text), created_at (timestamptz)

games           id (int8 PK), season_id (int8 → season.id),
                game_time (timestamptz), location (text)

game_teams      id (int8 PK), game_id (int8 → games.id),
                team_id (int8 → team.id), is_home (bool)

game_response   id (int8 PK), game_team_id (int8 → game_teams.id),
                team_member_id (int8 → team_member.id),
                attending (bool), bringing_beer (bool),
                created_at (timestamptz), updated_at (timestamptz)
```

### How data flows for a typical query

To show a user their upcoming games with RSVP status:

```
auth.users → profile → team_member → game_teams → games
                                   → game_response (their response for that game_team)
```

A `game_response` is scoped to a `game_teams` row (not directly to a game), because
each game has two sides. Always join through `game_teams` to reach a specific game.

### Beer duty rule

`bringing_beer` lives on `game_response`. Only one `team_member` per `game_teams` row
should have `bringing_beer = true` at a time. Enforce this at the app layer when
toggling beer duty — query for an existing `bringing_beer = true` on the same
`game_team_id` before setting a new one.

Row-level security (RLS) is enabled on all tables. Users can read all rows but only
write their own `game_response` rows. The service role key (server-side only) bypasses
RLS where needed.

## Supabase clients — important distinction

- **Browser** → `createClient` with the **anon** key. Lives in `src/lib/supabase/client.ts`.
- **Server / API routes** → `createClient` with the **service role** key. Lives in `api/_supabase.ts`.
  Never expose the service role key to the browser. Vite env vars prefixed `VITE_` are
  bundled into the client — never put the service role key in a `VITE_` variable.

## Auth flow

Magic link only. User enters email → Supabase sends link → redirect to `/auth/callback`
→ session set → user lands on dashboard. JWT is attached to all Supabase SDK calls
automatically. In serverless functions, validate with `supabase.auth.getUser()` before
any privileged operation.

After login, look up the user's `profile` row by `user_id = auth.uid()`, then their
`team_member` row by `profile_id`, to establish which team and league they belong to.

## Environment variables

Vite exposes env vars prefixed `VITE_` to the browser bundle. Everything else is
server-only. Set all of these in Vercel and in `.env.local` for local dev.

```
VITE_SUPABASE_URL           # safe to expose — public
VITE_SUPABASE_ANON_KEY      # safe to expose — public
SUPABASE_SERVICE_ROLE_KEY   # server-side only — never prefix with VITE_
RESEND_API_KEY              # server-side only
VITE_SENTRY_DSN             # client Sentry
SENTRY_DSN                  # server Sentry (API routes)
```

## Pre-commit review checklist

Before every commit, review the staged changes for the following:

1. **No secrets or credentials** — grep staged files for API keys, JWTs (`eyJ`),
   service role keys (`sbp_`, `service_role`), Resend keys (`re_`), and any
   hardcoded tokens. `.env.local` must never be committed (gitignored via `*.local`).
2. **No server-only values in client code** — `SUPABASE_SERVICE_ROLE_KEY` and
   `RESEND_API_KEY` must never appear in `src/`. Only `VITE_`-prefixed env vars
   are allowed in browser code.
3. **No XSS vectors** — no `dangerouslySetInnerHTML`, no unsanitized user input
   rendered in JSX.
4. **No `any` types** — use `unknown` and narrow, or generated Supabase types.
5. **No stale files** — check for unused imports, leftover template files, or
   dead code introduced by the change.
6. **Lint + typecheck pass** — run `npm run lint` and `npm run typecheck` (or
   `tsc -b`) before committing.

## Conventions

- **TypeScript everywhere.** No `any` — use `unknown` and narrow, or use generated
  Supabase types from `database.types.ts`.
- **shadcn/ui components** live in `src/components/ui/` and are owned by this repo.
  Modify them freely. Do not install shadcn as a runtime dependency.
- **Tailwind only** for styling. No inline `style` props except for dynamic values
  that cannot be expressed as classes.
- **Serverless functions are stateless.** No module-level caches, no long-lived
  connections. Use the Supabase pooler URL for any direct Postgres access.
- **Resend is server-side only.** Email sending always goes through an API route.
- **Error boundaries** wrap every page-level component. Errors are caught by Sentry.
- **Commit messages** follow conventional commits: `feat:`, `fix:`, `chore:`, etc.
- **Branch names:** `feature/description` or `fix/description`.

## Key business rules

- A `game_response` row is created or upserted (not inserted fresh) when a user
  responds. Use Supabase's `upsert` targeting `(game_team_id, team_member_id)`.
- Only one `team_member` per game should have `bringing_beer = true`. Check before
  setting — do not rely on a DB constraint for this yet.
- Users can update their response up until game day (`game_time`). The UI should
  disable the form after that, and the API route should reject late changes.
- The app is invite-only. A `profile` row must exist (linked to a real `auth.users`
  entry) before someone can use the app. Admins create these manually or via the
  `POST /api/admin/create-user` route.
- Small user base (~10–20 people). No pagination needed. Fetch all games / all players.

## What serverless functions handle

Most reads/writes go directly from React to Supabase via the SDK.
Only add an API route when the browser cannot safely do the operation.

- `POST /api/send-reminder` — Sends game reminder email to all attending players via Resend.
- `POST /api/beer-reminder` — Game-day only. If no one has volunteered for beer,
  emails all attending players to nudge them.
- `POST /api/admin/create-user` — Creates a `profile` row using the service role key
  (bypasses RLS so an admin can onboard new league members).
