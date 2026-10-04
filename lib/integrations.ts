import "server-only"

import { getOpenRouterKey } from "@/lib/ai/openrouter"

/**
 * The outside services this app connects to. Keys live in environment
 * variables only (Vercel project settings, or .env.local on your computer).
 * They're never typed into the app, stored in the database or sent to the
 * browser. This file only reports whether each key is there.
 */

export type Integration = {
  id: "openrouter" | "higgsfield" | "database"
  name: string
  envVar: string
  description: string
  connected: boolean
  /** False while this build doesn't use the connection yet. */
  inUse: boolean
}

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim())
}

export function isOpenRouterConnected() {
  return getOpenRouterKey() !== null
}

export function getIntegrations(): Integration[] {
  return [
    {
      id: "openrouter",
      name: "OpenRouter",
      envVar: "OPENROUTER_API_KEY",
      description: "Writes blog posts, newsletters and video concepts with AI.",
      connected: isOpenRouterConnected(),
      inUse: true,
    },
    {
      id: "higgsfield",
      name: "Higgsfield",
      envVar: "HIGGSFIELD_API_KEY",
      description: "Turns an approved video concept into a real, rendered video.",
      connected: hasEnv("HIGGSFIELD_API_KEY"),
      inUse: false,
    },
    {
      id: "database",
      name: "Database",
      envVar: "DATABASE_URL",
      description: "Keeps your library safe between restarts (Postgres).",
      connected: hasEnv("DATABASE_URL"),
      inUse: false,
    },
  ]
}
