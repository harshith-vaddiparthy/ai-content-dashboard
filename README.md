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
| **Blog Post Generation** | Long-form articles from a topic or prompt, with a selectable AI model via OpenRouter. |
| **Newsletter Generation** | Structured, email-ready long-form content. |
| **AI Video Pipeline** | Two steps: OpenRouter drafts a script and shot list → you review and edit it → Higgsfield renders the video. |
| **Content Library** | Every item in one place, filterable by type and status (`draft` · `processing` · `ready` · `published` · `archived`). |
| **Performance Tracking** | Overview counts, recent activity, "mark as published", and optional manual stats (views, opens). |
| **Settings** | Connection status for OpenRouter and Higgsfield, plus a default model picker. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI Library | [React 19](https://react.dev) |
| Components | [shadcn/ui](https://ui.shadcn.com) — the only component library used |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Icons | [Lucide](https://lucide.dev) |
| Database | [PostgreSQL](https://www.postgresql.org) (Neon via Vercel) |
| ORM | [Prisma](https://www.prisma.io) |
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

- **One app, no separate backend** — Next.js route handlers act as the API.
- **API keys never reach the browser** — all AI calls run server-side in `lib/ai/*`.
- **Secrets live in environment variables**, never in the database.

📖 For the full design, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Project Structure

```
.
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Sidebar shell shared by all dashboard pages
│   │   ├── dashboard/        # Overview & stats
│   │   ├── library/          # Content library
│   │   ├── generate/         # Blog / newsletter / video entry points
│   │   └── settings/         # Connections & model picker
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Redirects "/" → "/dashboard"
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── app-sidebar.tsx
│   ├── nav-main.tsx
│   ├── nav-user.tsx
│   └── site-header.tsx
├── hooks/                    # Shared React hooks
├── lib/                      # Utilities (and lib/ai/* for AI providers)
├── docs/
│   ├── PRD.md                # Product requirements — the "why"
│   ├── SPEC.md               # Screens, flows & acceptance criteria
│   └── ARCHITECTURE.md       # System design & data model
└── public/                   # Static assets
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or newer
- npm (bundled with Node.js)
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- API keys for [OpenRouter](https://openrouter.ai) and [Higgsfield](https://higgsfield.ai)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/harshith-vaddiparthy/ai-content-dashboard.git
cd ai-content-dashboard

# 2. Install dependencies
npm install

# 3. Add your environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | API key for text generation |
| `HIGGSFIELD_API_KEY` | API key for video generation |

> ⚠️ Never commit real keys. All `.env*` files are git-ignored.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase with ESLint |
| `npx prisma studio` | Browse the database visually |
| `npx prisma migrate dev` | Apply schema changes locally |

---

## Roadmap

- [x] Dashboard shell with sidebar navigation
- [ ] Blog & newsletter generation (OpenRouter)
- [ ] Video pipeline with review step (Higgsfield)
- [ ] Content library with filters
- [ ] Manual performance tracking
- [ ] Settings & connection status
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
