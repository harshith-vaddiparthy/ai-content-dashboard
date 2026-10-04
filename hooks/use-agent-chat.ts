"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type AgentMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type Status = "idle" | "thinking" | "error"

/**
 * The conversation with the AI agent. Sends it to /api/agent and streams the
 * reply in as it's written. Lives in the dashboard layout, so the chat stays
 * put while you move between pages.
 */
export function useAgentChat() {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  /** Sends a conversation that ends with your question, and streams the answer onto it. */
  const ask = useCallback(
    async (history: AgentMessage[]) => {
      if (controllerRef.current) return
      const controller = new AbortController()
      controllerRef.current = controller

      const replyId = crypto.randomUUID()
      setMessages(history)
      setError(null)
      setStatus("thinking")

      let written = ""
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error ?? "Something went wrong. Try again.")
        }

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          written += value
          const reply: AgentMessage = { id: replyId, role: "assistant", content: written }
          setMessages([...history, reply])
        }

        if (!written.trim()) throw new Error("The agent sent back an empty reply. Try again.")
        setStatus("idle")
      } catch (caught) {
        if (controller.signal.aborted) {
          // Stopped on purpose: keep whatever arrived.
          setStatus("idle")
          return
        }
        setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.")
        setStatus("error")
      } finally {
        controllerRef.current = null
      }
    },
    []
  )

  const send = useCallback(
    (text: string) => {
      const content = text.trim()
      if (!content) return
      ask([...messages, { id: crypto.randomUUID(), role: "user", content }])
    },
    [ask, messages]
  )

  /** Asks the last question again, after an error. */
  const retry = useCallback(() => {
    const lastQuestion = messages.findLastIndex((message) => message.role === "user")
    if (lastQuestion >= 0) ask(messages.slice(0, lastQuestion + 1))
  }, [ask, messages])

  const stop = useCallback(() => controllerRef.current?.abort(), [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    setMessages([])
    setError(null)
    setStatus("idle")
  }, [])

  return { messages, status, error, send, retry, stop, reset }
}
