import "server-only"

import { OpenRouterError } from "@/lib/ai/openrouter"

/**
 * Shared plumbing for the AI route handlers in app/api/**: who may call them,
 * how text streams back, and how failures turn into friendly JSON.
 */

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
}

/**
 * True unless another website is calling. Browsers label every request with
 * Sec-Fetch-Site, so this stops other pages from spending your OpenRouter
 * credits through a visitor's browser. Scripts can skip the header, so it's
 * not a password: the credit limit on your key is the real cap.
 */
export function isSameOrigin(request: Request) {
  const site = request.headers.get("Sec-Fetch-Site")
  return site === null || site === "same-origin" || site === "none"
}

export function forbidden() {
  return Response.json(
    { error: "This only works from inside the dashboard." },
    { status: 403 }
  )
}

/** Streams text to the browser, with any extra headers (like the model used). */
export function textResponse(text: ReadableStream<string>, headers: Record<string, string>) {
  return new Response(text.pipeThrough(new TextEncoderStream()), {
    headers: { ...TEXT_HEADERS, ...headers },
  })
}

/** Turns a failure into JSON the page can show: { "error": "…" }. */
export function errorResponse(error: unknown, request: Request, fallback: string) {
  if (error instanceof OpenRouterError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  // The person pressed Stop or left the page: nobody is listening.
  if (request.signal.aborted) {
    return new Response(null, { status: 499 })
  }
  console.error(error)
  return Response.json({ error: fallback }, { status: 500 })
}
