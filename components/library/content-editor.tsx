"use client"

import * as React from "react"
import { Copy01Icon, FloppyDiskIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { updateContentAction } from "@/app/actions/content"
import { LeaveGuard } from "@/components/leave-guard"
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
import { countWords, readingMinutes } from "@/lib/content/text"
import type { ContentType } from "@/lib/content/types"
import { pluralize } from "@/lib/format"

const LABELS: Record<
  ContentType,
  { card: string; description: string; title: string; body: string }
> = {
  blog: {
    card: "Post",
    description: "Edit it here, then copy it into your blog",
    title: "Title",
    body: "Post",
  },
  newsletter: {
    card: "Newsletter",
    description: "Edit it here, then copy it into your email tool",
    title: "Subject line",
    body: "Email",
  },
  video: {
    card: "Concept",
    description: "The hook, scenes and call to action the video is made from",
    title: "Title",
    body: "Script",
  },
}

type Text = { title: string; body: string }

/** Edit a piece's title and text. Nothing changes until you save (or press ⌘S / Ctrl+S). */
export function ContentEditor({ id, type, title, body }: { id: string; type: ContentType } & Text) {
  const labels = LABELS[type]
  const [saved, setSaved] = React.useState<Text>({ title, body })
  const [draft, setDraft] = React.useState<Text>({ title, body })
  const [pending, startTransition] = React.useTransition()

  const dirty = draft.title !== saved.title || draft.body !== saved.body
  const titleMissing = draft.title.trim() === ""
  const words = countWords(draft.body)

  function save() {
    if (!dirty || titleMissing || pending) return
    const sent = draft
    const clean = { title: draft.title.trim(), body: draft.body.trim() }

    startTransition(async () => {
      const result = await updateContentAction(id, clean)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setSaved(clean)
      // Show the text as it was saved, unless you kept typing while it saved.
      setDraft((current) => (current === sent ? clean : current))
      toast.success("Changes saved")
    })
  }

  return (
    <>
      <LeaveGuard
        when={dirty}
        description="Your changes aren't saved yet. If you leave now, they're gone."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault()
            save()
          }
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{labels.card}</CardTitle>
            <CardDescription>{labels.description}</CardDescription>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyAsMarkdown(draft.title, draft.body)}
              >
                <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} data-icon="inline-start" />
                Copy
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={titleMissing || undefined}>
                <FieldLabel htmlFor="content-title">{labels.title}</FieldLabel>
                <Input
                  id="content-title"
                  value={draft.title}
                  maxLength={200}
                  aria-invalid={titleMissing || undefined}
                  onChange={(event) => {
                    const value = event.target.value
                    setDraft((current) => ({ ...current, title: value }))
                  }}
                />
                {titleMissing && <FieldError>Give it a title first.</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="content-body">{labels.body}</FieldLabel>
                <Textarea
                  id="content-body"
                  value={draft.body}
                  className="max-h-[60svh] min-h-72 leading-relaxed"
                  onChange={(event) => {
                    const value = event.target.value
                    setDraft((current) => ({ ...current, body: value }))
                  }}
                />
                <FieldDescription>
                  Formatting uses Markdown: ## for a heading, - for a list, **bold** for emphasis.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-3">
            <p className="text-sm text-muted-foreground tabular-nums">
              {pluralize(words, "word")}
              {type !== "video" && ` · ${readingMinutes(words)} min read`}
            </p>
            <div className="flex items-center gap-2">
              {dirty && (
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Unsaved changes
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!dirty || pending}
                onClick={() => setDraft(saved)}
              >
                Discard
              </Button>
              <Button type="submit" size="sm" disabled={!dirty || titleMissing || pending}>
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} data-icon="inline-start" />
                )}
                Save
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}
