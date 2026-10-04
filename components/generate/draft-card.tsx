"use client"

import * as React from "react"
import {
  Alert02Icon,
  Copy01Icon,
  FloppyDiskIcon,
  InformationCircleIcon,
  StopIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { copyAsMarkdown } from "@/lib/clipboard"
import { TYPE_CONFIG } from "@/lib/content/config"
import { countWords, readingMinutes } from "@/lib/content/text"
import type { ContentType } from "@/lib/content/types"
import { pluralize } from "@/lib/format"
import { cn } from "@/lib/utils"

export type DraftText = { title: string; body: string }

/** idle: nothing written yet. writing: words are arriving. draft: finished or stopped, ready to edit. */
export type DraftView = "idle" | "writing" | "draft"

const LABELS: Record<
  ContentType,
  { card: string; noun: string; write: string; title: string; body: string; save: string }
> = {
  blog: {
    card: "Draft",
    noun: "draft",
    write: "Write draft",
    title: "Title",
    body: "Post",
    save: "Save to library",
  },
  newsletter: {
    card: "Draft",
    noun: "draft",
    write: "Write draft",
    title: "Subject line",
    body: "Email",
    save: "Save to library",
  },
  video: {
    card: "Concept",
    noun: "concept",
    write: "Write concept",
    title: "Title",
    body: "Script",
    save: "Save concept",
  },
}

/** Within this many pixels of the bottom counts as "reading the newest words". */
const FOLLOW_SLACK = 32

/** Where the draft appears as it's written, then becomes editable before you save it. */
export function DraftCard({
  type,
  view,
  draft,
  onDraftChange,
  error,
  onRetry,
  onStop,
  saving,
  onSave,
}: {
  type: ContentType
  view: DraftView
  draft: DraftText
  onDraftChange: (draft: DraftText) => void
  error: string | null
  onRetry: () => void
  onStop: () => void
  /** True from pressing Save until the saved piece opens. */
  saving: boolean
  onSave: () => void
}) {
  const labels = LABELS[type]
  const writing = view === "writing"
  const words = countWords(draft.body)
  const titleMissing = view === "draft" && draft.title.trim() === ""

  const cardRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLTextAreaElement>(null)
  const followRef = React.useRef(true)

  // On small screens the draft sits below the brief. Bring it into view when writing starts,
  // and follow the newest words again.
  React.useEffect(() => {
    const card = cardRef.current
    if (!writing || !card) return
    followRef.current = true
    if (card.getBoundingClientRect().top > window.innerHeight - 160) {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      card.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" })
    }
  }, [writing])

  // Keep the newest words in view while it's being written, unless you've scrolled up to read.
  React.useEffect(() => {
    const body = bodyRef.current
    if (writing && body && followRef.current) body.scrollTop = body.scrollHeight
  }, [writing, draft.body])

  return (
    <form
      className={cn(
        "min-w-0",
        // An empty card on a phone is just a long scroll. It appears once writing starts.
        view === "idle" && !error && "@max-4xl/main:hidden"
      )}
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
          event.preventDefault()
          onSave()
        }
      }}
    >
      <Card ref={cardRef} className="scroll-mt-4">
        <CardHeader>
          <CardTitle>{labels.card}</CardTitle>
          <CardDescription>
            {view === "writing"
              ? "Being written now. Stop it whenever you like."
              : view === "draft"
                ? "Edit anything you like, then save it to your library"
                : "Nothing written yet"}
          </CardDescription>
          {view !== "idle" && (
            <CardAction>
              {writing ? (
                <Button type="button" variant="outline" size="sm" onClick={onStop}>
                  <HugeiconsIcon icon={StopIcon} strokeWidth={2} data-icon="inline-start" />
                  Stop
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyAsMarkdown(draft.title, draft.body)}
                >
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} data-icon="inline-start" />
                  Copy
                </Button>
              )}
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
              <AlertTitle>Couldn&apos;t write the {labels.noun}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <AlertAction>
                <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                  Try again
                </Button>
              </AlertAction>
            </Alert>
          )}

          {view === "idle" ? (
            !error && (
              <Empty className="min-h-80 border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={TYPE_CONFIG[type].icon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>Your {labels.noun} shows up here</EmptyTitle>
                  <EmptyDescription>
                    Fill in the brief and press {labels.write}. You can change every word before
                    you save it.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )
          ) : (
            <FieldGroup>
              <Field data-invalid={titleMissing || undefined}>
                <FieldLabel htmlFor="draft-title">{labels.title}</FieldLabel>
                <Input
                  id="draft-title"
                  value={draft.title}
                  readOnly={writing}
                  maxLength={200}
                  aria-invalid={titleMissing || undefined}
                  onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
                />
                {titleMissing && <FieldError>Give it a title first.</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="draft-body">{labels.body}</FieldLabel>
                <Textarea
                  ref={bodyRef}
                  id="draft-body"
                  value={draft.body}
                  readOnly={writing}
                  aria-busy={writing}
                  className="max-h-[60svh] min-h-72 leading-relaxed"
                  onChange={(event) => onDraftChange({ ...draft, body: event.target.value })}
                  onScroll={(event) => {
                    const box = event.currentTarget
                    followRef.current =
                      box.scrollHeight - box.scrollTop - box.clientHeight < FOLLOW_SLACK
                  }}
                />
                <FieldDescription>
                  Formatting uses Markdown: ## for a heading, - for a list, **bold** for emphasis.
                </FieldDescription>
              </Field>
            </FieldGroup>
          )}

          {type === "video" && view === "draft" && (
            <Alert>
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
              <AlertTitle>Making the video file is coming soon</AlertTitle>
              <AlertDescription>
                Save the concept now and use it with any video tool. Once Higgsfield is connected,
                it&apos;ll turn concepts like this into a finished video.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        {view !== "idle" && (
          <CardFooter className="flex-wrap justify-between gap-3">
            <p className="text-sm text-muted-foreground tabular-nums">
              {pluralize(words, "word")}
              {writing ? " so far" : type !== "video" && ` · ${readingMinutes(words)} min read`}
            </p>
            {view === "draft" && (
              <Button type="submit" disabled={saving || titleMissing}>
                {saving ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} data-icon="inline-start" />
                )}
                {saving ? "Saving…" : labels.save}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </form>
  )
}
