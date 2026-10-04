/**
 * The writing models you can pick in Settings. Every one is reached through
 * OpenRouter, so a single OpenRouter key covers them all.
 *
 * Prices are OpenRouter's, in US dollars per million tokens (checked
 * October 2026). Update this list when better models come out. The ids must
 * match OpenRouter's model ids exactly.
 */

export type WritingModel = {
  id: string
  name: string
  provider: string
  description: string
  tag?: "Recommended" | "Premium" | "Fast" | "Budget"
  price: { input: number; output: number }
}

export const WRITING_MODELS = [
  {
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    provider: "Anthropic",
    description:
      "Natural, well-organized writing that sounds like a person. The best all-rounder.",
    tag: "Recommended",
    price: { input: 2, output: 10 },
  },
  {
    id: "anthropic/claude-opus-5.5",
    name: "Claude Opus 5.5",
    provider: "Anthropic",
    description:
      "More careful and nuanced on complex topics. A little slower, about twice the cost.",
    tag: "Premium",
    price: { input: 4, output: 20 },
  },
  {
    id: "anthropic/claude-fable-5.1",
    name: "Claude Fable 5.1",
    provider: "Anthropic",
    description:
      "Anthropic's most powerful model. More than most posts need, and the priciest.",
    price: { input: 10, output: 50 },
  },
  {
    id: "openai/gpt-6.1-sol",
    name: "GPT-6.1 Sol",
    provider: "OpenAI",
    description: "Punchy, confident writing with a slightly different voice.",
    price: { input: 2, output: 10 },
  },
  {
    id: "google/gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "Google",
    description: "Very quick and cheap. Good for fast first drafts.",
    tag: "Fast",
    price: { input: 0.75, output: 3.75 },
  },
  {
    id: "deepseek/deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash",
    provider: "DeepSeek",
    description: "The cheapest option. Fine for rough ideas and outlines.",
    tag: "Budget",
    price: { input: 0.3, output: 1.2 },
  },
] as const satisfies readonly WritingModel[]

export type ModelId = (typeof WRITING_MODELS)[number]["id"]

export const DEFAULT_MODEL_ID: ModelId = "anthropic/claude-sonnet-5.5"

/** Cookie that remembers the model picked in Settings. */
export const MODEL_COOKIE = "writing_model"

export function isModelId(value: unknown): value is ModelId {
  return WRITING_MODELS.some((model) => model.id === value)
}

/** The model with this id, or the default if the id is missing or unknown. */
export function getModel(id: string | null | undefined): WritingModel {
  return (
    WRITING_MODELS.find((model) => model.id === id) ??
    WRITING_MODELS.find((model) => model.id === DEFAULT_MODEL_ID)!
  )
}

/** A readable name for whatever model wrote an item. Falls back to the raw id. */
export function modelName(id: string | null) {
  if (!id) return null
  return WRITING_MODELS.find((model) => model.id === id)?.name ?? id
}

// A typical draft: a ~600-token brief in, a ~2,000-token draft out.
const TYPICAL_INPUT_TOKENS = 600
const TYPICAL_OUTPUT_TOKENS = 2000

/** Rough cost of one draft, e.g. "about 2¢ a draft". */
export function costPerDraft(model: WritingModel) {
  const dollars =
    (TYPICAL_INPUT_TOKENS * model.price.input +
      TYPICAL_OUTPUT_TOKENS * model.price.output) /
    1_000_000
  const cents = Math.round(dollars * 100)
  return cents < 1 ? "under 1¢ a draft" : `about ${cents}¢ a draft`
}
