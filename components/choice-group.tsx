"use client"

import { HugeiconsIcon } from "@hugeicons/react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { IconData } from "@/lib/content/config"
import { cn } from "@/lib/utils"

export type Choice<T extends string> = {
  value: T
  label: string
  icon?: IconData
}

/**
 * Pick one option from a short list. Every option stays visible (no dropdown),
 * and the chosen one is filled with the theme's secondary color.
 */
export function ChoiceGroup<T extends string>({
  value,
  onValueChange,
  options,
  label,
  spacing,
  size,
  disabled,
  className,
  itemClassName,
  iconLabelClassName,
}: {
  value: T
  onValueChange: (value: T) => void
  options: readonly Choice<T>[]
  /** Read out by screen readers, since the visible label sits outside the group. */
  label: string
  spacing?: number
  size?: "default" | "sm" | "lg"
  disabled?: boolean
  className?: string
  itemClassName?: string
  /** Classes for the label of options that have an icon, e.g. to show only the icon on small screens. */
  iconLabelClassName?: string
}) {
  return (
    <ToggleGroup
      variant="outline"
      size={size}
      spacing={spacing}
      value={[value]}
      onValueChange={(next) => {
        // Clicking the chosen option again would clear it. Keep it chosen instead.
        const picked = options.find((option) => option.value === next[0])
        if (picked) onValueChange(picked.value)
      }}
      disabled={disabled}
      aria-label={label}
      className={cn("flex-wrap", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            "aria-pressed:border-primary/30 aria-pressed:bg-secondary aria-pressed:text-secondary-foreground",
            itemClassName
          )}
        >
          {option.icon && (
            <HugeiconsIcon icon={option.icon} strokeWidth={2} data-icon="inline-start" />
          )}
          <span className={option.icon ? iconLabelClassName : undefined}>{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
