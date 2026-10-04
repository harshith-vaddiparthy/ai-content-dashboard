# Architecture — AI Content Dashboard

See `docs/PRD.md` for what we're building and why, and `docs/SPEC.md` for exactly how each screen behaves. This doc covers how it's put together.

## 1. Shape of the system

One Next.js app (App Router, TypeScript). No monorepo, no separate backend service: Next.js's own route handlers and server actions act as the backend. Deployed on Vercel; source on GitHub.

Why: nothing in the PRD needs more than one app. A single project is simpler to build, deploy, and reason about than a multi-package setup, with no feature lost at this scope.

**Sample mode.** Until keys and a database are added, the app runs on its own: drafts are templates built from the brief, and the library is sample content kept in the server's memory. Every screen works, so the app can be tried (or forked) with zero setup. See SPEC §8.

## 2. Tech stack

| Piece | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | single app; npm |
| UI | **shadcn/ui** (hard rule, see §8) | `base-nova` style, built on Base UI; installed via the `shadcn` CLI into `components/ui/` |
| Icons | HugeIcons (`@hugeicons/react` + `@hugeicons/core-free-icons`) | set as the icon library in `components.json`, so new shadcn components arrive with HugeIcons |
| Styling | Tailwind CSS v4 + the tweakcn "Caffeine" theme | theme tokens in `app/globals.css` |
| Charts | Recharts, through shadcn's Chart component | dashboard charts |
| Light/dark | next-themes | Light, Dark or Automatic |
| Messages | Sonner, through shadcn's Sonner component | the short confirmations in the corner |
| Database | **Now:** an in-memory store in `lib/db/content.ts`, seeded with sample content. **Planned:** Postgres via Vercel's Neon integration | the connection string arrives as `DATABASE_URL` |
| ORM | Prisma (planned, arrives with the database) | schema + type-safe queries |
| Text AI | OpenRouter API | server-side only, streamed |
| Video AI | Higgsfield API | server-side only (not built yet) |
| Hosting | Vercel | project `ai-content-dashboard`; auto-deploys on push to `main` |
| Source control | GitHub | `harshith-vaddiparthy/ai-content-dashboard` |

**On Higgsfield MCP vs. the Higgsfield API:** these are two different things. MCP is a tool that lets an AI coding assistant (like the one helping build this) call Higgsfield while developing and testing. The live app itself — what real users run — calls Higgsfield's regular REST API with an API key. MCP is a dev-time convenience; it is not part of what ships to users.

## 3. Folder structure

