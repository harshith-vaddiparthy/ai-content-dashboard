/** Helpers for working with Markdown drafts. Safe to use on the server and in the browser. */

export function countWords(text: string) {
  const words = text.trim().match(/\S+/g)
  return words ? words.length : 0
}

/** Minutes to read at roughly 230 words per minute, never less than one. */
export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 230))
}

/**
 * Reads the "**Format:** Vertical 9:16 · 30 seconds" line at the top of a video
 * concept. Returns null if the line is missing, for example after an edit.
 */
export function readVideoFormat(body: string) {
  const summary = body.match(/^\*\*Format:\*\*\s*(.+)$/m)?.[1]?.trim()
  if (!summary) return null

  const ratio = summary.match(/(\d+)\s*:\s*(\d+)/)
  const aspect = ratio ? Number(ratio[1]) / Number(ratio[2]) : NaN
  // Anything stranger than a tall phone or a wide screen falls back to 16:9.
  return { summary, aspect: aspect >= 0.5 && aspect <= 2 ? aspect : 16 / 9 }
}

/**
 * Splits a generated draft into its title and body. Every prompt asks the model
 * to put the title on the first line as "# Title". Works on partial text too,
 * so it can run on every chunk while a draft is still streaming in.
 */
export function splitDraft(text: string) {
  const trimmed = text.trimStart()

  if (!trimmed.startsWith("#")) {
    return { title: "", body: trimmed.trim() }
  }

  const newline = trimmed.indexOf("\n")
  const heading = newline === -1 ? trimmed : trimmed.slice(0, newline)
  const body = newline === -1 ? "" : trimmed.slice(newline + 1)

  return {
    title: heading.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim(),
    body: body.trim(),
  }
}
