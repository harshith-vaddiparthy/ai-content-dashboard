import { formatDate, formatNumber, formatRelative } from "@/lib/format"
import type { ContentItem, ContentStatus, ContentType } from "@/lib/content/types"

/**
 * One line in a content table, with every date already turned into text on
 * the server, so the browser shows exactly what the server worked out.
 */
export type ContentRow = {
  id: string
  type: ContentType
  title: string
  status: ContentStatus
  /** "5,940 views", "1,185 opens", or null if no numbers were entered. */
  reach: string | null
  /** "2 days ago" */
  updated: string
  /** "Oct 3, 2026" */
  created: string
}

export function reachLabel(item: Pick<ContentItem, "type" | "views" | "opens">) {
  const value = item.type === "newsletter" ? item.opens : item.views
  if (value == null) return null
  return `${formatNumber(value)} ${item.type === "newsletter" ? "opens" : "views"}`
}

export function toContentRow(item: ContentItem, now: Date): ContentRow {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    status: item.status,
    reach: reachLabel(item),
    updated: formatRelative(item.updatedAt, now),
    created: formatDate(item.createdAt),
  }
}