```
app/
  layout.tsx                    root: theme, tooltips, toasts
  page.tsx                      sends "/" to "/dashboard"
  globals.css                   Tailwind + the Caffeine theme tokens
  (dashboard)/
    layout.tsx                  sidebar + top bar around every page below
    dashboard/page.tsx          headline cards and charts (SPEC §2)
    generate/page.tsx           pick what to make (SPEC §3a)
    generate/[type]/page.tsx    brief, then draft, then save (SPEC §3b, §3c)
    library/page.tsx            the library (SPEC §4)
    library/[id]/page.tsx       one piece: editor, status, performance (SPEC §5)
    library/[id]/not-found.tsx  "This piece isn't here"
    settings/page.tsx           connections, writing model, appearance (SPEC §6)
    not-found.tsx               "This page isn't here"
    [...missing]/page.tsx       catches unknown addresses, so they get the not-found page inside the app
  actions/
    content.ts                  server actions: create, edit, status, stats, delete, reset
    settings.ts                 server action: remember the writing model
  api/
    generate/text/route.ts      streams a draft from OpenRouter, or a sample draft
    generate/video/…            starts a Higgsfield job and reports its progress (not built yet)
components/
  ui/                           shadcn components only (hard rule, §8)
  app-sidebar.tsx               the flat sidebar (SPEC §1)
  nav-main.tsx                  sidebar links, with the current page highlighted
  site-header.tsx               top bar: breadcrumbs, "Sample data" badge, theme toggle
  page-header.tsx               the title and description at the top of each page
  choice-group.tsx              pick-one buttons, used instead of dropdowns
  content-badges.tsx            type and status badges and icons
  leave-guard.tsx               "Leave without saving?" for unsaved work
  theme-provider.tsx            next-themes setup
  theme-toggle.tsx              the light/dark button in the top bar
  dashboard/                    headline cards and charts
  generate/                     brief card, draft card, and the form that joins them
  library/                      library table, editor, status, performance, video, delete
  settings/                     connections, writing model, appearance, sample content
hooks/
  use-draft-stream.ts           sends a brief and streams the draft back
  use-mounted.ts                true once the page is running in the browser
  use-mobile.ts                 whether the screen is phone-sized
lib/
  ai/models.ts                  the six writing models and the default
  ai/prompts.ts                 the instructions sent to the model (tune the writing voice here)
  ai/openrouter.ts              the only place the app talks to OpenRouter
  ai/sample-draft.ts            sample-mode drafts, built from the brief
  content/types.ts              ContentItem, content types and statuses
  content/config.ts             labels, icons and descriptions for each type and status
  content/brief.ts              brief options (tone, length, video style…) and checking a brief
  content/stats.ts              dashboard numbers, worked out from the library
  content/rows.ts               library table rows, with dates already turned into text
  content/text.ts               word counts, reading time, the video format line
  content/sample-data.ts        the sample library
  db/content.ts                 every read and write of content (in memory for now)
  integrations.ts               which services have a key set
  preferences.ts                the writing model saved in a cookie
  format.ts                     numbers and dates, always in US English
  clipboard.ts                  copy text, or a piece as Markdown
  site.ts                       app name and copy, in one place for rebranding
  utils.ts                      cn() for joining class names
docs/                           PRD, SPEC, ARCHITECTURE
.env.example                    the three settings the app reads
```

## 4. Data model (v1, kept minimal)

- **ContentItem**: id, type (`blog` | `newsletter` | `video`), title, body (Markdown; for videos, the concept and script), model (the OpenRouter model that wrote it, or null), videoUrl, status (`draft` | `processing` | `ready` | `published` | `archived` | `failed`), createdAt, updatedAt, publishedAt, and manual stat fields (views, opens: nullable, entered by hand). Defined in `lib/content/types.ts`.
  - Publishing records `publishedAt` the first time. Moving back to draft or ready clears it; archiving keeps it.
  - Entering stats doesn't change `updatedAt`, so "last updated" means the last real edit.
  - `processing` and `failed` are only ever set by the video renderer.
- **VideoJob** (planned, arrives with Higgsfield): id, contentItemId, provider job id, status, createdAt, completedAt.
- **Writing model**: not in the data model. It's a one-year cookie (`writing_model`) on the browser, since v1 has one user.

Every read and write goes through `lib/db/content.ts`. Moving to Postgres means rewriting that one file (and flipping `USING_SAMPLE_DATA` to false); no page or component needs to change.

## 5. How content gets generated

### Text (built)

Text comes back in seconds, so it streams in a single request:

1. The brief form posts the brief as JSON to `/api/generate/text`.
2. The route checks the brief (`parseBrief` in `lib/content/brief.ts`), builds the instructions (`lib/ai/prompts.ts`), and asks OpenRouter to stream a draft (`lib/ai/openrouter.ts`) using the writing model from the cookie. Without a key, it streams a sample draft instead. The `X-Draft-Source` header says which.
3. The browser reads the stream (`hooks/use-draft-stream.ts`) and shows the words as they arrive. **Stop** cancels the request and keeps what arrived.
4. Errors come back as JSON (`{ "error": "..." }`) holding a sentence a person can act on, such as "Your OpenRouter account is out of credits." The raw provider error is only logged on the server.
5. **Save** calls `createContentAction`, which checks the input, stores the piece as a draft, and refreshes every page.

### Video (planned): why it needs special handling

Video generation takes minutes, and a Vercel server function can't stay busy waiting that long. So video will run as a job:

