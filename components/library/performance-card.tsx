"use client"

import * as React from "react"
import {
  Award01Icon,
  ChartDownIcon,
  ChartUpIcon,
  RankingIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { updateContentStatsAction } from "@/app/actions/content"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import type { IconData } from "@/lib/content/config"
import type { Performance } from "@/lib/content/stats"
import { formatNumber, formatPercent, pluralize } from "@/lib/format"

/** Differences smaller than this count as "about average". */
const ABOUT_AVERAGE = 0.05

/** "12,500" or "12500" → 12500. Empty → null. Anything else → NaN. */
function parseCount(text: string) {
  const clean = text.replace(/[\s,_]/g, "")
  if (!clean) return null
  return /^\d+$/.test(clean) ? Number(clean) : NaN
}

function headline(
  performance: Performance,
  typeLabel: string,
  published: boolean
): { text: string; detail: string; icon?: IconData } {
  const { unit, value, average, others } = performance
  const type = typeLabel.toLowerCase()

  if (value == null) {
    return published
      ? { text: `No ${unit} entered yet`, detail: "Copy the latest number from where it's live." }
      : { text: "Not published yet", detail: `Add its ${unit} here once it's out.` }
  }
  if (average == null || average === 0) {
    return { text: `Your first ${type} with numbers`, detail: `Add ${unit} to others to compare.` }
  }

  const change = value / average - 1
  const detail = `Average ${formatNumber(Math.round(average))} ${unit} across ${pluralize(others, `other ${type}`)}`
  if (Math.abs(change) < ABOUT_AVERAGE) return { text: `About average for a ${type}`, detail }
  return change > 0
    ? { text: `${formatPercent(change)} above your average ${type}`, detail, icon: ChartUpIcon }
    : { text: `${formatPercent(-change)} below your average ${type}`, detail, icon: ChartDownIcon }
}

/** The piece's views (or opens), how it ranks against its type, and a box to update the number. */
export function PerformanceCard({
  id,
  typeLabel,
  performance,
  published,
}: {
  id: string
  /** "Video", "Blog post" or "Newsletter". */
  typeLabel: string
  performance: Performance
  published: boolean
}) {
  const { unit, value, rank, ranked } = performance
  const Unit = unit === "opens" ? "Opens" : "Views"
  const [input, setInput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const summary = headline(performance, typeLabel, published)

  function save() {
    const text = input
    const count = parseCount(text)
    if (count == null) return
    if (Number.isNaN(count)) {
      setError("Use a whole number, like 1250.")
      return
    }

    setError(null)
    // Clearing right away means a blur and an Enter in quick succession only save once.
    setInput("")
    startTransition(async () => {
      const result = await updateContentStatsAction(id, { [unit]: count })
      if (result.ok) {
        toast.success(`${Unit} updated to ${formatNumber(count)}`)
      } else {
        setError(result.error)
        setInput(text)
      }
    })
  }

  return (
    <Card className="@container/card bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
      <CardHeader>
        <CardDescription>{Unit}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value != null ? formatNumber(value) : "—"}
        </CardTitle>
        {rank != null && ranked > 1 && (
          <CardAction>
            <Badge variant="outline" className="tabular-nums">
              <HugeiconsIcon icon={rank === 1 ? Award01Icon : RankingIcon} strokeWidth={2} />
              #{rank} of {ranked}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="performance-count">Update {unit}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="performance-count"
                inputMode="numeric"
                autoComplete="off"
                placeholder={value != null ? formatNumber(value) : "e.g. 1,250"}
                value={input}
                aria-invalid={error ? true : undefined}
                onChange={(event) => {
                  setInput(event.target.value)
                  setError(null)
                }}
                onBlur={save}
              />
              <InputGroupAddon align="inline-end">
                {/* No disabled button in here: a disabled control grays out the whole group. */}
                {pending ? (
                  <Spinner aria-label="Saving" />
                ) : input.trim() ? (
                  <InputGroupButton type="submit">Save</InputGroupButton>
                ) : (
                  <InputGroupText>{unit}</InputGroupText>
                )}
              </InputGroupAddon>
            </InputGroup>
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription>
                Type the latest total. It saves when you press Enter or click away.
              </FieldDescription>
            )}
          </Field>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex max-w-full items-center gap-2 font-medium">
          <span className="truncate">{summary.text}</span>
          {summary.icon && (
            <HugeiconsIcon icon={summary.icon} strokeWidth={2} className="size-4 shrink-0" />
          )}
        </div>
        <div className="text-muted-foreground">{summary.detail}</div>
      </CardFooter>
    </Card>
  )
}
