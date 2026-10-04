import "server-only"

import type { ChatMessage } from "@/lib/ai/prompts"
import { site } from "@/lib/site"

/**
 * The only place the app talks to OpenRouter. Server-side only: the API key
 * is read from the environment and never leaves the server.
 *
 * Docs: https://openrouter.ai/docs/api/api-reference/chat/create-a-chat-completion
 * Errors: https://openrouter.ai/docs/api_reference/errors-and-debugging
 */

const API_URL = "https://openrouter.ai/api/v1"

/** How long to wait for the model to start writing before giving up. */
const FIRST_TOKEN_TIMEOUT_MS = 90_000

/** The key from the environment (Vercel project settings, or .env.local). */
export function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY?.trim() || null
}

/**
 * App attribution, so requests show up as this app in your OpenRouter
 * activity. "hidden" keeps a personal dashboard out of the public rankings.
 * https://openrouter.ai/docs/app-attribution
 */
function appHeaders(): Record<string, string> {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return {
    "HTTP-Referer": host ? `https://${host}` : "http://localhost:3000",
    "X-OpenRouter-Title": site.name,
    "X-OpenRouter-Categories": "writing-assistant",
    "X-OpenRouter-App-Visibility": "hidden",
  }
}

export class OpenRouterError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "OpenRouterError"
    this.status = status
  }
}

type ErrorBody = {
  code?: number | string
  message?: string
  metadata?: Record<string, unknown>
}

/** Turns OpenRouter's error codes into something a person can act on. */
function friendlyMessage(status: number, metadata?: Record<string, unknown>) {
  switch (status) {
    case 400:
    case 422:
      return "OpenRouter couldn't use this request. Try again, or pick another model in Settings."
    case 401:
      return "OpenRouter didn't accept the API key. Check OPENROUTER_API_KEY in Vercel (or .env.local), then redeploy or restart."
    case 402:
      return metadata?.reason === "weight_exceeds_budget"
        ? "This request costs more than your OpenRouter balance allows at once. Add credits, or pick a cheaper model in Settings."
        : "Your OpenRouter account or key is out of credits. Add credits or raise the key's limit at openrouter.ai, then try again."
    case 403:
      return "The model declined to write this. Try rewording it."
    case 404:
      return "That model isn't on OpenRouter anymore. Pick another model in Settings."
    case 408:
    case 524:
      return "The model took too long to answer. Try again."
    case 413:
      return "That's too much text for the model in one go. Try something shorter."
    case 429:
      return "Too many requests at once. Wait a moment, then try again."
    case 502:
    case 503:
    case 529:
      return "The selected model isn't available right now. Try again, or pick another model in Settings."
    default:
      return "Something went wrong talking to OpenRouter. Try again."
  }
}

/** Error codes mid-stream can be words ("server_error"); treat those as a provider failure. */
function toError(body: ErrorBody, fallbackStatus: number) {
  const status = Number(body.code) || fallbackStatus
  return new OpenRouterError(friendlyMessage(status, body.metadata), status)
}

/** Keeps the raw provider error in the server logs only, never in the browser. */
function logError(context: string, status: number, body: ErrorBody, requestId: string | null) {
  const details = {
    reason: body.metadata?.reason ?? body.metadata?.error_type,
    provider: body.metadata?.provider_name,
  }
  console.error(
    `OpenRouter ${context} ${status}${requestId ? ` (request ${requestId})` : ""}: ${body.message ?? "no message"}`,
    ...(details.reason || details.provider ? [details] : [])
  )
}

type Usage = {
  prompt_tokens?: number
  completion_tokens?: number
  cost?: number | null
  prompt_tokens_details?: { cached_tokens?: number }
  completion_tokens_details?: { reasoning_tokens?: number }
}

type StreamChunk = {
  model?: string
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[]
  usage?: Usage
  error?: ErrorBody
}

/**
 * Reads OpenRouter's server-sent events one chunk at a time. Each event is a
 * line like `data: {...}`. Lines starting with ":" are keep-alive comments,
 * and `data: [DONE]` marks the end.
 * https://openrouter.ai/docs/api_reference/streaming
 */
async function* readChunks(body: NonNullable<Response["body"]>): AsyncGenerator<StreamChunk> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += value
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      for (const line of lines) {
        const chunk = parseLine(line)
        if (chunk === "done") return
        if (chunk) yield chunk
      }
    }
    const last = parseLine(buffer)
    if (last && last !== "done") yield last
  } finally {
    reader.cancel().catch(() => {})
  }
}

