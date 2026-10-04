import "server-only"

import {
  VIDEO_FORMATS,
  VIDEO_STYLES,
  type Brief,
  type TextBrief,
  type Tone,
  type VideoBrief,
} from "@/lib/content/brief"

/**
 * Sample mode: what the generator writes before OpenRouter is connected.
 * The drafts are templates built from your brief, streamed in word by word
 * so the whole flow (write, edit, save) can be tried without an API key.
 */

const SAMPLE_NOTE =
  "_This is a sample draft. Connect OpenRouter (see Settings) to write real drafts with AI._"

const DEFAULT_READERS = "Solo consultants and builders"

/** One tidy line from the topic, used as the title. */
function titleFrom(topic: string, maxLength = 80) {
  const line = topic.replace(/\s+/g, " ").trim().replace(/[.!?:;,]+$/, "")
  const short =
    line.length > maxLength ? `${line.slice(0, maxLength).replace(/\s+\S*$/, "")}…` : line
  return short.charAt(0).toUpperCase() + short.slice(1)
}

function readers(brief: Brief) {
  return brief.audience.replace(/\s+/g, " ").trim() || DEFAULT_READERS
}

function lowerFirst(text: string) {
  // Leave acronyms like "AI" alone.
  return /^[A-Z]{2}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1)
}

const OPENERS: Record<Tone, (who: string) => string> = {
  friendly: (who) =>
    `${who} ask me about this all the time, so here's my honest take. No hype, just what has actually worked for me.`,
  professional: (who) =>
    `This comes up in almost every conversation I have with ${lowerFirst(who)}. Here is a practical way to approach it.`,
  bold: (who) =>
    `Most advice on this is wrong, or at least far more complicated than it needs to be. Here's what actually works for ${lowerFirst(who)}.`,
  witty: () =>
    "Good news: this is simpler than the internet makes it look. Better news: you can start today, before your coffee goes cold.",
}

function blogDraft(brief: TextBrief) {
  return [
    `# ${titleFrom(brief.topic)}`,
    OPENERS[brief.tone](readers(brief)),
    "## Start with the outcome",
    "Before picking tools or tactics, write down what “good” looks like in one sentence. Everything gets easier once that's clear, because you can say no to anything that doesn't move you toward it.",
    "## Keep the system small",
    "The setups that last are boring. One place to capture ideas, one routine to turn them into work, and one check-in each week to see what's working. Add more only when something actually breaks.",
    "## Make it repeatable",
    [
      "1. Pick one small part of this to improve first.",
      "2. Do it the same way three times and write down the steps.",
      "3. Turn those steps into a checklist or template you can reuse.",
    ].join("\n"),
    "## What I'd do this week",
    "Try one idea from this post before Friday and keep a note of what happened. Next week, do it again with one improvement. That's the whole trick.",
    SAMPLE_NOTE,
  ].join("\n\n")
}

function newsletterDraft(brief: TextBrief) {
  return [
    `# ${titleFrom(brief.topic, 58)}`,
    "Hi there,",
    OPENERS[brief.tone](readers(brief)),
    "## What I'm thinking about",
    "Most of the progress I've made here came from doing less, more consistently. A short routine I actually follow beats a perfect plan I abandon by Wednesday.",
    "## Three things worth trying",
    [
      "1. **Write the outcome first.** One sentence on what “done” looks like.",
      "2. **Reuse what works.** Save the steps you repeat as a template.",
      "3. **Review on Fridays.** Ten minutes on what to keep and what to drop.",
    ].join("\n"),
    "## One question for you",
    "Which part of this would you most like help with? Hit reply and tell me. I read every message.",
    "Talk next week.",
    SAMPLE_NOTE,
  ].join("\n\n")
}

const SHOTS: Record<VideoBrief["style"], [string, string, string, string]> = {
  presenter: [
    "Close-up. The presenter looks straight into the camera.",
    "Medium shot. The presenter counts the points off on their fingers.",
    "The presenter beside a simple checklist graphic.",
    "The presenter smiles and points to the follow button.",
  ],
  cinematic: [
    "Slow push-in on a laptop on a sunlit desk.",
    "Hands sketching a plan in a notebook, then typing.",
    "Wide shot of a calm, organized workspace.",
    "Coffee cup set down beside the closed laptop. End card.",
  ],
  animated: [
    "The title punches in, word by word, on a warm background.",
    "Three icons pop in one at a time as the steps are named.",
    "A simple diagram builds itself: idea, routine, review.",
    "End card with a friendly follow prompt.",
  ],
}

/** Scene timings: a 3-second hook, then the rest split into three parts. */
function sceneTimings(duration: number) {
  const step = (duration - 3) / 3
  const marks = [0, 3, 3 + step, 3 + 2 * step, duration].map(Math.round)
  return marks.slice(0, -1).map((start, index) => `${start}–${marks[index + 1]}s`)
}

function videoDraft(brief: VideoBrief) {
  const title = titleFrom(brief.topic, 70)
  const style = VIDEO_STYLES.find((option) => option.value === brief.style)!
  const format = VIDEO_FORMATS.find((option) => option.value === brief.format)!
  const shots = SHOTS[brief.style]
  const timings = sceneTimings(brief.duration)
  const lines = [
    `${title}, in ${brief.duration} seconds.`,
    "First, decide what you want people to do afterwards. One clear goal beats five vague ones.",
    "Then keep it simple: one idea, one example, one next step.",
    "Try it this week, and follow for more ideas like this.",
  ]

  return [
    `# ${title}`,
    `**Format:** ${format.label} ${format.ratio} · ${brief.duration} seconds · ${style.label}`,
    `**Hook:** “${lines[0]}”`,
    "**Scenes**",
    shots
      .map(
        (shot, index) =>
          `${index + 1}. **${timings[index]}.** ${shot} Voiceover: “${lines[index]}”`
      )
      .join("\n"),
    `**On-screen text:** “${title}” → “One clear goal” → “One idea, one example, one step” → “Follow for more”`,
    `**Music and mood:** ${brief.tone === "professional" ? "Calm, minimal piano. Clean and confident." : "Upbeat, warm acoustic track. Light and encouraging."}`,
    "**Call to action:** Follow for one practical idea a week.",
    SAMPLE_NOTE.replace("sample draft", "sample concept"),
  ].join("\n\n")
}

export function sampleDraft(brief: Brief) {
  if (brief.type === "video") return videoDraft(brief)
  if (brief.type === "newsletter") return newsletterDraft(brief)
  return blogDraft(brief)
}

/** Streams text a few words at a time, the way a real model does. */
export function streamWords(text: string, { wordsPerChunk = 3, delayMs = 30 } = {}) {
  const words = text.match(/\S+\s*/g) ?? []
  let index = 0

  return new ReadableStream<string>({
    async pull(controller) {
      if (index >= words.length) {
        controller.close()
        return
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      controller.enqueue(words.slice(index, index + wordsPerChunk).join(""))
      index += wordsPerChunk
    },
  })
}
