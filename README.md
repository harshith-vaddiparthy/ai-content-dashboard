<div align="center">

# AI Content Dashboard

**Generate blog posts, newsletters, and real AI video — then manage and track it all from one dashboard.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)

[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-6566F1?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai)
[![Higgsfield](https://img.shields.io/badge/Higgsfield-Video_AI-FF3D00?style=for-the-badge)](https://higgsfield.ai)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-in_development-orange?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AI Content Dashboard** is a single-user web app for creators. It takes you from idea to finished content without leaving the dashboard:

- ✍️ **Write** long-form blog posts and newsletters with AI
- 🎬 **Produce** real generated video through a review-first pipeline
- 📚 **Organize** everything in one content library
- 📈 **Track** what you've published and how it performed

It's intentionally built as a **clean, well-documented foundation** — solo builders and consultants can fork it and ship their own branded product on top.

---

## Features

| Feature | Description |
|---|---|
| **Blog Post Generation** | Write from a short brief: topic, audience, tone and length. The draft streams in word by word; edit it, write it again (with undo), then save it. |
| **Newsletter Generation** | Email-ready issues with a subject line, short sections and a sign-off. |
| **AI Video Pipeline** | OpenRouter drafts the concept (hook, scenes, voiceover, call to action) in the style, shape and length you pick. Rendering with Higgsfield comes next. |
| **Content Library** | Every piece in one place, with tabs by status (`draft` · `ready` · `published` · `archived`, plus `processing` and `failed` for videos), a type filter, title search and pages. |
| **Editing & Publishing** | Edit in Markdown, copy as Markdown, and move each piece from draft to ready, published or archived. |
| **Performance Tracking** | A dashboard with headline numbers, weekly activity, content mix, what's in the works and top performers. Views and opens are entered by hand, and each piece is compared with your average. |
| **Settings** | Connect OpenRouter (with a live key check), choose from six writing models, and pick light, dark or automatic. |
| **Sample Mode** | Works with no keys and no database: sample drafts and a sample library, so you can try everything first. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI Library | [React 19](https://react.dev) |
| Components | [shadcn/ui](https://ui.shadcn.com) — the only component library used |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + the [tweakcn Caffeine](https://tweakcn.com) theme |
| Icons | [HugeIcons](https://hugeicons.com) |
| Charts | [Recharts](https://recharts.org), through shadcn's Chart component |
| Database | [PostgreSQL](https://www.postgresql.org) (Neon via Vercel), planned. Sample data in memory until then |
| ORM | [Prisma](https://www.prisma.io), planned |
| Text AI | [OpenRouter](https://openrouter.ai) |
| Video AI | [Higgsfield](https://higgsfield.ai) |
| Hosting | [Vercel](https://vercel.com) |

---

## Architecture

```
┌──────────────────────┐      ┌──────────────────────────┐      ┌──────────────┐
│   Browser (React)    │ ───▶ │  Next.js Route Handlers  │ ───▶ │  OpenRouter  │
│  shadcn/ui dashboard │      │        app/api/**        │      │  (text AI)   │
└──────────────────────┘      │                          │      └──────────────┘
                              │   lib/ai/*  (server-only)│      ┌──────────────┐
                              │                          │ ───▶ │  Higgsfield  │
                              └────────────┬─────────────┘      │  (video AI)  │
                                           │                    └──────────────┘
                                           ▼
                                  ┌──────────────────┐
                                  │ Postgres + Prisma│
                                  └──────────────────┘
```

- **One app, no separate backend** — Next.js route handlers and server actions act as the API.
- **API keys never reach the browser** — all AI calls run server-side in `lib/ai/*`.
- **Secrets live in environment variables**, never in the database.
- **Higgsfield and the database are next.** Until then the app runs in sample mode, with sample drafts and a sample library kept in memory.

📖 For the full design, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Project Structure

```
.
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Sidebar and top bar shared by every page
│   │   ├── dashboard/        # Headline numbers & charts
│   │   ├── generate/         # Pick what to make, then brief → draft → save
│   │   ├── library/          # The library, and one page per piece
│   │   └── settings/         # Connections, writing model, appearance
│   ├── actions/              # Server actions: every change to content
│   ├── api/generate/text/    # Streams a draft from OpenRouter (or a sample)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Redirects "/" → "/dashboard"
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard/            # KPI cards & charts
│   ├── generate/             # Brief & draft cards
│   ├── library/              # Table, editor, status & performance cards
│   ├── settings/             # Settings cards
│   └── app-sidebar.tsx       # The flat sidebar (plus other shared pieces)
├── hooks/                    # Shared React hooks
├── lib/
│   ├── ai/                   # Models, prompts, OpenRouter client, sample drafts
│   ├── content/              # Types, labels, briefs, dashboard stats, sample data
│   └── db/                   # Every read & write of content
├── docs/
│   ├── PRD.md                # Product requirements — the "why"
│   ├── SPEC.md               # Screens, flows & acceptance criteria
│   └── ARCHITECTURE.md       # System design, data model & full folder map
└── public/                   # Static assets
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20.9 or newer
- npm (bundled with Node.js)

That's all you need to try it. With no keys and no database, the app runs in **sample mode**: drafts are templates built from your brief, and the library is sample content kept in memory (changes reset when the app restarts).

For real AI drafts, add an [OpenRouter](https://openrouter.ai) API key. A [Higgsfield](https://higgsfield.ai) key and a PostgreSQL database (e.g. [Neon](https://neon.tech)) come into play once video rendering and the database are built.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/harshith-vaddiparthy/ai-content-dashboard.git
cd ai-content-dashboard

# 2. Install dependencies
npm install

# 3. Optional: add your keys (skip this for sample mode)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Settings walks you through connecting OpenRouter.

---

## Environment Variables

| Variable | Description | Used yet? |
|---|---|---|
| `OPENROUTER_API_KEY` | API key for text generation | Yes. Without it, drafts are samples |
| `HIGGSFIELD_API_KEY` | API key for video generation | Not yet |
| `DATABASE_URL` | PostgreSQL connection string | Not yet |

All three are optional. On Vercel, add them in the project's environment variables, then redeploy.

> ⚠️ Never commit real keys. All `.env*` files are git-ignored.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase with ESLint |

Prisma's `npx prisma studio` and `npx prisma migrate dev` join these once the database is added.

---

## Roadmap

- [x] Dashboard shell with a flat sidebar (no dropdowns)
- [x] Dashboard with headline numbers and charts
- [x] Blog & newsletter generation (OpenRouter, streamed, with a sample mode)
- [x] Video concepts with a review step
- [ ] Video rendering (Higgsfield)
- [x] Content library with tabs, filters and search
- [x] Editing, statuses and manual performance tracking
- [x] Settings: connections, writing model and appearance
- [ ] PostgreSQL database (Neon + Prisma)
- [ ] *Phase 2:* live stats from publishing platforms

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

Please read [`AGENTS.md`](AGENTS.md) for project conventions first — in particular, **all UI must use shadcn/ui**.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<div align="center">

Built by [Harshith Vaddiparthy](https://github.com/harshith-vaddiparthy)

</div>
