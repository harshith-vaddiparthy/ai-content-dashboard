import "server-only"

import { connection } from "next/server"

import { createSampleContent } from "@/lib/content/sample-data"
import { buildDashboard } from "@/lib/content/stats"
import type { ContentItem, ContentStatus } from "@/lib/content/types"

/**
 * Where content is stored.
 *
 * v1 runs in sample mode: the library lives in this server's memory, seeded
 * with realistic sample content so every screen has something to show. Edits
 * work, but everything resets when the server restarts.
 *
 * Every page and action goes through the functions below, so moving to a real
 * database (Postgres via Prisma, see docs/ARCHITECTURE.md) means rewriting
 * this one file. Nothing else needs to change.
 */

/** True while the library is sample content kept in memory. Flips to false once a real database is connected. */
export const USING_SAMPLE_DATA = true

type Store = { items: ContentItem[] }

// Kept on globalThis so the data survives hot reloads in development.
const globalStore = globalThis as typeof globalThis & {
  __contentStore?: Store
}

function getStore(): Store {
  globalStore.__contentStore ??= { items: createSampleContent(new Date()) }
  return globalStore.__contentStore
}

function recentlyUpdatedFirst(a: ContentItem, b: ContentItem) {
  return b.updatedAt.localeCompare(a.updatedAt) || b.createdAt.localeCompare(a.createdAt)
}

/** Every item, most recently updated first, so what you touched last is on top. */
export async function listContent(): Promise<ContentItem[]> {
  await connection()
  return [...getStore().items].sort(recentlyUpdatedFirst).map((item) => ({ ...item }))
}

export async function getContent(id: string): Promise<ContentItem | null> {
  await connection()
  const item = getStore().items.find((entry) => entry.id === id)
  return item ? { ...item } : null
}

export async function getDashboardData() {
  await connection()
  return buildDashboard(getStore().items, new Date())
}

/** The time right now, read per request. Pages use it for labels like "2 days ago". */
export async function getNow() {
  await connection()
  return new Date()
}

export async function createContent(
  input: Pick<ContentItem, "type" | "title" | "body" | "model">
): Promise<ContentItem> {
  const now = new Date().toISOString()
  const item: ContentItem = {
    id: crypto.randomUUID().slice(0, 8),
    type: input.type,
    title: input.title,
    body: input.body,
    model: input.model,
    videoUrl: null,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    views: null,
    opens: null,
  }
  getStore().items.push(item)
  return { ...item }
}

function change(
  id: string,
  apply: (item: ContentItem) => Partial<ContentItem>,
  { touch = true } = {}
): ContentItem | null {
  const items = getStore().items
  const index = items.findIndex((entry) => entry.id === id)
  if (index === -1) return null

  const item = items[index]
  items[index] = {
    ...item,
    ...apply(item),
    updatedAt: touch ? new Date().toISOString() : item.updatedAt,
  }
  return { ...items[index] }
}

export async function updateContent(
  id: string,
  edits: Pick<ContentItem, "title" | "body">
) {
  return change(id, () => edits)
}

/**
 * Publishing records the publish date the first time. Moving something back
 * to drafts or "ready" clears it, so publishing again records a fresh date.
 */
export async function setContentStatus(id: string, status: ContentStatus) {
  return change(id, (item) => {
    if (status === "published") {
      return { status, publishedAt: item.publishedAt ?? new Date().toISOString() }
    }
    if (status === "archived") return { status }
    return { status, publishedAt: null }
  })
}

/** Stats are entered by hand. Saving them isn't an edit, so "last updated" stays put. */
export async function updateContentStats(
  id: string,
  stats: Partial<Pick<ContentItem, "views" | "opens">>
) {
  return change(id, () => stats, { touch: false })
}

export async function deleteContent(id: string) {
  const items = getStore().items
  const index = items.findIndex((entry) => entry.id === id)
  if (index === -1) return false
  items.splice(index, 1)
  return true
}

/** Puts the original sample content back, throwing away every change. */
export async function resetSampleContent() {
  getStore().items = createSampleContent(new Date())
}
