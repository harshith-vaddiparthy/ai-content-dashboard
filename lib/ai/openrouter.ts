import "server-only"

import type { ChatMessage } from "@/lib/ai/prompts"
import { site } from "@/lib/site"

/**
 * The only place the app talks to OpenRouter. Server-side only: the API key
 * is read from the environment and never leaves the server.
 * Docs: https://openrouter.ai/docs/api-reference/chat-completion
 */

const CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
const KEY_URL = "https://openrouter.ai/api/v1/key"

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "OpenRouterError"
  }
}

/** Turns OpenRouter's error codes into something a person can act on. */
function friendlyMessage(status: number) {
  switch (status) {
    case 400:
      return "OpenRouter couldn't use this request. Try a shorter brief, or pick another model in Settings."
    case 401:
      return "OpenRouter didn't accept your API key. Check OPENROUTER_API_KEY, then restart the app."
    case 402:
      return "Your OpenRouter account is out of credits. Add credits at openrouter.ai, then try again."
    case 403:
      return "The model declined to write this. Try rewording your brief."
    case 408:
      return "The model took too long to answer. Try again."
    case 429:
      return "Too many requests at once. Wait a moment, then try again."
    case 502:
    case 503:
      return "The selected model isn't available right now. Try again, or pick another model in Settings."
    default:
      return "Something went wrong talking to OpenRouter. Try again."
  }
}

type StreamEvent = {
  choices?: { delta?: { content?: string | null } }[]
  error?: { code?: number | string; message?: string }
}

/**
 * Reads OpenRouter's server-sent events and passes on just the text.
 * Each event is a line like `data: {...}`. Lines starting with ":" are
 * keep-alive comments, and `data: [DONE]` marks the end.
 */
function eventsToText() {
  let buffer = ""

  function handleLine(rawLine: string, controller: TransformStreamDefaultController<string>) {
    const line = rawLine.trim()
    if (!line.startsWith("data:")) return

    const data = line.slice("data:".length).trim()
    if (!data || data === "[DONE]") return

    let event: StreamEvent
    try {
      event = JSON.parse(data)
    } catch {
      return
    }

    if (event.error) {
      const status = Number(event.error.code)
      controller.error(new OpenRouterError(friendlyMessage(status), status || 500))
      return
    }

    const text = event.choices?.[0]?.delta?.content
    if (text) controller.enqueue(text)
  }

  return new TransformStream<string, string>({
    transform(chunk, controller) {
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      for (const line of lines) handleLine(line, controller)
    },
    flush(controller) {
      if (buffer) handleLine(buffer, controller)
    },
  })
}

/**
 * Starts a streamed chat completion. Resolves once OpenRouter accepts the
 * request, then the returned stream yields text as the model writes it.
 * Throws OpenRouterError (with a friendly message) if it's refused up front.
 */
export async function streamChat({
  model,
  messages,
  signal,
}: {
  model: string
  messages: ChatMessage[]
  signal?: AbortSignal
}): Promise<ReadableStream<string>> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new OpenRouterError("OpenRouter isn't connected yet. See Settings.", 503)
  }

  let response: Response
  try {
    response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": site.name,
      },
      body: JSON.stringify({ model, messages, stream: true }),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new OpenRouterError(
      "Couldn't reach OpenRouter. Check your internet connection, then try again.",
      502
    )
  }

  if (!response.ok || !response.body) {
    // The body holds OpenRouter's own error, e.g. {"error":{"code":402,"message":"..."}}.
    // Log it for whoever runs the app, and show the person a friendly version.
    const detail = await response.text().catch(() => "")
    console.error(`OpenRouter error ${response.status}: ${detail.slice(0, 500)}`)
    throw new OpenRouterError(friendlyMessage(response.status), response.status)
  }

  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(eventsToText())
}

export type KeyCheck = "valid" | "rejected" | "unreachable"

/** Asks OpenRouter whether the key works. Cheap: it doesn't run a model. */
export async function checkOpenRouterKey(): Promise<KeyCheck> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) return "rejected"

  try {
    const response = await fetch(KEY_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    })
    if (response.ok) return "valid"
    if (response.status === 401 || response.status === 403) return "rejected"
    return "unreachable"
  } catch {
    return "unreachable"
  }
}
