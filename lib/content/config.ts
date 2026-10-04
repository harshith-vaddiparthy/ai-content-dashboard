import {
  Alert02Icon,
  Archive02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Mail01Icon,
  PencilEdit02Icon,
  QuillWrite01Icon,
  SentIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"

import type { ContentStatus, ContentType } from "@/lib/content/types"

/** Icon data from @hugeicons/core-free-icons, rendered with <HugeiconsIcon icon={...} />. */
export type IconData = typeof QuillWrite01Icon

type TypeConfig = {
  label: string
  plural: string
  icon: IconData
  /** Chart color, built from the Caffeine theme's chart tokens. */
  color: string
}

export const TYPE_CONFIG: Record<ContentType, TypeConfig> = {
  blog: {
    label: "Blog post",
    plural: "Blog posts",
    icon: QuillWrite01Icon,
    color: "var(--chart-1)",
  },
  newsletter: {
    label: "Newsletter",
    plural: "Newsletters",
    icon: Mail01Icon,
    color: "color-mix(in oklch, var(--chart-1) 60%, var(--chart-2))",
  },
  video: {
    label: "Video",
    plural: "Videos",
    icon: Video01Icon,
    color: "color-mix(in oklch, var(--chart-1) 25%, var(--chart-2))",
  },
}

type StatusConfig = {
  label: string
  description: string
  icon: IconData
  badge: "default" | "secondary" | "outline" | "destructive"
}

export const STATUS_CONFIG: Record<ContentStatus, StatusConfig> = {
  draft: {
    label: "Draft",
    description: "Still being written or reviewed",
    icon: PencilEdit02Icon,
    badge: "outline",
  },
  processing: {
    label: "Rendering",
    description: "The video is being rendered",
    icon: Loading03Icon,
    badge: "secondary",
  },
  ready: {
    label: "Ready",
    description: "Finished and waiting to be published",
    icon: CheckmarkCircle02Icon,
    badge: "secondary",
  },
  published: {
    label: "Published",
    description: "Live and out in the world",
    icon: SentIcon,
    badge: "default",
  },
  archived: {
    label: "Archived",
    description: "Hidden from the main library",
    icon: Archive02Icon,
    badge: "outline",
  },
  failed: {
    label: "Failed",
    description: "Rendering didn't finish",
    icon: Alert02Icon,
    badge: "destructive",
  },
}
