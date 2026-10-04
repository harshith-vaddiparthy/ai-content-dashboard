# AGENTS.md — AI Content Dashboard

This file is project-specific and takes precedence over any global `AGENTS.md` elsewhere on this machine (e.g. a Task Master AI guide at `~/AGENTS.md` from unrelated projects). **This project does not use Task Master AI** — specs are plain markdown in `docs/`.

## What this project is

A single-user web dashboard for generating blog posts, newsletters, and real video content with AI, managing it all in one library, and tracking basic performance stats. Built clean enough to be forkable by other solo builders later. Goals/why: [docs/PRD.md](docs/PRD.md). Exact screens/flows/behavior: [docs/SPEC.md](docs/SPEC.md). System design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

**Keep the docs in step with the code.** When a screen, flow or rule changes, update `docs/SPEC.md` (and `docs/ARCHITECTURE.md` if the plumbing changed) in the same piece of work.

## Stack at a glance

- Next.js 16 (App Router) + React 19 + TypeScript — single app, not a monorepo; npm
- UI: **shadcn/ui only — hard rule, see Conventions below** (`base-nova` style on Base UI, tweakcn "Caffeine" theme)
- Icons: HugeIcons (`@hugeicons/react` + `@hugeicons/core-free-icons`)
- Data: **sample mode for now** — an in-memory store in `lib/db/content.ts`, seeded with sample content. Postgres via Prisma comes later
- AI: OpenRouter (text generation, built), Higgsfield (video generation, not built yet) — both server-side only, via `lib/ai/*`
- Hosting: Vercel · Source: GitHub

## Commands

```bash
npm run dev                            # local dev server on http://localhost:3000
npm run build                          # production build
npm run start                          # run the production build
npm run lint                           # ESLint (includes the React Compiler rules)
npx next typegen && npx tsc --noEmit   # type-check (typegen creates the route types first)
```

There's no Prettier; match the surrounding formatting. Once the database lands: `npx prisma studio` (browse it) and `npx prisma migrate dev` (apply schema changes).

## Conventions

- **Hard rule — use the shadcn skill first.** Before any work on the dashboard's UI (adding, changing, fixing or reviewing a screen or component), first load and follow the **shadcn skill** (`.claude/skills/shadcn/SKILL.md`, invoked as `/shadcn`). Its rules decide which component to use and how to compose it. Run `npx shadcn@latest docs <component>` and read the docs before using a component; search the registry (`npx shadcn@latest search`) before writing custom markup. No UI work starts without it.
- **Hard rule — UI is shadcn/ui only.** Every component must come from the shadcn registry (`npx shadcn@latest add <name>`) or be composed from shadcn primitives already in `components/ui/`. Never add another component library, never hand-roll a component that shadcn already provides. Check the registry before building anything custom.
- **Navigation is flat.** No dropdown menus, no collapsible or nested sidebar groups — every sidebar entry is one click to its page. Avoid dropdowns for choices too (no Select): short option lists use `ChoiceGroup` (`components/choice-group.tsx`) or Radio Group choice cards.
- **Icons are HugeIcons:** `<HugeiconsIcon icon={SomeIcon} strokeWidth={2} />`, with `data-icon="inline-start"` or `"inline-end"` when inside a button. No other icon set.
- **Use the theme to the fullest.** Colors come from the Caffeine tokens (`primary`, `secondary`, `muted`, `chart-1`…`chart-5`), never hard-coded values. Recurring patterns: headline cards use `bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card`; icon tiles use `bg-primary/10 text-primary`.
- All calls to OpenRouter/Higgsfield live in `lib/ai/*` and run only on the server: route handlers under `app/api/**`, plus the read-only key check on the Settings page (a server component). Never call them from client components; never let an API key reach the browser.
- Secrets live in environment variables (listed in `.env.example`) — never commit real keys, never store them in the database in v1, never add a field for typing them into the UI.
- **All content reads and writes go through `lib/db/content.ts`.** Changes go through the server actions in `app/actions/*`, which check their input and refresh every page. Moving to Postgres should only mean rewriting `lib/db/content.ts`.
- **Sample mode must keep working** with no keys and no database: the AI route falls back to `lib/ai/sample-draft.ts`, and the library to the in-memory store.
- Pages are server components; add `"use client"` only where there's interaction. Format dates and numbers on the server with `lib/format.ts` (US English), then pass plain strings to client components.
- Copy is plain, friendly and specific. Errors say what happened and what to do next — never a raw error or stack trace.
- Keep code modular and documented at the architecture level — this project is meant to be forkable by other solo builders eventually (see `docs/PRD.md` §3), so avoid cramming unrelated logic together.
- Don't hand-edit `prisma/schema.prisma` (once it exists) without running a migration afterward (`npx prisma migrate dev`).
- Don't add multi-user auth, billing, or external analytics integrations — explicitly out of scope for v1 per the PRD.

