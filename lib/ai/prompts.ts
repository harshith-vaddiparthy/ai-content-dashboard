import {
  TARGET_WORDS,
  TONES,
  VIDEO_FORMATS,
  VIDEO_STYLES,
  voiceoverWords,
  type Brief,
  type TextBrief,
  type VideoBrief,
} from "@/lib/content/brief"

/**
 * The instructions sent to the writing model. This is the place to tune the
 * voice of everything the app writes.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

const DEFAULT_AUDIENCE = "Solo consultants and builders"

const SYSTEM_PROMPT = `You are a ghostwriter for an independent consultant who builds with AI. You write in their voice: first person, plain English, specific and practical. You sound like someone who has done the work, not like a press release.

Rules:
- Reply with the finished piece only, in Markdown. No preamble and no notes about what you wrote.
- The very first line is the title, written as "# Title".
- Keep paragraphs short. Concrete examples, steps and numbers beat general advice.
- Avoid filler and AI clichés, such as "in today's fast-paced world", "delve", "game-changer", "unlock", "elevate", "leverage" and "navigate the landscape".
- Never invent statistics, quotes or client names. If an example needs detail, keep it plausible and modest.`

function briefLines(brief: Brief) {
  const tone = TONES.find((option) => option.value === brief.tone)!
  return [
    `Topic: ${brief.topic}`,
    `Audience: ${brief.audience || DEFAULT_AUDIENCE}`,
    `Tone: ${tone.label}, ${tone.hint.toLowerCase()}`,
  ]
}

function notesLine(brief: Brief) {
  return brief.notes ? [``, `Extra notes from the author: ${brief.notes}`] : []
}

function blogPrompt(brief: TextBrief) {
  return [
    "Write a blog post.",
    "",
    ...briefLines(brief),
    `Length: about ${TARGET_WORDS.blog[brief.length]} words`,
    "",
    "Structure: a title that makes the benefit clear; an opening that gets to the point in two or three sentences; three to five sections with ## headings; a short, practical close.",
    ...notesLine(brief),
  ].join("\n")
}

function newsletterPrompt(brief: TextBrief) {
  return [
    "Write an email newsletter issue.",
    "",
    ...briefLines(brief),
    `Length: about ${TARGET_WORDS.newsletter[brief.length]} words`,
    "",
    'Structure: the first line is the subject line, written as "# Subject". Keep it under 60 characters, specific, and free of clickbait. Then a one-line greeting, a short personal opening, two or three sections with ## headings or a numbered list, and a friendly sign-off.',
    "Write for an inbox: easy to scan, warm, one idea per paragraph.",
    ...notesLine(brief),
  ].join("\n")
}

function videoPrompt(brief: VideoBrief) {
  const style = VIDEO_STYLES.find((option) => option.value === brief.style)!
  const format = VIDEO_FORMATS.find((option) => option.value === brief.format)!
  return [
    "Write a concept for a short video. It will be handed to a video generator, so be visual and precise.",
    "",
    ...briefLines(brief),
    `Style: ${style.label}, ${style.hint.toLowerCase()}`,
    `Format: ${format.label} ${format.ratio}, for ${format.hint}`,
    `Length: ${brief.duration} seconds (about ${voiceoverWords(brief.duration)} words of voiceover)`,
    "",
    "Use exactly this structure:",
    "# Video title",
    `**Format:** ${format.label} ${format.ratio} · ${brief.duration} seconds · ${style.label}`,
    "**Hook:** the line for the first three seconds that stops the scroll.",
    `**Scenes**: a numbered list. Each scene gives its timing, the shot (what's on screen) and the voiceover line. Timings add up to ${brief.duration} seconds.`,
    "**On-screen text:** the captions or titles that appear, in order.",
    "**Music and mood:** one or two lines.",
    "**Call to action:** one line.",
    ...notesLine(brief),
  ].join("\n")
}

export function buildMessages(brief: Brief): ChatMessage[] {
  const prompt =
    brief.type === "video"
      ? videoPrompt(brief)
      : brief.type === "newsletter"
        ? newsletterPrompt(brief)
        : blogPrompt(brief)

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]
}
