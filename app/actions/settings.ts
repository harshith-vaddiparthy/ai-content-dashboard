"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import type { ActionResult } from "@/app/actions/content"
import { isModelId, MODEL_COOKIE } from "@/lib/ai/models"

const ONE_YEAR = 60 * 60 * 24 * 365

/** Remembers which model writes your drafts. Stored in a cookie on this browser. */
export async function setWritingModelAction(id: string): Promise<ActionResult> {
  if (!isModelId(id)) {
    return { ok: false, error: "That model isn't on the list. Pick another one." }
  }

  const cookieStore = await cookies()
  cookieStore.set(MODEL_COOKIE, id, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: true,
  })
  revalidatePath("/", "layout")
  return { ok: true, data: null }
}
