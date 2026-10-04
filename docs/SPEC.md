# Functional Spec — AI Content Dashboard

This turns the goals in `docs/PRD.md` into exact, buildable detail: every screen, every flow, every state. Use this doc when building or reviewing any feature. For *why* we're building it, see `docs/PRD.md`; for the tech plumbing underneath, see `docs/ARCHITECTURE.md`.

**Where things stand (October 2026):** every screen below is built. Until OpenRouter and a database are connected, the app runs in **sample mode** (§8). Drafts are templates built from your brief, and the library is sample content kept in memory. Turning a video concept into a real video waits on Higgsfield (§3c).

## 1. Pages & navigation

| Page | Address | What it's for |
|---|---|---|
| Dashboard | `/dashboard` | How your content is doing |
| Library | `/library` | Everything you've made, with tabs, filters and search |
| Content detail | `/library/[id]` | Read, edit, publish and track one piece |
| Generate | `/generate` | Pick what to make |
| New blog post / newsletter / video | `/generate/blog`, `/generate/newsletter`, `/generate/video` | Brief, then draft, then save |
| Settings | `/settings` | Connections, writing model, appearance |

Opening `/` goes straight to the Dashboard.

**The sidebar is flat: no dropdowns, no collapsible or nested groups.** Every entry is one click to its page. From top to bottom:

1. **App name**: "AI Content Dashboard" with "Personal workspace" underneath. Goes to the Dashboard.
2. **Generate content**: the main button, filled with the theme's primary color. Goes to `/generate`.
3. **Dashboard** and **Library**. Library shows a count of everything that isn't archived.
4. **Create**: a labeled group with direct links to Blog post, Newsletter and Video.
5. **Settings**, pinned to the bottom.
6. **Footer**: in sample mode, a small "Sample mode" card with a **Connect OpenRouter** button that opens Settings at Connections. Once connected, it shows which model writes your drafts, linking to Settings at Writing model.

The sidebar collapses to icons with tooltips, and opens as a slide-over panel on phones. There's no team switcher, no account menu and no avatar, because v1 is single-user. This replaced the shadcn `sidebar-07` starting point; its collapsible groups and dropdown menus were removed on purpose.

**Top bar:** a button that collapses the sidebar, breadcrumbs (e.g. Library › Details), a "Sample data" badge while in sample mode, and a light/dark toggle.

## 2. Dashboard

Answers "how is my content doing?" at a glance. Every number is worked out from the library.

- **Four headline cards:**
  - **Pieces created**: in the last 30 days, compared with the 30 days before, plus how many are in the library.
  - **Pieces published**: in the last 30 days, compared with the 30 days before, plus how many are live in total.
  - **Total views**: across published posts and videos, with the average per piece and your best piece.
  - **Newsletter opens**: the average per issue, and whether it's rising, steady or dipping over your last 3 issues.
- **Activity**: a chart of what you created or published each week over the last 26 weeks. A Created/Published switch picks which.
- **Content mix**: what's in the library right now, by type.
- **In the works**: pieces not published yet (drafts, rendering, ready and failed).
- **Top performers**: ranked by views, or opens for newsletters, with a tab per type.
- **Recently updated**: the six pieces you worked on last.
- **Empty state:** "Nothing to measure yet", with a **Generate your first piece** button.

## 3. Generate

### 3a. The Generate page (`/generate`)

- **A notice at the top.** In sample mode: "You're in sample mode", with **Connect** (opens Settings at Connections). Once connected: which model is writing and roughly what a draft costs, with **Change** (opens Settings at Writing model).
- **Three cards**: Blog post, Newsletter and Video, each saying what you'll get. The video card says plainly that turning the plan into a video file is coming soon.
- **How it works**: three numbered steps. Fill in a short brief, watch it being written, edit, then save.
- **Pick up where you left off**: up to four unfinished drafts, with **See all** (the Drafts tab of the library) when there are more.

