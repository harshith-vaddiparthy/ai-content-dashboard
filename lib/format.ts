/**
 * Number and date formatting, always in US English so the server and the
 * browser produce identical text. Dates are formatted on the server and passed
 * to client components as plain strings.
 */

const numberFormat = new Intl.NumberFormat("en-US")
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})
const shortDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})
const relativeFormat = new Intl.RelativeTimeFormat("en-US", {
  numeric: "auto",
})

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** 12345 → "12,345" */
export function formatNumber(value: number) {
  return numberFormat.format(value)
}

/** (1, "piece") → "1 piece", (40, "piece") → "40 pieces" */
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${numberFormat.format(count)} ${count === 1 ? singular : plural}`
}

/** 12345 → "12.3K" */
export function formatCompact(value: number) {
  return compactFormat.format(value)
}

/** → "Oct 3, 2026" */
export function formatDate(value: string | Date) {
  return dateFormat.format(new Date(value))
}

/** → "Oct 3" */
export function formatShortDate(value: string | Date) {
  return shortDateFormat.format(new Date(value))
}

/** → "3 hours ago", "yesterday", "2 weeks ago", then a plain date after a month. */
export function formatRelative(value: string | Date, now: Date) {
  const diff = new Date(value).getTime() - now.getTime()
  const abs = Math.abs(diff)

  if (abs < MINUTE) return "just now"
  if (abs < HOUR) return relativeFormat.format(Math.round(diff / MINUTE), "minute")
  if (abs < DAY) return relativeFormat.format(Math.round(diff / HOUR), "hour")
  if (abs < 7 * DAY) return relativeFormat.format(Math.round(diff / DAY), "day")
  if (abs < 30 * DAY) {
    return relativeFormat.format(Math.round(diff / (7 * DAY)), "week")
  }
  return formatDate(value)
}

/** 0.125 → "+12.5%", -0.04 → "-4%" */
export function formatChange(change: number) {
  const percent = Math.round(change * 1000) / 10
  return `${percent > 0 ? "+" : ""}${percent}%`
}

/** 0.583 → "58%" */
export function formatPercent(share: number) {
  return `${Math.round(share * 100)}%`
}
