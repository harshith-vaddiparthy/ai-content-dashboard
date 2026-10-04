export const CONTENT_TYPES = ["blog", "newsletter", "video"] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const CONTENT_STATUSES = [
  "draft",
  "processing",
  "ready",
  "published",
  "archived",
  "failed",
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export type ContentItem = {
  id: string
  type: ContentType
  title: string
  /** Markdown body for blog posts and newsletters; the concept/script for videos. */
  body: string
  /** OpenRouter model id that wrote the text, if it was AI-generated. */
  model: string | null
  /** Rendered video file, once Higgsfield has produced one. */
  videoUrl: string | null
  status: ContentStatus
  /** ISO 8601 timestamps. */
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  /** Manual stats the user types in after publishing. */
  views: number | null
  opens: number | null
}

export function isContentType(value: unknown): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType)
}

export function isContentStatus(value: unknown): value is ContentStatus {
  return CONTENT_STATUSES.includes(value as ContentStatus)
}