### 3b. Writing a blog post or newsletter (`/generate/blog`, `/generate/newsletter`)

The page has two cards side by side: the **Brief** and the **Draft**.

1. **Fill in the brief.** Only the first question is required.
   - What's it about? (required, up to 500 characters)
   - Who's it for? (optional; left blank, it writes for solo consultants and builders)
   - Tone: Friendly, Professional, Bold or Witty
   - Length: Short, Medium or Long
   - Anything else? (optional: points to include, a story to tell or a link to mention)
2. **Write draft** (or ⌘/Ctrl + Enter). The brief locks, and the draft appears word by word with a live word count. **Stop** ends it early and keeps what's written so far.
3. **Edit the draft.** The title (Subject line for newsletters) and the body, written in Markdown. **Copy** puts it on the clipboard as Markdown. The footer shows the word count and minutes to read.
4. **Write again** replaces the draft with a new one from the same brief. An **Undo** message brings the previous draft back.
5. **Save to library** saves it as a `draft` and opens its detail page. Nothing is saved before this.
6. **Leaving with an unsaved draft asks first:** "Leave without saving?", with **Keep editing** or **Leave**. Closing or reloading the tab brings up the browser's own warning.
7. **If writing fails**, the Draft card says "Couldn't write the post" (or newsletter, or concept) with the reason in plain words, and **Try again**.

### 3c. Planning a video (`/generate/video`)

The same flow as 3b, with video choices in place of Length:

- Style: Presenter, Cinematic or Animated
- Shape: Vertical, Landscape or Square
- Length: 15, 30 or 60 seconds

**Write concept** drafts a title and a script: the hook, each scene, the voiceover and a call to action. **Save concept** saves it as a `draft` video. Until Higgsfield is connected, the draft says "Making the video file is coming soon", and the saved concept works with any video tool.

**Rendering (not built yet; needs Higgsfield):**

1. From a saved concept, **Approve & render** sends it to Higgsfield. The status becomes `processing` (shown as "Rendering"), with progress shown, since it takes minutes, not seconds.
2. When Higgsfield finishes, the video plays on the detail page and the status becomes `ready`.
3. If it fails, the status becomes `failed`, with a plain-language message and a retry. Never a raw error.

## 4. Library (`/library`)

- **Tabs by status**: All, Drafts, Ready, Published and Archived, each with a count. Rendering and Failed tabs appear only when something has that status. "All" leaves out archived pieces; they have their own tab.
- **Type filter**: All, Blog posts, Newsletters and Videos, always visible (no dropdown). On narrow screens the type buttons show just their icons.
- **Search** by title, with a button to clear it.
- **Table**: the title (with its type and created date underneath), status, reach (views, or opens for newsletters) and when it was last updated. What you worked on last is on top. Clicking anywhere on a row opens the piece.
- **Ten per page**, with previous and next buttons and a line like "Showing 1–10 of 40 pieces".
- The tab, type, search and page are kept in the address (e.g. `/library?status=ready`), so links and refreshes keep them. Clicking Library in the sidebar starts fresh.
- **Empty states**: "No content yet", with **Generate your first piece**; "No matches", with **Clear search and filter**; and one for each empty tab (e.g. "Everything is archived", "Nothing archived").

## 5. Content detail (`/library/[id]`)

The main column holds the video and the editor; a narrower side column holds status, performance and details.

