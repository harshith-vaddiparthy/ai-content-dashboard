"use client"

import * as React from "react"
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { setContentStatusAction } from "@/app/actions/content"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { STATUS_CONFIG } from "@/lib/content/config"
import type { ContentStatus } from "@/lib/content/types"

/** The statuses you can pick. "Rendering" and "Failed" are only ever set by the video renderer. */
const CHOICES = ["draft", "ready", "published", "archived"] as const

const SAVED: Record<(typeof CHOICES)[number], string> = {
  draft: "Moved back to drafts",
  ready: "Marked as ready to publish",
  published: "Marked as published",
  archived: "Archived. It's in the Archived tab of the library.",
}

/** Move a piece through the pipeline. Picking a status saves it right away. */
export function StatusCard({ id, status }: { id: string; status: ContentStatus }) {
  const [shown, setShown] = React.useOptimistic(status)
  const [pending, startTransition] = React.useTransition()
  const rendering = status === "processing" || status === "failed"

  function choose(value: unknown) {
    const next = CHOICES.find((choice) => choice === value)
    if (!next || next === shown) return

    startTransition(async () => {
      setShown(next)
      const result = await setContentStatusAction(id, next)
      if (result.ok) toast.success(SAVED[next])
      else toast.error(result.error)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>Where this piece is in your pipeline</CardDescription>
        {pending && (
          <CardAction>
            <Spinner className="text-muted-foreground" aria-label="Saving" />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === "processing" && (
          <Alert>
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" />
            <AlertTitle>Rendering</AlertTitle>
            <AlertDescription>
              This video is being made. You can publish it once it&apos;s done.
            </AlertDescription>
          </Alert>
        )}
        {status === "failed" && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
            <AlertTitle>Rendering failed</AlertTitle>
            <AlertDescription>
              The video didn&apos;t finish. You can still edit the concept, or archive it.
            </AlertDescription>
          </Alert>
        )}
        <RadioGroup value={shown} onValueChange={choose} aria-label="Status">
          {CHOICES.map((choice) => {
            const config = STATUS_CONFIG[choice]
            // A video can only go out once it has rendered.
            const disabled = choice === "published" && rendering

            return (
              <FieldLabel key={choice} htmlFor={`status-${choice}`}>
                <Field orientation="horizontal" data-disabled={disabled || undefined}>
                  <FieldContent>
                    <FieldTitle>
                      <HugeiconsIcon
                        icon={config.icon}
                        strokeWidth={2}
                        className="size-4 text-muted-foreground"
                      />
                      {config.label}
                    </FieldTitle>
                    <FieldDescription>{config.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={choice} id={`status-${choice}`} disabled={disabled} />
                </Field>
              </FieldLabel>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