## Gotchas (each of these has bitten us once)

- **Base UI, not Radix.** Use the `render` prop, not `asChild`. A Button rendering a link needs `nativeButton={false}`: `<Button nativeButton={false} render={<Link href="/x" />}>`.
- **Check an icon's shape before using it.** HugeIcons names can mislead: `RotateLeft01Icon` is a hand gesture, not an arrow (use `Undo02Icon` for undo).
- **InputGroup grays out entirely if any child is disabled** (`has-disabled`), so never put a disabled button inside one. Hide the button, or show `InputGroupText` instead.
- **ItemGroup is a list** (`role="list"`), so wrap each `Item` in `<div role="listitem">`.
- **Radio choice cards:** `<FieldLabel htmlFor>` › `<Field orientation="horizontal">` › `FieldContent` + `<RadioGroupItem id>`. Base UI puts the `id` on its hidden input, so the label works. A "Blocked aria-hidden…" console warning on click is harmless.
- **`TypeIcon`:** pass `decorative` when the type is already written next to it, so screen readers don't say it twice.
- **Chat UI uses the shadcn chat components:** `MessageScroller` (handles scrolling and following a streaming reply), `Message` and `Bubble`. Never hand-roll bubbles or a scroll container. See `components/agent/agent-sidebar.tsx`.
- **Unsaved work:** wrap it in `<LeaveGuard when={dirty} description="…" />`, so links inside the app and closing the tab ask first.
- **React Compiler lint rules apply** (even though the compiler is off): no `Date.now()` or `new Date()` during render — use `getNow()` from `lib/db/content.ts` on the server; and no setState inside `useEffect` — use `useMounted()` (`hooks/use-mounted.ts`) or `useSyncExternalStore` for browser-only values.
- **Route types:** `params` is a Promise; use the global `PageProps<"/library/[id]">` type. Run `npx next typegen` before `tsc`, or those types won't exist.
- **Container queries, not screen sizes,** inside the page area: layouts use `@container/main` (`@3xl/main` = 768px, `@4xl/main` = 896px, `@5xl/main` = 1024px), and option grids inside forms use `@container/field-group` (e.g. `@xs/field-group:flex`).
- **Not-found titles:** set `metadata = { title: "Not found" }` on both the `not-found.tsx` and the page that calls `notFound()` (or return it from `generateMetadata`); otherwise the browser tab shows the wrong title after the page loads.
- **Dev-only noise:** a "negative time stamp" `performance.measure` error on 404 pages is a React development bug, not ours. It doesn't happen in production builds.
- **`server-only`:** keep `import "server-only"` at the top of server-only files in `lib/`. Next.js provides it, so don't add the npm package.

## Where to look first

- Product scope & decisions → `docs/PRD.md`
- Exact screens, flows, states, acceptance criteria → `docs/SPEC.md`
- System design, data model & folder map → `docs/ARCHITECTURE.md`
