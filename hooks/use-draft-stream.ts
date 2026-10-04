"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { Brief } from "@/lib/content/brief"

type Status = "idle" | "writing" | "done" | "error"

type Result = {
  /** Everything written, even if the stream stopped early. */
  text: string
  source: "openrouter" | "sample"
  /** OpenRouter model id for real drafts, null for sample drafts. */
  model: string | null
}

/**
 * Sends a brief to /api/generate/text and streams the draft back as it's
 * written. `generate` resolves with the finished text (or whatever arrived
 * before you pressed Stop), or null if nothing usable came back.
 */
export function useDraftStream() {
  const [text, setText] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  // Stop any draft that's still being written when you leave the page.
  useEffect(() => () => controllerRef.current?.abort(), [])

  const generate = useCallback(async (brief: Brief): Promise<Result | null> => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setText("")
    setError(null)
    setStatus("writing")

    let written = ""
    let source: Result["source"] = "sample"
    let model: string | null = null

    try {
      const response = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? "Something went wrong. Try again.")
      }

      source = response.headers.get("X-Draft-Source") === "openrouter" ? "openrouter" : "sample"
      model = response.headers.get("X-Draft-Model")

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        written += value
        setText(written)
      }

      if (!written.trim()) {
        throw new Error("The model sent back an empty draft. Try again.")
      }
      setStatus("done")
      return { text: written, source, model }
    } catch (caught) {
      if (controller.signal.aborted) {
        // Stopped on purpose: keep whatever was written so far.
        setStatus(written.trim() ? "done" : "idle")
        return written.trim() ? { text: written, source, model } : null
      }

      const message =
        written && caught instanceof TypeError
          ? "The connection dropped partway through. Keep what's there, or write it again."
          : caught instanceof Error
            ? caught.message
            : "Something went wrong. Try again."
      setError(message)
      setStatus("error")
      return written.trim() ? { text: written, source, model } : null
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [])

  const stop = useCallback(() => controllerRef.current?.abort(), [])

  return { text, status, error, generate, stop }
}