1. The user approves a saved concept → the app asks Higgsfield to start, gets back a job ID, and saves the content item as `processing`.
2. The browser checks back every few seconds via a status endpoint.
3. When Higgsfield reports done, the app saves the video link and marks the item `ready`. If it fails, the item becomes `failed`.

## 6. API keys & secrets

v1 is single-user, so API keys (OpenRouter, Higgsfield, database URL) live as Vercel environment variables, or in `.env.local` on your own computer. They're never typed into the app's UI and never stored in the database. The Settings page shows whether each one is set, and checks the OpenRouter key with OpenRouter, on the server, without running a model. If this ever becomes multi-user (per the fork-it-yourself goal in the PRD), per-user encrypted key storage would need to be built then. It's not needed now.

## 7. Design principles (for forkability)

- Clear separation: `lib/ai/*` for provider calls, `lib/db/*` for data access, `app/actions/*` for changes, `app/*` for routes and pages. Someone forking this can find "where AI calls happen" in one place.
- Pages are server components by default. Client components (`"use client"`) are only used where there's interaction.
- Every change goes through a server action that checks its input (never trust the browser), makes the change, and refreshes every page, so counts and lists stay in sync.
- Dates and numbers are formatted on the server in US English (`lib/format.ts`), so the server and the browser always show the same text.
- App name and copy live in `lib/site.ts`, so a fork can rebrand quickly.
- No deeply hard-coded single-user assumptions in the data model, but also no multi-user system built. Just don't make the next step painful.
- Config via environment variables, listed in `.env.example`.

## 8. UI standard — hard rule

Every component in this dashboard must be a **shadcn/ui** component: either installed as-is from the shadcn registry (`npx shadcn@latest add <component>`), or built by composing other shadcn primitives. No other component library, no hand-rolled component that duplicates something shadcn already provides. This keeps the whole dashboard visually and structurally consistent, and keeps it easy for someone forking this later to recognize and extend.

- **Starting point:** the `sidebar-07` block (`npx shadcn@latest add sidebar-07`), with its collapsible groups, team switcher and user menu removed. Navigation is flat (SPEC §1).
- **No dropdowns** for navigation or choices. Short lists of options are buttons (`components/choice-group.tsx`, built on Toggle Group) or choice cards (Radio Group inside Field labels).
- **Base UI underneath:** the `base-nova` components are built on Base UI, so they use a `render` prop where Radix-based shadcn uses `asChild`. A Button that renders a link also needs `nativeButton={false}`.
- **Small local changes to `components/ui/`:** `badge`, `breadcrumb` and `item` start with `"use client"`, because they use Base UI hooks and server pages import them. Keep that line if one of them is re-added from the registry. The components import `cn` from shadcn's `cn` package; `lib/utils.ts` re-exports it.
- New UI needs → check the shadcn registry first (`npx shadcn@latest add <name>`) before building anything custom.
- Installed components live in `components/ui/`; app-specific compositions (e.g. `app-sidebar.tsx`, `nav-main.tsx`) live in `components/`.
- **Theme:** [tweakcn "Caffeine"](https://tweakcn.com/r/themes/caffeine.json), applied via `npx shadcn@latest add https://tweakcn.com/r/themes/caffeine.json`. Warm neutral background, brown/tan primary & secondary, full light + dark variants, with matching radius/shadow/letter-spacing tokens — all defined in `app/globals.css`. Re-run that same command if the theme ever needs reapplying after a shadcn component update overwrites it. Use the theme's tokens (`primary`, `secondary`, `muted`, `chart-1`…`chart-5`) rather than fixed colors.

## 9. Deployment

- GitHub repo → Vercel project, auto-deploy on push to `main`.
- Keys and the database are configured in Vercel project settings (never committed to the repo). With none set, the deployed app runs in sample mode.
- Sample mode keeps the library in the server's memory. On Vercel that memory doesn't last: servers start and stop on their own, and each keeps its own copy, so edits made there can vanish. A real database fixes that.
