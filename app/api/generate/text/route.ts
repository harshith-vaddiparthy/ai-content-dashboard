import { errorResponse, forbidden, isSameOrigin, textResponse } from "@/lib/ai/http"
import { fallbackFor } from "@/lib/ai/models"
import { streamChat } from "@/lib/ai/openrouter"
import { buildMessages } from "@/lib/ai/prompts"
import { sampleDraft, streamWords } from "@/lib/ai/sample-draft"
import { parseBrief } from "@/lib/content/brief"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

/** Long drafts can take a few minutes to write. */
export const maxDuration = 300

/** Room for a long post plus the model's (low-effort) thinking. */
const MAX_DRAFT_TOKENS = 16_000

/**
 * POST /api/generate/text
 *
 * Takes a brief (blog post, newsletter or video concept) and streams back the
 * draft as plain text. Without an OpenRouter key it streams a sample draft
 * instead, so the flow works out of the box.
 *
 * Headers on success:
 *   X-Draft-Source: "openrouter" | "sample"
 *   X-Draft-Model:  the model that actually wrote it (real drafts only; can
 *                   be the fallback model if the chosen one was down)
 * Errors come back as JSON: { "error": "A sentence a person can act on." }
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden()

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return Response.json(
      { error: "Something went wrong sending your brief. Try again." },
      { status: 400 }
    )
  }

  const parsed = parseBrief(input)
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  if (!isOpenRouterConnected()) {
    return textResponse(streamWords(sampleDraft(parsed.brief)), { "X-Draft-Source": "sample" })
  }

  const model = await getWritingModel()

  try {
    const draft = await streamChat({
      model: model.id,
      fallbacks: [fallbackFor(model)],
      messages: buildMessages(parsed.brief),
      maxTokens: MAX_DRAFT_TOKENS,
      signal: request.signal,
    })
    return textResponse(draft.text, { "X-Draft-Source": "openrouter", "X-Draft-Model": draft.model })
  } catch (error) {
    return errorResponse(error, request, "Something went wrong starting the draft. Try again.")
  }
}
