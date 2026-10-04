# Product Requirements Document — AI Content Dashboard

## 1. Overview

A web dashboard where one creator generates long-form written content (blog posts, newsletters) and real generated video using AI, manages everything in a single library, and tracks basic performance stats. Built as a clean, well-documented foundation that other solo consultants/builders can eventually fork and build their own monetizable product on top of.

## 2. Goals

- Go from idea → published blog post, newsletter, or video without leaving the dashboard.
- Keep the codebase clean and documented enough that another solo builder could fork it and understand it within an hour.
- Ship a working v1 fast; defer anything not needed to prove the core loop.

## 3. Target Users

- **Primary (v1):** the creator — single user, no login/accounts needed yet.
- **Future (not v1):** solo consultants/builders who fork this codebase to launch their own branded product and add features they monetize themselves. V1 should not make this harder (clean structure, documented, no assumptions that only make sense for exactly one hardcoded person) — but v1 does **not** build multi-tenancy, billing, or team features. That's for whoever forks it later.

## 4. Core Features (v1)

### 4.1 Content Generation

- **Blog posts** — long-form article generation from a prompt/topic, via OpenRouter (model selectable).
- **Newsletters** — structured long-form content formatted for email, via OpenRouter.
- **Video** — real generated video, not just a script. Two-step pipeline:
  1. OpenRouter drafts the concept/script/shot list.
  2. User reviews/edits that draft.
  3. Higgsfield turns the approved draft into the actual video.
  
  (Review step exists because real video generation is slower and costs more than text — worth catching mistakes before rendering.)

### 4.2 Content Library

- One place listing everything generated: type, title, status (`draft` / `processing` / `ready` / `published` / `archived`, plus `failed` for a video that didn't render), created date.
- Open an item to view/edit its text, or view/replace its generated video.
- Filter by type and status.

### 4.3 Performance Tracking (v1 — intentionally simple)

- Dashboard overview: headline numbers (created, published, views, newsletter opens), weekly activity, the content mix, what's still in the works, top performers and recent activity. All worked out from the library itself.
- Per item: a "mark as published" action with a published date, plus optional manual stat fields (e.g. views, opens) the user fills in themselves.
- **Explicitly not in v1:** pulling live stats from social platforms, email providers, or video platforms — there's nothing to connect to yet. This is a deliberate phase-2 item once real publishing destinations exist.

### 4.4 Settings

- Shows connection status for OpenRouter and Higgsfield (configured via environment variables, not typed into the UI — keeps API keys off the client and out of the database in v1).
- Writing model choice for text generation (see §7 for the default).
- Works before anything is connected: a **sample mode** with sample drafts and a sample library, so the whole app can be tried first.

## 5. Out of Scope (v1)

- User accounts, multi-user, teams, permissions
- Billing/monetization infrastructure (left for people who fork this later)
- Real analytics or social-platform integrations
- Scheduled/automatic publishing to external platforms
- Localization / non-English content

## 6. Success Criteria

- Can generate a blog post, a newsletter, and a video end-to-end from the dashboard.
- Everything generated is visible, organized, and editable in the Content Library.
- Someone unfamiliar with the project could read `docs/ARCHITECTURE.md` and `AGENTS.md` and understand how to extend it within an hour.

## 7. Open Questions / Future Phases

- ~~Which specific OpenRouter model(s) to default to.~~ **Decided:** Claude Sonnet 5.5 is the default. Settings offers six models to switch between: Claude Sonnet 5.5, Claude Opus 5.5, Claude Fable 5.1, GPT-6.1 Sol, Gemini 3.8 Flash and DeepSeek V4.1 Flash.
- Phase 2 candidates: real analytics integrations, scheduled publishing, multi-user support if the fork-it-yourself vision takes off.

## 8. UI standard

**shadcn/ui, exclusively.** Every component in the product is either installed from the shadcn registry or composed from shadcn primitives — no other component library. This keeps the dashboard visually consistent and easy for a future forker to recognize and extend. See `docs/ARCHITECTURE.md` §8 for the technical detail.
