import "server-only"

import type { ChatMessage } from "@/lib/ai/prompts"
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/content/config"
import type { ContentItem } from "@/lib/content/types"
import { formatDate, formatNumber } from "@/lib/format"
import { site } from "@/lib/site"

/**
 * The AI agent in the right sidebar. It chats about your content, using the
 * library as context. It can't change anything: it only answers.
 */

export const AGENT_NAME = "AI Agent"

/** Limits on what the browser can send, so one request can't get out of hand. */
const MAX_MESSAGES = 40
const MAX_MESSAGE_LENGTH = 4000
/** How many pieces the agent sees, newest first. */
const LIBRARY_LIMIT = 80

export type AgentTurn = { role: "user" | "assistant"; content: string }

/** Checks the conversation sent by the browser. */
export function parseConversation(
  input: unknown
): { ok: true; turns: AgentTurn[] } | { ok: false; error: string } {
  const messages = (input as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Type a message first." }
  }

  const turns: AgentTurn[] = []
  for (const message of messages.slice(-MAX_MESSAGES)) {
    const { role, content } = (message ?? {}) as Record<string, unknown>
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return { ok: false, error: "Something went wrong sending your message. Start a new chat." }
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, error: "That message is too long. Try a shorter one." }
    }
    if (content.trim()) turns.push({ role, content })
  }

  if (turns.at(-1)?.role !== "user") {
    return { ok: false, error: "Type a message first." }
  }
  return { ok: true, turns }
}

/** One line per piece, e.g. "- Blog post · Published Sep 2, 2026 · 1,975 views · "Five mistakes…"". */
function describeLibrary(items: ContentItem[]) {
  if (items.length === 0) return "The library is empty."

  const newest = [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, LIBRARY_LIMIT)

  return newest
    .map((item) => {
      const parts = [
        TYPE_CONFIG[item.type].label,
        `${STATUS_CONFIG[item.status].label} ${formatDate(item.publishedAt ?? item.createdAt)}`,
      ]
      if (item.views != null) parts.push(`${formatNumber(item.views)} views`)
      if (item.opens != null) parts.push(`${formatNumber(item.opens)} opens`)
      return `- ${parts.join(" · ")} · "${item.title}"`
    })
    .join("\n")
}

export function buildAgentMessages(
  turns: AgentTurn[],
  items: ContentItem[],
  now: Date
): ChatMessage[] {
  const system = `You are the ${AGENT_NAME} inside ${site.name}, an app where an independent consultant writes blog posts, newsletters and short videos with AI, and tracks how they do.

Help them plan, write and improve their content. Brainstorm ideas, suggest titles and hooks, outline pieces, and answer questions about their library and its numbers.

Rules:
- Be brief and practical. Plain English, short paragraphs or short lists. Markdown is fine.
- Use the library below for anything about their content. Never invent pieces or numbers. If something isn't there, say so.
- Views and opens are typed in by hand, so pieces without numbers just haven't been filled in.
- You can't change anything in the app. To make a piece, point them to Blog post, Newsletter or Video under Create in the left sidebar.

Today is ${formatDate(now)}.

Their library (${items.length} pieces, newest first):
${describeLibrary(items)}`

  return [{ role: "system", content: system }, ...turns]
}

/** Sample-mode answers, built from the real library, so the chat works without a key. */
export function sampleAgentReply(question: string, items: ContentItem[]) {
  const asked = question.toLowerCase()
  const note =
    "\n\n_This is a sample answer. Connect OpenRouter in Settings and I'll answer properly._"

  if (/\b(top|best|most|perform|popular)\b/.test(asked)) {
    const ranked = items
      .filter((item) => (item.views ?? item.opens ?? 0) > 0)
      .sort((a, b) => (b.views ?? b.opens ?? 0) - (a.views ?? a.opens ?? 0))
      .slice(0, 3)
    if (ranked.length === 0) {
      return `None of your pieces have views or opens entered yet, so there's nothing to rank.${note}`
    }
    const lines = ranked.map((item, index) => {
      const count = item.views != null ? `${formatNumber(item.views)} views` : `${formatNumber(item.opens ?? 0)} opens`
      return `${index + 1}. **${item.title}** (${TYPE_CONFIG[item.type].label.toLowerCase()}, ${count})`
    })
    return `Here are your best performers so far:\n\n${lines.join("\n")}${note}`
  }

  if (/\b(idea|ideas|topic|topics|write about|brainstorm)\b/.test(asked)) {
    return `Three ideas to try:\n\n1. **The tool I stopped paying for, and what replaced it.** People love honest before-and-afters.\n2. **A teardown of your best piece.** Why it worked, so readers can copy the pattern.\n3. **One client question, answered in full.** Turn a question you hear every week into a guide.${note}`
  }

  const drafts = items.filter((item) => item.status === "draft").length
  const published = items.filter((item) => item.status === "published").length
  return `You have ${items.length} pieces in your library: ${published} published and ${drafts} still in draft.\n\nAsk me for ideas, or which pieces are doing best.${note}`
}
