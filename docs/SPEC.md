# Functional Spec — AI Content Dashboard

This turns the goals in `docs/PRD.md` into exact, buildable detail: every screen, every flow, every state. Use this doc when building or reviewing any feature. For *why* we're building it, see `docs/PRD.md`; for the tech plumbing underneath, see `docs/ARCHITECTURE.md`.

## 1. Pages & navigation

- Dashboard / Overview — `/dashboard`
- Content Library — `/library`
- Generate (blog / newsletter / video) — `/generate`
- Content Detail / Editor
- Settings — `/settings`

**Sidebar is flat — no dropdowns, no collapsible/nested nav.** Four direct links (Dashboard, Content Library, Generate, Settings), each a single click to its page. No team switcher, no "Projects" section, no account dropdown menu in the footer — the user avatar/name in the sidebar footer is itself a plain link straight to Settings. This was an explicit correction from the shadcn `sidebar-07` starting point, which has collapsible nav groups (Playground/Models/Documentation) and a team-switcher dropdown — both removed.

## 2. Dashboard / Overview

- Shows: counts of content by type and status, a recent-activity list (last N items generated or published).
- Empty state (no content yet): a prompt pointing to the Generate flows.
- Actions: links into Generate and into the Library.

## 3. Generate flow

### 3a. Generate Blog Post

1. User enters a topic/prompt (optional tone/length controls).
2. Clicks **Generate** → loading state → OpenRouter returns a draft.
3. Draft appears in an editable text area; user can edit, regenerate, or save.
4. **Save** → creates a Content Item, type `blog`, status `draft` → opens Content Detail.

### 3b. Generate Newsletter

Same flow as the blog post, but the output is formatted for email (subject line + body sections). Fields: topic/prompt, optional audience/tone. Save → Content Item, type `newsletter`, status `draft`.

### 3c. Generate Video

1. User enters a topic/brief for the video.
2. **Generate Concept** → OpenRouter drafts a script/shot list → shown as editable text.
3. User reviews/edits the concept, then clicks **Approve & Render Video**.
4. App sends the approved concept to Higgsfield, creates a Video Job, sets the Content Item status to `processing`, and shows a progress indicator — rendering takes minutes, not seconds.
5. When Higgsfield finishes, the app shows an in-app status change (badge updates) and the rendered video becomes viewable in Content Detail; status → `ready`.
6. **If generation fails:** status reverts (or moves to a `failed` state) with a plain-language error message and a retry button — never a raw error dump.

## 4. Content Library

- A list of every Content Item: title, type (badge/icon), status (badge), created date.
- Filters: by type (blog / newsletter / video) and by status.
- Clicking an item opens Content Detail.
- Empty state: "No content yet — generate your first piece," linking to Generate.

## 5. Content Detail / Editor

- Shows the full content: editable text for blog/newsletter, or a video player for video.
- Shows status badge, created date, and published date (once published).
- Actions available:
  - Edit text and save.
  - **Mark as Published** → sets status to `published` and records the publish date.
  - Manual stat fields (e.g. views, opens) — plain number inputs, optional, save on blur.
  - **Archive** (soft-hide — item still exists, still visible in Library when filtered to "archived").
  - **Delete** (behind a confirmation dialog).

## 6. Settings

- Connection-status cards for OpenRouter and Higgsfield: shows **Connected** if the key is configured and a lightweight test call succeeds, otherwise **Not connected** with a note to add the key in the Vercel project's environment variables.
- No key-entry fields live in this UI — see `docs/ARCHITECTURE.md` §6 for why.
- Default model dropdown for text generation.

## 7. States & feedback (apply everywhere, not just one page)

- **Loading:** every AI call shows a visible spinner or skeleton — nothing happens instantly.
- **Error:** a plain-language message plus a retry action. Never show a raw stack trace or API error to the user.
- **Empty:** every list that can be empty gets a friendly empty state with a clear next action, not a blank page.

## 8. Acceptance criteria (how we know v1 is actually done)

- [ ] Can generate, save, and view a blog post end-to-end.
- [ ] Can generate, save, and view a newsletter end-to-end.
- [ ] Can generate a video concept, approve it, and get back a real rendered video end-to-end.
- [ ] All generated content shows up in the Library and can be filtered by type/status.
- [ ] Can mark an item as published and enter manual stat fields.
- [ ] Settings page correctly reflects whether OpenRouter and Higgsfield are configured.
