import "server-only"

import { cookies } from "next/headers"

import { getModel, MODEL_COOKIE } from "@/lib/ai/models"

/** The writing model picked in Settings, or the default if none has been picked. */
export async function getWritingModel() {
  const cookieStore = await cookies()
  return getModel(cookieStore.get(MODEL_COOKIE)?.value)
}
