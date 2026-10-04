import { buildAgentMessages, parseConversation, sampleAgentReply } from "@/lib/ai/agent"
import { errorResponse, forbidden, isSameOrigin, textResponse } from "@/lib/ai/http"
import { fallbackFor } from "@/lib/ai/models"
import { streamChat } from "@/lib/ai/openrouter"
import { streamWords } from "@/lib/ai/sample-draft"
import { getNow, listContent } from "@/lib/db/content"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

export const maxDuration = 300

/** Chat replies are short; this caps what one answer can cost. */
const MAX_REPLY_TOKENS = 4_000

/**
 * POST /api/agent
 *
 * Takes the conversation so far ({ messages: [{ role, content }] }) and
 * streams back the agent's reply as plain text. The agent sees the library,
 * so it can answer questions about it. Without an OpenRouter key it streams a
 * sample answer instead.
 *
 * Headers on success:
 *   X-Agent-Source: "openrouter" | "sample"
 *   X-Agent-Model:  the model that answered (real replies only)
 * Errors come back as JSON: { "error": "A sentence a person can act on." }
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden()

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return Response.json(
      { error: "Something went wrong sending your message. Try again." },
      { status: 400 }
    )
  }

  const parsed = parseConversation(input)
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  const items = await listContent()

  if (!isOpenRouterConnected()) {
    const question = parsed.turns.at(-1)?.content ?? ""
    return textResponse(streamWords(sampleAgentReply(question, items)), {
      "X-Agent-Source": "sample",
    })
  }

  const [model, now] = await Promise.all([getWritingModel(), getNow()])

  try {
    const reply = await streamChat({
      model: model.id,
      fallbacks: [fallbackFor(model)],
      messages: buildAgentMessages(parsed.turns, items, now),
      maxTokens: MAX_REPLY_TOKENS,
      // Every turn resends the same library summary, so cache it.
      cache: true,
      signal: request.signal,
    })
    return textResponse(reply.text, { "X-Agent-Source": "openrouter", "X-Agent-Model": reply.model })
  } catch (error) {
    return errorResponse(error, request, "Something went wrong reaching the agent. Try again.")
  }
}
