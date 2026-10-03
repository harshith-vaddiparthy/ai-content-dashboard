# AGENTS.md — AI Content Dashboard

This file is project-specific and takes precedence over any global `AGENTS.md` elsewhere on this machine (e.g. a Task Master AI guide at `~/AGENTS.md` from unrelated projects). **This project does not use Task Master AI** — specs are plain markdown in `docs/`.

## What this project is

A single-user web dashboard for generating blog posts, newsletters, and real video content with AI, managing it all in one library, and tracking basic performance stats. Built clean enough to be forkable by other solo builders later. Goals/why: [docs/PRD.md](docs/PRD.md). Exact screens/flows/behavior: [docs/SPEC.md](docs/SPEC.md). System design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack at a glance

- Next.js (App Router) + TypeScript — single app, not a monorepo
- UI: **shadcn/ui only — hard rule, see Conventions below**
- Database: Postgres via Prisma
- AI: OpenRouter (text generation), Higgsfield (video generation) — both called server-side only, via `lib/ai/*`
- Hosting: Vercel · Source: GitHub

## Commands

(standard Next.js/Prisma scripts — accurate once the app is scaffolded)

```bash
npm run dev              # local dev server
npm run build            # production build
npm run lint             # lint
npx prisma studio        # browse the database visually
npx prisma migrate dev   # apply schema changes locally
```

## Conventions

- **Hard rule — UI is shadcn/ui only.** Every component must come from the shadcn registry (`npx shadcn@latest add <name>`) or be composed from shadcn primitives already in `components/ui/`. Never add another component library, never hand-roll a component that shadcn already provides. Check the registry before building anything custom.
- All calls to OpenRouter/Higgsfield live in `lib/ai/*`, invoked only from server-side route handlers under `app/api/**`. Never call them from client components; never let an API key reach the browser.
- Secrets live in environment variables (see `.env.example` once it exists) — never commit real keys, never store them in the database in v1.
- Keep code modular and documented at the architecture level — this project is meant to be forkable by other solo builders eventually (see `docs/PRD.md` §3), so avoid cramming unrelated logic together.
- Don't hand-edit `prisma/schema.prisma` without running a migration afterward (`npx prisma migrate dev`).
- Don't add multi-user auth, billing, or external analytics integrations — explicitly out of scope for v1 per the PRD.

## Where to look first

- Product scope & decisions → `docs/PRD.md`
- Exact screens, flows, states, acceptance criteria → `docs/SPEC.md`
- System design & data model → `docs/ARCHITECTURE.md`
