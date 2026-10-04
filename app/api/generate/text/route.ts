import { OpenRouterError, streamChat } from "@/lib/ai/openrouter"
import { buildMessages } from "@/lib/ai/prompts"
import { sampleDraft, streamWords } from "@/lib/ai/sample-draft"
import { parseBrief } from "@/lib/content/brief"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

/**
 * POST /api/generate/text
 *
 * Takes a brief (blog post, newsletter or video concept) and streams back the
 * draft as plain text. Without an OpenRouter key it streams a sample draft
 * instead, so the flow works out of the box.
 *
 * Headers on success:
 *   X-Draft-Source: "openrouter" | "sample"
 *   X-Draft-Model:  the OpenRouter model id (real drafts only)
 * Errors come back as JSON: { "error": "A sentence a person can act on." }
 */
export async function POST(request: Request) {
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

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  }

  if (!isOpenRouterConnected()) {
    const draft = streamWords(sampleDraft(parsed.brief))
    return new Response(draft.pipeThrough(new TextEncoderStream()), {
      headers: { ...headers, "X-Draft-Source": "sample" },
    })
  }

  const model = await getWritingModel()

  try {
    const draft = await streamChat({
      model: model.id,
      messages: buildMessages(parsed.brief),
      signal: request.signal,
    })
    return new Response(draft.pipeThrough(new TextEncoderStream()), {
      headers: { ...headers, "X-Draft-Source": "openrouter", "X-Draft-Model": model.id },
    })
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    if (request.signal.aborted) {
      return new Response(null, { status: 499 })
    }
    console.error(error)
    return Response.json(
      { error: "Something went wrong starting the draft. Try again." },
      { status: 500 }
    )
  }
}
