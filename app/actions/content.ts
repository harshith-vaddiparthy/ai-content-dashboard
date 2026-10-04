"use server"

import { revalidatePath } from "next/cache"
import { redirect, RedirectType } from "next/navigation"

import { isModelId } from "@/lib/ai/models"
import { isContentType, type ContentStatus } from "@/lib/content/types"
import {
  createContent,
  deleteContent,
  getContent,
  resetSampleContent,
  setContentStatus,
  updateContent,
  updateContentStats,
} from "@/lib/db/content"

/**
 * Everything that changes content goes through these server actions. Each one
 * checks its input (never trust the browser), makes the change, then refreshes
 * every page so counts and lists stay in sync.
 */

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string }

const MAX_TITLE = 200
const MAX_BODY = 50_000
const MAX_STAT = 1_000_000_000

function refreshAll() {
  revalidatePath("/", "layout")
}

function checkText(title: unknown, body: unknown) {
  if (typeof title !== "string" || typeof body !== "string") {
    return { error: "Something went wrong reading your changes. Try again." }
  }
  const cleanTitle = title.trim()
  if (!cleanTitle) return { error: "Give it a title first." }
  if (cleanTitle.length > MAX_TITLE) {
    return { error: `Keep the title under ${MAX_TITLE} characters.` }
  }
  if (body.length > MAX_BODY) {
    return { error: "That's too long to save. Try splitting it into two pieces." }
  }
  return { title: cleanTitle, body: body.trim() }
}

export async function createContentAction(input: {
  type: string
  title: string
  body: string
  model: string | null
}): Promise<ActionResult<{ id: string }>> {
  if (!isContentType(input.type)) {
    return { ok: false, error: "Choose a blog post, newsletter or video." }
  }
  const text = checkText(input.title, input.body)
  if ("error" in text) return { ok: false, error: text.error! }

  const item = await createContent({
    type: input.type,
    title: text.title,
    body: text.body,
    model: isModelId(input.model) ? input.model : null,
  })
  refreshAll()
  return { ok: true, data: { id: item.id } }
}

export async function updateContentAction(
  id: string,
  input: { title: string; body: string }
): Promise<ActionResult> {
  const text = checkText(input.title, input.body)
  if ("error" in text) return { ok: false, error: text.error! }

  const item = await updateContent(id, { title: text.title, body: text.body })
  if (!item) return { ok: false, error: "This item no longer exists." }
  refreshAll()
  return { ok: true, data: null }
}

/** Statuses you can choose. "Rendering" and "Failed" are only ever set by the video renderer. */
const CHOOSABLE: ContentStatus[] = ["draft", "ready", "published", "archived"]

export async function setContentStatusAction(
  id: string,
  status: ContentStatus
): Promise<ActionResult> {
  if (!CHOOSABLE.includes(status)) {
    return { ok: false, error: "That status can't be set by hand." }
  }

  const item = await getContent(id)
  if (!item) return { ok: false, error: "This item no longer exists." }
  if (status === "published" && (item.status === "processing" || item.status === "failed")) {
    return { ok: false, error: "This video needs to finish rendering before it can be published." }
  }

  await setContentStatus(id, status)
  refreshAll()
  return { ok: true, data: null }
}

function checkStat(value: unknown) {
  if (value === null) return { value: null }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > MAX_STAT) {
    return { error: "Use a whole number, like 1250." }
  }
  return { value }
}

export async function updateContentStatsAction(
  id: string,
  stats: { views?: number | null; opens?: number | null }
): Promise<ActionResult> {
  const update: { views?: number | null; opens?: number | null } = {}

  for (const key of ["views", "opens"] as const) {
    if (!(key in stats)) continue
    const checked = checkStat(stats[key])
    if ("error" in checked) return { ok: false, error: checked.error! }
    update[key] = checked.value
  }

  const item = await updateContentStats(id, update)
  if (!item) return { ok: false, error: "This item no longer exists." }
  refreshAll()
  return { ok: true, data: null }
}

/**
 * Deletes for good, then takes you back to the library. The deleted page is
 * replaced in your history, so pressing Back doesn't land on a missing page.
 */
export async function deleteContentAction(id: string): Promise<ActionResult> {
  const deleted = await deleteContent(id)
  if (!deleted) return { ok: false, error: "This item no longer exists." }
  refreshAll()
  redirect("/library", RedirectType.replace)
}

export async function resetSampleContentAction(): Promise<ActionResult> {
  await resetSampleContent()
  refreshAll()
  return { ok: true, data: null }
}
