"use client"

import {
  AiMagicIcon,
  RectangleHorizontalIcon,
  RectangleVerticalIcon,
  RepeatIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ChoiceGroup, type Choice } from "@/components/choice-group"
import { Button } from "@/components/ui/button"
import {
  Card,
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
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  BRIEF_LIMITS,
  LENGTHS,
  TARGET_WORDS,
  TONES,
  VIDEO_DURATIONS,
  VIDEO_FORMATS,
  VIDEO_STYLES,
  voiceoverWords,
  type Brief,
  type TextBrief,
  type VideoBrief,
  type VideoDuration,
  type VideoFormat,
} from "@/lib/content/brief"
import type { IconData } from "@/lib/content/config"
import { readingMinutes } from "@/lib/content/text"
import type { ContentType } from "@/lib/content/types"
import { formatNumber } from "@/lib/format"

const COPY: Record<
  ContentType,
  { topic: string; topicExample: string; notesExample: string; write: string }
> = {
  blog: {
    topic: "What's the post about?",
    topicExample: "e.g. How I plan a month of content in one afternoon",
    notesExample: "e.g. Mention my free planning template. Keep it practical.",
    write: "Write draft",
  },
  newsletter: {
    topic: "What's this issue about?",
    topicExample: "e.g. Three things I learned in my first year freelancing",
    notesExample: "e.g. Open with a quick story. End by asking readers to reply.",
    write: "Write draft",
  },
  video: {
    topic: "What's the video about?",
    topicExample: "e.g. One habit that saves me five hours a week",
    notesExample: "e.g. End by pointing people to the link in my bio.",
    write: "Write concept",
  },
}

const FORMAT_ICONS: Record<VideoFormat, IconData> = {
  vertical: RectangleVerticalIcon,
  landscape: RectangleHorizontalIcon,
  square: SquareIcon,
}

const FORMAT_CHOICES = VIDEO_FORMATS.map((format) => ({
  value: format.value,
  label: format.label,
  icon: FORMAT_ICONS[format.value],
}))

/** Toggle values are strings, so durations travel as "15", "30" and "60". */
type DurationChoice = `${VideoDuration}`

const DURATION_CHOICES: Choice<DurationChoice>[] = VIDEO_DURATIONS.map((seconds) => ({
  value: `${seconds}` as DurationChoice,
  label: `${seconds} sec`,
}))

/** A short label tag for questions you can skip. */
function Optional() {
  return <span className="font-normal text-muted-foreground">Optional</span>
}

/** The brief: what to write about, who it's for and how it should sound. */
export function BriefCard({
  brief,
  onBriefChange,
  topicError,
  writing,
  hasDraft,
  sampleMode,
  modelName,
  cost,
  onWrite,
}: {
  brief: Brief
  onBriefChange: (brief: Brief) => void
  topicError: string | null
  writing: boolean
  hasDraft: boolean
  sampleMode: boolean
  modelName: string
  /** e.g. "about 2¢ a draft". */
  cost: string
  onWrite: () => void
}) {
  const copy = COPY[brief.type]
  const tone = TONES.find((option) => option.value === brief.tone)!

  return (
    <form
      className="min-w-0"
      onSubmit={(event) => {
        event.preventDefault()
        onWrite()
      }}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault()
          onWrite()
        }
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Brief</CardTitle>
          <CardDescription>Only the first question is required</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Locked while the draft is being written, so the brief always matches the draft. */}
          <FieldSet disabled={writing} className="min-w-0">
            <FieldGroup>
              <Field data-invalid={topicError ? true : undefined} data-disabled={writing}>
                <FieldLabel htmlFor="brief-topic">{copy.topic}</FieldLabel>
                <Textarea
                  id="brief-topic"
                  value={brief.topic}
                  placeholder={copy.topicExample}
                  maxLength={BRIEF_LIMITS.topic}
                  aria-invalid={topicError ? true : undefined}
                  className="min-h-20"
                  onChange={(event) => onBriefChange({ ...brief, topic: event.target.value })}
                />
                {topicError && <FieldError>{topicError}</FieldError>}
              </Field>

              <Field data-disabled={writing}>
                <FieldLabel htmlFor="brief-audience">
                  Who&apos;s it for? <Optional />
                </FieldLabel>
                <Input
                  id="brief-audience"
                  value={brief.audience}
                  placeholder="e.g. Freelance designers just starting out"
                  maxLength={BRIEF_LIMITS.audience}
                  autoComplete="off"
                  onChange={(event) => onBriefChange({ ...brief, audience: event.target.value })}
                />
                <FieldDescription>
                  Leave it blank to write for solo consultants and builders.
                </FieldDescription>
              </Field>

              <Field data-disabled={writing}>
                <FieldTitle>Tone</FieldTitle>
                {/* Four don't fit in a row on a phone, so they sit two by two there. */}
                <ChoiceGroup
                  label="Tone"
                  value={brief.tone}
                  options={TONES}
                  className="grid w-full grid-cols-2 @xs/field-group:flex"
                  itemClassName="flex-auto"
                  onValueChange={(value) => onBriefChange({ ...brief, tone: value })}
                />
                <FieldDescription>{tone.hint}</FieldDescription>
              </Field>

              {brief.type === "video" ? (
                <VideoChoices brief={brief} writing={writing} onBriefChange={onBriefChange} />
              ) : (
                <LengthChoice brief={brief} writing={writing} onBriefChange={onBriefChange} />
              )}

              <Field data-disabled={writing}>
                <FieldLabel htmlFor="brief-notes">
                  Anything else? <Optional />
                </FieldLabel>
                <Textarea
                  id="brief-notes"
                  value={brief.notes}
                  placeholder={copy.notesExample}
                  maxLength={BRIEF_LIMITS.notes}
                  onChange={(event) => onBriefChange({ ...brief, notes: event.target.value })}
                />
                <FieldDescription>
                  Points to include, a story to tell or a link to mention.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          {writing ? (
            <Button type="button" disabled>
              <Spinner data-icon="inline-start" />
              Writing…
            </Button>
          ) : hasDraft ? (
            <Button type="submit" variant="outline">
              <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} data-icon="inline-start" />
              Write again
            </Button>
          ) : (
            <Button type="submit">
              <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} data-icon="inline-start" />
              {copy.write}
            </Button>
          )}
          <p className="text-center text-xs text-pretty text-muted-foreground">
            {sampleMode
              ? "Sample mode: you'll get a template built from your brief."
              : `Writes with ${modelName}, ${cost}.`}
          </p>
        </CardFooter>
      </Card>
    </form>
  )
}