- **Header**: the title, type and status badges, when it was last updated, and **Delete**.
- **Video** (videos only): the player once there's a video file. Until then it says why there isn't one (rendering, failed, or Higgsfield not connected yet), drawn in the shape the concept asks for.
- **Editor**: the title (Subject line for newsletters) and the body in Markdown, with **Copy**, **Discard** and **Save**. Saving confirms with "Changes saved". Leaving with unsaved edits asks first.
- **Status**: choose Draft, Ready, Published or Archived, and it saves straight away. Publishing records the publish date; moving back to Draft or Ready clears it. Rendering and Failed are set only by the video renderer, and a video can't be published until it has rendered.
- **Performance**: type in the views (opens for newsletters), copied from wherever the piece is live. Whole numbers only. It saves when you press Enter or click away, and compares the number with your average for that type, e.g. "12% above your average blog post".
- **Details**: type, created, last edited, published, and written by (the AI model, or "You").
- **Delete**: asks first ("Delete this blog post?", **Delete for good**), then goes back to the library. Archiving is the gentle option; deleting can't be undone.
- **A piece that doesn't exist** shows "This piece isn't here", with a way back to the library.

## 6. Settings (`/settings`)

On wide screens, Connections and Writing model sit on the left, and Appearance and Sample content on the right.

- **Connections**: OpenRouter (writes the text), Higgsfield (makes the video) and Database (keeps the library between restarts).
  - **OpenRouter, not connected**: three numbered steps. Create a key on OpenRouter (**Get a key** opens their site), add it where the app runs (the setting name `OPENROUTER_API_KEY`, with a copy button), then restart the app.
  - **OpenRouter, connected**: the app checks the key with OpenRouter and shows **Connected** (with **See spending**), **Key not accepted** (with **Get a new key**), or **Couldn't check**.
  - **Higgsfield** and **Database** say "Coming soon".
  - Keys are never typed into the app. See `docs/ARCHITECTURE.md` §6 for why.
- **Writing model**: six models shown as cards, each with what it's good at, its provider and a rough cost per draft. Claude Sonnet 5.5 is the default ("Recommended"). Picking one saves straight away and is remembered on this browser. In sample mode the choice is saved for later.
- **Appearance**: Light, Dark or Automatic (follows your computer). It stays in step with the toggle in the top bar.
- **Sample content** (sample mode only): explains that the library is kept in memory, shows how many pieces it holds, and **Reset** puts the original sample content back after asking first.

## 7. States & feedback (everywhere, not just one page)

- **Loading:** every wait shows a spinner or the draft streaming in, and buttons say what's happening ("Writing…", "Saving…").
- **Errors:** a plain-language sentence and a way to try again. Never a stack trace or a raw API error.
- **Empty:** every list that can be empty has a friendly empty state with a clear next step.
- **Confirmations:** a short message in the corner after each change ("Saved to your library as a draft", "Marked as published").
- **Asking first:** anything that loses work (deleting, resetting, leaving with unsaved changes) asks before it happens.
- **Not found:** an unknown address shows "This page isn't here", with links to the Dashboard and the Library. The browser tab says "Not found".
- **No dropdowns:** choices are buttons or cards, so every option is visible at once.

## 8. Sample mode

The app works with no keys and no database, so anyone can try it before setting anything up.

- **No OpenRouter key:** drafts are templates built from your brief, streamed in like a real draft. The Generate page, the brief and the sidebar all say so.
- **No database:** the library starts with a realistic set of sample pieces (every type, every status, with views and opens), kept in memory. Everything works, but changes are lost when the app restarts. Settings can reset it.
- The top bar shows a "Sample data" badge the whole time.

## 9. Acceptance criteria (how we know v1 is actually done)

- [ ] Can generate, save, and view a blog post end-to-end. *Works in sample mode; still to do: one run with a real OpenRouter key.*
- [ ] Can generate, save, and view a newsletter end-to-end. *Same as above.*
- [ ] Can generate a video concept, approve it, and get back a real rendered video end-to-end. *Concepts work and save; rendering waits on Higgsfield.*
- [x] All generated content shows up in the Library and can be filtered by type/status.
- [x] Can mark an item as published and enter manual stat fields.
- [ ] Settings page correctly reflects whether OpenRouter and Higgsfield are configured. *OpenRouter is done, including a live key check; Higgsfield shows "Coming soon".*
- [ ] Content is kept in a real database, so it survives restarts. *Sample mode until then.*
