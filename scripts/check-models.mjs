/**
 * Checks the writing models in lib/ai/models.ts against OpenRouter's live
 * model list. Runs in CI (.github/workflows/ci.yml), and with
 * `npm run check:models`. No API key needed: the model list is public.
 *
 * Fails when a model id is gone or about to be retired (drafts would break).
 * Warns when OpenRouter's price no longer matches the one shown in Settings.
 *
 * Needs Node 22.18+ (it reads models.ts directly).
 */
import { WRITING_MODELS } from "../lib/ai/models.ts"

const MODELS_URL = "https://openrouter.ai/api/v1/models"
const DAY_MS = 24 * 60 * 60 * 1000
/** Retiring sooner than this fails the check. */
const FAIL_WITHIN_DAYS = 14

const response = await fetch(MODELS_URL, { signal: AbortSignal.timeout(20_000) })
if (!response.ok) {
  console.error(`Couldn't load ${MODELS_URL} (HTTP ${response.status}).`)
  process.exit(1)
}
const { data } = await response.json()
const live = new Map(data.map((model) => [model.id, model]))

let failed = false
const now = Date.now()

for (const model of WRITING_MODELS) {
  const found = live.get(model.id)
  if (!found) {
    console.error(`✗ ${model.id} is no longer on OpenRouter. Replace it in lib/ai/models.ts.`)
    failed = true
    continue
  }

  if (found.expiration_date) {
    const days = Math.ceil((Date.parse(found.expiration_date) - now) / DAY_MS)
    const message = `${model.id} retires on ${found.expiration_date} (in ${days} days).`
    if (days <= FAIL_WITHIN_DAYS) {
      console.error(`✗ ${message} Replace it in lib/ai/models.ts.`)
      failed = true
      continue
    } else {
      console.warn(`! ${message}`)
    }
  }

  // OpenRouter lists dollars per token; models.ts uses dollars per million.
  const input = round(Number(found.pricing?.prompt) * 1_000_000)
  const output = round(Number(found.pricing?.completion) * 1_000_000)
  if (input !== model.price.input || output !== model.price.output) {
    console.warn(
      `! ${model.id} now costs $${input} in / $${output} out per million tokens ` +
        `(models.ts says $${model.price.input} / $${model.price.output}).`
    )
  }

  console.log(`✓ ${model.id}`)
}

function round(value) {
  return Math.round(value * 10_000) / 10_000
}

process.exit(failed ? 1 : 0)
