import { buildAgentMessages, parseConversation, sampleAgentReply } from "@/lib/ai/agent"
import { OpenRouterError, streamChat } from "@/lib/ai/openrouter"
import { streamWords } from "@/lib/ai/sample-draft"
import { getNow, listContent } from "@/lib/db/content"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

/**
 * POST /api/agent
 *
 * Takes the conversation so far ({ messages: [{ role, content }] }) and
 * streams back the agent's reply as plain text. The agent sees the library,
 * so it can answer questions about it. Without an OpenRouter key it streams a
 * sample answer instead.
 *
 * Header on success: X-Agent-Source: "openrouter" | "sample"
 * Errors come back as JSON: { "error": "A sentence a person can act on." }
 */
export async function POST(request: Request) {
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

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  }
  const items = await listContent()

  if (!isOpenRouterConnected()) {
    const question = parsed.turns.at(-1)?.content ?? ""
    const reply = streamWords(sampleAgentReply(question, items))
    return new Response(reply.pipeThrough(new TextEncoderStream()), {
      headers: { ...headers, "X-Agent-Source": "sample" },
    })
  }

  const [model, now] = await Promise.all([getWritingModel(), getNow()])

  try {
    const reply = await streamChat({
      model: model.id,
      messages: buildAgentMessages(parsed.turns, items, now),
      signal: request.signal,
    })
    return new Response(reply.pipeThrough(new TextEncoderStream()), {
      headers: { ...headers, "X-Agent-Source": "openrouter" },
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
      { error: "Something went wrong reaching the agent. Try again." },
      { status: 500 }
    )
  }
}
