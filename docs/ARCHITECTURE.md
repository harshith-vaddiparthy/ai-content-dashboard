# Architecture — AI Content Dashboard

See `docs/PRD.md` for what we're building and why. This doc covers how.

## 1. Shape of the system

One Next.js app (App Router, TypeScript). No monorepo, no separate backend service — Next.js's own route handlers act as the backend. Deployed on Vercel; source on GitHub.

Why: nothing in the PRD needs more than one app. A single project is simpler to build, deploy, and reason about than a multi-package setup, with no feature lost at this scope.

## 2. Tech stack

| Piece | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | single app |
| UI | **shadcn/ui** (hard rule — see §9) | components installed via the `shadcn` CLI into `components/ui/` |
| Database | Postgres, via Vercel's Neon integration | added from the Vercel dashboard; connection string injected automatically as an env var |
| ORM | Prisma | schema + type-safe queries |
| Text AI | OpenRouter API | server-side only |
| Video AI | Higgsfield API | server-side only |
| Hosting | Vercel | auto-deploy on push to `main` |
| Source control | GitHub | |

**On Higgsfield MCP vs. the Higgsfield API:** these are two different things. MCP is a tool that lets an AI coding assistant (like the one helping build this) call Higgsfield while developing and testing. The live app itself — what real users run — calls Higgsfield's regular REST API with an API key. MCP is a dev-time convenience; it is not part of what ships to users.

## 3. Folder structure

```
app/
  (dashboard)/
    layout.tsx               sidebar shell shared by every page below
    dashboard/page.tsx        overview, stats
    library/page.tsx          content list (detail/edit pages come later)
    generate/page.tsx         blog / newsletter / video entry points
    settings/page.tsx         connection status, model picker
  page.tsx                    redirects "/" → "/dashboard"
  api/
    generate/text/            route handler → OpenRouter (not built yet)
    generate/video/           route handler → kicks off a Higgsfield job (not built yet)
    generate/video/status/[jobId]/   route handler → polls job status (not built yet)
components/
  app-sidebar.tsx             sidebar shell: flat nav, no dropdowns (see SPEC §1)
  nav-main.tsx                flat nav links with active-state highlighting
  nav-user.tsx                sidebar footer, plain link to Settings — no dropdown
  site-header.tsx             per-page header/title bar
  ui/                         shadcn components only (hard rule, §8)
lib/
  ai/openrouter.ts            OpenRouter client wrapper (not built yet)
  ai/higgsfield.ts            Higgsfield client wrapper (not built yet)
  db/                         Prisma client + queries (not built yet)
prisma/schema.prisma          data model (not built yet)
```

## 4. Data model (v1, kept minimal)

- **ContentItem** — id, type (`blog` | `newsletter` | `video`), title, body/text, videoUrl, status (`draft` | `processing` | `ready` | `published` | `archived`), createdAt, publishedAt, manual stat fields (views, opens — nullable, user-entered).
- **VideoJob** — id, contentItemId, provider job id, status, createdAt, completedAt.

## 5. Why video needs special handling

Text generation (OpenRouter) responds in seconds — a normal request/response works fine. Video generation takes minutes, and a Vercel server function can't stay busy waiting that long. So video runs as a job:

1. User clicks **Generate Video** → the app asks Higgsfield to start, gets back a job ID, saves the content item as `processing`.
2. The browser checks back every few seconds via the status endpoint.
3. When Higgsfield reports done, the app saves the resulting video link and marks the item `ready`.

## 6. API keys & secrets

v1 is single-user, so API keys (OpenRouter, Higgsfield, database URL) live as Vercel environment variables — never typed into the app's UI, never stored in the database. The Settings page only shows whether each one is connected (configured / not configured). If this ever becomes multi-user (per the fork-it-yourself goal in the PRD), per-user encrypted key storage would need to be built then — not needed now.

## 7. Design principles (for forkability)

- Clear separation: `lib/ai/*` for provider calls, `lib/db/*` for data access, `app/*` for routes/pages — someone forking this should be able to find "where AI calls happen" in one place.
- No deeply hard-coded single-user assumptions in the data model — but also no multi-user system built. Just don't make the next step painful.
- Config via environment variables, documented in `.env.example` once the app scaffold exists.

## 8. UI standard — hard rule

Every component in this dashboard must be a **shadcn/ui** component: either installed as-is from the shadcn registry (`npx shadcn@latest add <component>`), or built by composing other shadcn primitives. No other component library, no hand-rolled component that duplicates something shadcn already provides. This keeps the whole dashboard visually and structurally consistent, and keeps it easy for someone forking this later to recognize and extend.

- Starting point: the `sidebar-07` block (`npx shadcn@latest add sidebar-07`), which provides the dashboard shell (sidebar, breadcrumb, team switcher, nav).
- New UI needs → check the shadcn registry first (`npx shadcn@latest add <name>`) before building anything custom.
- Installed components live in `components/ui/`; app-specific compositions (e.g. `app-sidebar.tsx`, `nav-main.tsx`) live in `components/`.
- **Theme:** [tweakcn "Caffeine"](https://tweakcn.com/r/themes/caffeine.json), applied via `npx shadcn@latest add https://tweakcn.com/r/themes/caffeine.json`. Warm neutral background, brown/tan primary & secondary, full light + dark variants, with matching radius/shadow/letter-spacing tokens — all defined in `app/globals.css`. Re-run that same command if the theme ever needs reapplying after a shadcn component update overwrites it.

## 9. Deployment

- GitHub repo → Vercel project, auto-deploy on push to `main`.
- Database and env vars configured in Vercel project settings (not committed to the repo).
