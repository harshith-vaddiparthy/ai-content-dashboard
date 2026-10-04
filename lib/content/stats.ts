import { formatShortDate } from "@/lib/format"
import {
  CONTENT_TYPES,
  type ContentItem,
  type ContentStatus,
  type ContentType,
} from "@/lib/content/types"

/**
 * Dashboard numbers, worked out from the library. Pure: same items + same "now" → same result.
 *
 * "Created" and "Published" count everything that happened, archived or not.
 * Everything else (reach, mix, pipeline, top performers) only looks at what's
 * still in the library, so the numbers match what you see there.
 */

const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY
export const ACTIVITY_WEEKS = 26
const TOP_PER_TYPE = 4

type Trend = {
  /** Fractional change vs. the previous period (0.25 = +25%), or null if there's nothing to compare against. */
  change: number | null
}

export type DashboardData = {
  created: Trend & { last30: number; prev30: number; total: number }
  published: Trend & { last30: number; prev30: number; live: number; liveShare: number }
  views: { total: number; tracked: number; average: number; best: Ranked | null }
  opens: Trend & { average: number; issues: number; latest: Ranked | null }
  /** Oldest week first. */
  activity: { week: string; created: number; published: number }[]
  mix: { type: ContentType; count: number }[]
  /** Work that isn't out yet. "Failed" only shows up when something failed. */
  pipeline: { status: ContentStatus; count: number }[]
  /** Best first. Views for blog posts and videos, opens for newsletters. */
  topPerforming: Record<ContentType, Ranked[]>
  isEmpty: boolean
}

export type Ranked = {
  id: string
  type: ContentType
  title: string
  value: number
  unit: "views" | "opens"
}

function change(current: number, previous: number) {
  return previous === 0 ? null : (current - previous) / previous
}

function within(iso: string | null, from: number, to: number) {
  if (!iso) return false
  const time = new Date(iso).getTime()
  return time > from && time <= to
}

function reach(item: ContentItem): Ranked | null {
  const value = item.type === "newsletter" ? item.opens : item.views
  if (value == null) return null
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    value,
    unit: item.type === "newsletter" ? "opens" : "views",
  }
}

export type Performance = {
  unit: "views" | "opens"
  value: number | null
  /** 1 is the best of its type. Null until this piece has a number. */
  rank: number | null
  /** Pieces of this type with numbers, this one included. */
  ranked: number
  /** Average of the other pieces of this type, or null if none of them have numbers. */
  average: number | null
  others: number
}

/** How one piece is doing next to the others of its type. Archived pieces are left out, like on the dashboard. */
export function buildPerformance(item: ContentItem, items: ContentItem[]): Performance {
  const own = reach(item)
  const others = items
    .filter((other) => other.id !== item.id && other.type === item.type && other.status !== "archived")
    .map(reach)
    .filter((row): row is Ranked => row != null)

  return {
    unit: item.type === "newsletter" ? "opens" : "views",
    value: own?.value ?? null,
    rank: own ? 1 + others.filter((row) => row.value > own.value).length : null,
    ranked: others.length + (own ? 1 : 0),
    average: others.length
      ? others.reduce((sum, row) => sum + row.value, 0) / others.length
      : null,
    others: others.length,
  }
}

export function buildDashboard(items: ContentItem[], now: Date): DashboardData {
  const nowMs = now.getTime()
  const days30 = nowMs - 30 * DAY
  const days60 = nowMs - 60 * DAY
  const active = items.filter((item) => item.status !== "archived")

  // Created and published, last 30 days vs. the 30 before.
  const createdLast30 = items.filter((i) => within(i.createdAt, days30, nowMs)).length
  const createdPrev30 = items.filter((i) => within(i.createdAt, days60, days30)).length
  const publishedLast30 = items.filter((i) => within(i.publishedAt, days30, nowMs)).length
  const publishedPrev30 = items.filter((i) => within(i.publishedAt, days60, days30)).length
  const live = active.filter((i) => i.status === "published").length

  // Views: blog posts and videos with numbers entered.
  const viewed = active.filter((i) => i.type !== "newsletter" && i.views != null)
  const totalViews = viewed.reduce((sum, i) => sum + (i.views ?? 0), 0)
  const bestViewed = viewed.reduce<ContentItem | null>(
    (best, i) => (best == null || (i.views ?? 0) > (best.views ?? 0) ? i : best),
    null
  )

  // Opens: newsletter issues, newest first. Trend = last 3 issues vs. the 3 before.
  const issues = active
    .filter((i) => i.type === "newsletter" && i.opens != null && i.publishedAt)
    .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))
  const opens = issues.map((i) => i.opens ?? 0)
  const average = (values: number[]) =>
    values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
  const recentOpens = opens.slice(0, 3)
  const earlierOpens = opens.slice(3, 6)

  // Weekly activity, oldest first. Each bucket ends on "now", so there's no partial week.
  const activity = Array.from({ length: ACTIVITY_WEEKS }, (_, index) => {
    const weeksAgo = ACTIVITY_WEEKS - 1 - index
    const end = nowMs - weeksAgo * WEEK
    const start = end - WEEK
    return {
      week: formatShortDate(new Date(start + DAY)),
      created: items.filter((i) => within(i.createdAt, start, end)).length,
      published: items.filter((i) => within(i.publishedAt, start, end)).length,
    }
  })

  const mix = CONTENT_TYPES.map((type) => ({
    type,
    count: active.filter((i) => i.type === type).length,
  }))

  const pipelineOrder: ContentStatus[] = ["draft", "processing", "ready", "failed"]
  const pipeline = pipelineOrder
    .map((status) => ({
      status,
      count: active.filter((i) => i.status === status).length,
    }))
    .filter((row) => row.count > 0 || row.status !== "failed")

  // Views and opens aren't comparable, so each type gets its own ranking.
  const ranked = active
    .map(reach)
    .filter((row): row is Ranked => row != null)
    .sort((a, b) => b.value - a.value)
  const topPerforming = Object.fromEntries(
    CONTENT_TYPES.map((type) => [
      type,
      ranked.filter((row) => row.type === type).slice(0, TOP_PER_TYPE),
    ])
  ) as Record<ContentType, Ranked[]>

  return {
    created: {
      last30: createdLast30,
      prev30: createdPrev30,
      total: active.length,
      change: change(createdLast30, createdPrev30),
    },
    published: {
      last30: publishedLast30,
      prev30: publishedPrev30,
      live,
      liveShare: active.length ? live / active.length : 0,
      change: change(publishedLast30, publishedPrev30),
    },
    views: {
      total: totalViews,
      tracked: viewed.length,
      average: viewed.length ? totalViews / viewed.length : 0,
      best: bestViewed ? reach(bestViewed) : null,
    },
    opens: {
      average: average(opens),
      issues: issues.length,
      latest: issues[0] ? reach(issues[0]) : null,
      change:
        earlierOpens.length === 3
          ? change(average(recentOpens), average(earlierOpens))
          : null,
    },
    activity,
    mix,
    pipeline,
    topPerforming,
    isEmpty: items.length === 0,
  }
}
