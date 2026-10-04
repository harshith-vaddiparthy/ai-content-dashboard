import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/content/config"
import type { ContentStatus, ContentType } from "@/lib/content/types"
import { cn } from "@/lib/utils"

export function StatusBadge({
  status,
  className,
}: {
  status: ContentStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant={config.badge} className={className}>
      <HugeiconsIcon
        icon={config.icon}
        strokeWidth={2}
        data-icon="inline-start"
        className={cn(status === "processing" && "animate-spin")}
      />
      {config.label}
    </Badge>
  )
}

export function TypeBadge({ type, className }: { type: ContentType; className?: string }) {
  const config = TYPE_CONFIG[type]

  return (
    <Badge variant="outline" className={className}>
      <HugeiconsIcon icon={config.icon} strokeWidth={2} data-icon="inline-start" />
      {config.label}
    </Badge>
  )
}

/**
 * The content type's icon in a small rounded square, for lists and tables. Mark it
 * `decorative` when the type is already written next to it, so screen readers don't say it twice.
 */
export function TypeIcon({
  type,
  decorative = false,
  className,
}: {
  type: ContentType
  decorative?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden={decorative || undefined}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground",
        className
      )}
    >
      <HugeiconsIcon icon={TYPE_CONFIG[type].icon} strokeWidth={2} className="size-4" />
      {!decorative && <span className="sr-only">{TYPE_CONFIG[type].label}</span>}
    </div>
  )
}
