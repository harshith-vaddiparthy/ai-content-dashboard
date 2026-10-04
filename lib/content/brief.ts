import type { ContentType } from "@/lib/content/types"

/**
 * The brief you fill in before the AI writes anything. Shared by the forms in
 * the browser and the API route on the server, so both agree on what's valid.
 */

export const TONES = [
  { value: "friendly", label: "Friendly", hint: "Warm and conversational" },
  { value: "professional", label: "Professional", hint: "Clear and credible" },
  { value: "bold", label: "Bold", hint: "Confident, with strong opinions" },
  { value: "witty", label: "Witty", hint: "Light and a little playful" },
] as const

export const LENGTHS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const

/** Roughly how many words each length means. */
export const TARGET_WORDS = {
  blog: { short: 600, medium: 1200, long: 2000 },
  newsletter: { short: 300, medium: 600, long: 1000 },
} as const

export const VIDEO_STYLES = [
  {
    value: "presenter",
    label: "Presenter",
    hint: "An AI presenter talks to camera",
  },
  {
    value: "cinematic",
    label: "Cinematic",
    hint: "Real-looking footage with a voiceover",
  },
  {
    value: "animated",
    label: "Animated",
    hint: "A motion-graphics explainer",
  },
] as const

export const VIDEO_FORMATS = [
  {
    value: "vertical",
    label: "Vertical",
    ratio: "9:16",
    aspect: 9 / 16,
    hint: "Reels, TikTok, Shorts",
  },
  {
    value: "landscape",
    label: "Landscape",
    ratio: "16:9",
    aspect: 16 / 9,
    hint: "YouTube, websites",
  },
  {
    value: "square",
    label: "Square",
    ratio: "1:1",
    aspect: 1,
    hint: "LinkedIn, feeds",
  },
] as const

export const VIDEO_DURATIONS = [15, 30, 60] as const

/** Roughly how many words of voiceover fit in a video this long, at a relaxed speaking pace. */
export function voiceoverWords(seconds: number) {
  return Math.round(seconds * 2.5)
}

export const BRIEF_LIMITS = { topic: 500, audience: 200, notes: 2000 } as const

export type Tone = (typeof TONES)[number]["value"]
export type Length = (typeof LENGTHS)[number]["value"]
export type VideoStyle = (typeof VIDEO_STYLES)[number]["value"]
export type VideoFormat = (typeof VIDEO_FORMATS)[number]["value"]
export type VideoDuration = (typeof VIDEO_DURATIONS)[number]

type BriefBase = {
  topic: string
  /** Who it's for. Optional. */
  audience: string
  tone: Tone
  /** Anything else the writer should know. Optional. */
  notes: string
}

export type TextBrief = BriefBase & {
  type: "blog" | "newsletter"
  length: Length
}

export type VideoBrief = BriefBase & {
  type: "video"
  style: VideoStyle
  format: VideoFormat
  duration: VideoDuration
}

export type Brief = TextBrief | VideoBrief

export function defaultTextBrief(type: TextBrief["type"]): TextBrief {
  return { type, topic: "", audience: "", tone: "friendly", length: "medium", notes: "" }
}

export function defaultVideoBrief(): VideoBrief {
  return {
    type: "video",
    topic: "",
    audience: "",
    tone: "friendly",
    style: "presenter",
    format: "vertical",
    duration: 30,
    notes: "",
  }
}

export function isTextType(type: ContentType): type is TextBrief["type"] {
  return type === "blog" || type === "newsletter"
}

type ParseResult = { ok: true; brief: Brief } | { ok: false; error: string }

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

/** Returns `value` if it's one of the allowed options, otherwise undefined. */
function pick<const T extends string | number>(
  options: readonly ({ readonly value: T } | T)[],
  value: unknown
): T | undefined {
  for (const option of options) {
    const candidate = typeof option === "object" ? option.value : option
    if (candidate === value) return candidate
  }
  return undefined
}

/** Checks a brief sent from the browser. Never trust it as-is. */
export function parseBrief(input: unknown): ParseResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Something went wrong sending your brief. Try again." }
  }

  const data = input as Record<string, unknown>
  const topic = text(data.topic)
  const audience = text(data.audience)
  const notes = text(data.notes)
  const tone = pick(TONES, data.tone)

  if (!topic) {
    return { ok: false, error: "Add a topic so the AI knows what to write about." }
  }
  if (topic.length > BRIEF_LIMITS.topic) {
    return { ok: false, error: `Keep the topic under ${BRIEF_LIMITS.topic} characters.` }
  }
  if (audience.length > BRIEF_LIMITS.audience) {
    return { ok: false, error: `Keep the audience under ${BRIEF_LIMITS.audience} characters.` }
  }
  if (notes.length > BRIEF_LIMITS.notes) {
    return { ok: false, error: `Keep the notes under ${BRIEF_LIMITS.notes} characters.` }
  }
  if (!tone) return { ok: false, error: "Pick a tone." }

  if (data.type === "blog" || data.type === "newsletter") {
    const length = pick(LENGTHS, data.length)
    if (!length) return { ok: false, error: "Pick a length." }
    return { ok: true, brief: { type: data.type, topic, audience, tone, length, notes } }
  }

  if (data.type === "video") {
    const style = pick(VIDEO_STYLES, data.style)
    const format = pick(VIDEO_FORMATS, data.format)
    const duration = pick(VIDEO_DURATIONS, data.duration)
    if (!style) return { ok: false, error: "Pick a video style." }
    if (!format) return { ok: false, error: "Pick a video format." }
    if (!duration) return { ok: false, error: "Pick a video length." }
    return {
      ok: true,
      brief: { type: "video", topic, audience, tone, style, format, duration, notes },
    }
  }

  return { ok: false, error: "Choose what to create: a blog post, a newsletter or a video." }
}