function parseLine(rawLine: string): StreamChunk | "done" | null {
  const line = rawLine.trim()
  if (!line.startsWith("data:")) return null
  const data = line.slice("data:".length).trim()
  if (data === "[DONE]") return "done"
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

/** One line per finished request, so cost shows up in the Vercel logs. */
function logUsage(model: string, usage: Usage | undefined, finishReason: string | null) {
  if (!usage) return
  const cost = typeof usage.cost === "number" ? ` · $${usage.cost.toFixed(4)}` : ""
  const cached = usage.prompt_tokens_details?.cached_tokens
  const reasoning = usage.completion_tokens_details?.reasoning_tokens
  console.info(
    `OpenRouter ${model}: ${usage.prompt_tokens ?? 0} in${cached ? ` (${cached} cached)` : ""}, ` +
      `${usage.completion_tokens ?? 0} out${reasoning ? ` (${reasoning} reasoning)` : ""}${cost}`
  )
  if (finishReason === "length") {
    console.warn(`OpenRouter ${model}: stopped at the token limit, so the reply may be cut short.`)
  }
}

export type ChatRequest = {
  /** The model to try first, e.g. "anthropic/claude-sonnet-5.5". */
  model: string
  /** Tried in order if the first model is down or refuses. */
  fallbacks?: string[]
  messages: ChatMessage[]
  /** Hard cap on what one reply can cost. Includes reasoning tokens. */
  maxTokens: number
  /**
   * Caches the start of the conversation, so follow-up turns that repeat it
   * (like the agent's library) are cheaper. Ignored by models that can't.
   */
  cache?: boolean
  signal?: AbortSignal
}

export type ChatStream = {
  /** The model that's actually writing; differs from the request after a fallback. */
  model: string
  /** The reply's text, as it's written. */
  text: ReadableStream<string>
}

/**
 * Starts a streamed chat completion. Resolves once the model has written its
 * first words, so a refusal or an early failure throws OpenRouterError (with
 * a friendly message) instead of arriving as an empty reply.
 */
export async function streamChat({
  model,
  fallbacks = [],
  messages,
  maxTokens,
  cache = false,
  signal,
}: ChatRequest): Promise<ChatStream> {
  const apiKey = getOpenRouterKey()
  if (!apiKey) {
    throw new OpenRouterError("OpenRouter isn't connected yet. See Settings.", 503)
  }

  // One controller for the whole request: the browser leaving, or the model
  // not starting in time, both cancel it, which also stops OpenRouter billing.
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener("abort", abort, { once: true })
  const timer = setTimeout(abort, FIRST_TOKEN_TIMEOUT_MS)
  const cleanUp = () => {
    clearTimeout(timer)
    signal?.removeEventListener("abort", abort)
  }

  const models = [model, ...fallbacks.filter((id) => id !== model)]

  let response: Response
  try {
    response = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...appHeaders(),
      },
      body: JSON.stringify({
        ...(models.length > 1 ? { models } : { model }),
        messages,
        stream: true,
        max_completion_tokens: maxTokens,
        // Writing doesn't need long deliberation: low effort is faster and cheaper.
        reasoning: { effort: "low", exclude: true },
        ...(cache ? { cache_control: { type: "ephemeral" } } : {}),
      }),
      signal: controller.signal,
    })
  } catch (error) {
    cleanUp()
    if (signal?.aborted) throw error
    if (controller.signal.aborted) {
      throw new OpenRouterError(friendlyMessage(408), 408)
    }
    throw new OpenRouterError(
      "Couldn't reach OpenRouter. Check your internet connection, then try again.",
      502
    )
  }

  const requestId = response.headers.get("X-OpenRouter-Request-Id")

  if (!response.ok || !response.body) {
    cleanUp()
    const data = (await response.json().catch(() => null)) as { error?: ErrorBody } | null
    const body = data?.error ?? {}
    logError("refused the request", response.status, body, requestId)
    throw new OpenRouterError(friendlyMessage(response.status, body.metadata), response.status)
  }

  const chunks = readChunks(response.body)
  let usedModel = model
  let usage: Usage | undefined
  let finishReason: string | null = null

  /** Reads until the next piece of text. Null once the reply is finished. */
  async function nextText(): Promise<string | null> {
    while (true) {
      const { done, value: chunk } = await chunks.next()
      if (done) return null
      // OpenRouter may name a dated version ("…-20261001"); keep our own id.
      if (chunk.model) usedModel = models.find((id) => chunk.model!.startsWith(id)) ?? chunk.model
      if (chunk.usage) usage = chunk.usage
      finishReason = chunk.choices?.[0]?.finish_reason ?? finishReason
      if (chunk.error) {
        logError("failed mid-reply", Number(chunk.error.code) || 502, chunk.error, requestId)
        throw toError(chunk.error, 502)
      }
      const text = chunk.choices?.[0]?.delta?.content
      if (text) return text
    }
  }

  // Wait for the first words before answering the browser.
  let first: string | null
  try {
    first = await nextText()
  } catch (error) {
    cleanUp()
    if (signal?.aborted) throw error
    if (error instanceof OpenRouterError) throw error
    if (controller.signal.aborted) throw new OpenRouterError(friendlyMessage(408), 408)
    throw new OpenRouterError(friendlyMessage(502), 502)
  }
  clearTimeout(timer)

  if (first === null) {
    cleanUp()
    logUsage(usedModel, usage, finishReason)
    throw new OpenRouterError("The model sent back an empty reply. Try again.", 502)
  }

  const text = new ReadableStream<string>({
    start(stream) {
      stream.enqueue(first)
    },
    async pull(stream) {
      try {
        const next = await nextText()
        if (next === null) {
          cleanUp()
          logUsage(usedModel, usage, finishReason)
          stream.close()
        } else {
          stream.enqueue(next)
        }
      } catch (error) {
        cleanUp()
        stream.error(error)
      }
    },
    cancel() {
      // The browser stopped reading (Stop, or it closed the page). Aborting
      // closes the connection, which also ends any read still in progress.
      cleanUp()
      controller.abort()
      chunks.return(undefined).catch(() => {})
    },
  })

  return { model: usedModel, text }
}

export type KeyCheck = "valid" | "rejected" | "unreachable"

/**
 * Asks OpenRouter whether the key works. Cheap: it doesn't run a model.
 * https://openrouter.ai/docs/api/api-reference/api-keys/get-current-api-key
 */
export async function checkOpenRouterKey(): Promise<KeyCheck> {
  const apiKey = getOpenRouterKey()
  if (!apiKey) return "rejected"

  try {
    const response = await fetch(`${API_URL}/key`, {
      headers: { Authorization: `Bearer ${apiKey}`, ...appHeaders() },
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