function LengthChoice({
  brief,
  writing,
  onBriefChange,
}: {
  brief: TextBrief
  writing: boolean
  onBriefChange: (brief: Brief) => void
}) {
  const words = TARGET_WORDS[brief.type][brief.length]

  return (
    <Field data-disabled={writing}>
      <FieldTitle>Length</FieldTitle>
      <ChoiceGroup
        label="Length"
        value={brief.length}
        options={LENGTHS}
        className="w-full"
        itemClassName="flex-auto"
        onValueChange={(value) => onBriefChange({ ...brief, length: value })}
      />
      <FieldDescription>
        About {formatNumber(words)} words · {readingMinutes(words)} min read
      </FieldDescription>
    </Field>
  )
}

function VideoChoices({
  brief,
  writing,
  onBriefChange,
}: {
  brief: VideoBrief
  writing: boolean
  onBriefChange: (brief: Brief) => void
}) {
  const style = VIDEO_STYLES.find((option) => option.value === brief.style)!
  const format = VIDEO_FORMATS.find((option) => option.value === brief.format)!

  return (
    <>
      <Field data-disabled={writing}>
        <FieldTitle>Style</FieldTitle>
        <ChoiceGroup
          label="Style"
          value={brief.style}
          options={VIDEO_STYLES}
          className="w-full"
          itemClassName="flex-auto"
          onValueChange={(value) => onBriefChange({ ...brief, style: value })}
        />
        <FieldDescription>{style.hint}</FieldDescription>
      </Field>

      <Field data-disabled={writing}>
        <FieldTitle>Shape</FieldTitle>
        {/* On the narrowest phones the three don't fit in a row, so they stack. */}
        <ChoiceGroup
          label="Shape"
          value={brief.format}
          options={FORMAT_CHOICES}
          className="grid w-full grid-cols-1 @min-[19rem]/field-group:flex"
          itemClassName="flex-auto"
          onValueChange={(value) => onBriefChange({ ...brief, format: value })}
        />
        <FieldDescription>
          {format.ratio} · {format.hint}
        </FieldDescription>
      </Field>

      <Field data-disabled={writing}>
        <FieldTitle>Length</FieldTitle>
        <ChoiceGroup
          label="Length"
          value={`${brief.duration}` as DurationChoice}
          options={DURATION_CHOICES}
          className="w-full"
          itemClassName="flex-auto"
          onValueChange={(value) =>
            onBriefChange({ ...brief, duration: Number(value) as VideoDuration })
          }
        />
        <FieldDescription>
          About {voiceoverWords(brief.duration)} words of voiceover
        </FieldDescription>
      </Field>
    </>
  )
}
