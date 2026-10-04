import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight01Icon,
  ArrowRight02Icon,
  Clock01Icon,
  NoteEditIcon,
  Plug01Icon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { TypeIcon } from "@/components/content-badges"
import { PageHeader } from "@/components/page-header"
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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { costPerDraft } from "@/lib/ai/models"
import { TYPE_CONFIG } from "@/lib/content/config"
import type { ContentType } from "@/lib/content/types"
import { getNow, listContent } from "@/lib/db/content"
import { formatRelative, pluralize } from "@/lib/format"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

export const metadata: Metadata = { title: "Generate" }

type Generator = {
  type: ContentType
  description: string
  points: string[]
  /** Something it can't do yet, said plainly. */
  comingSoon?: string
  action: string
}

const GENERATORS: Generator[] = [
  {
    type: "blog",
    description: "A full article with headings, examples and a practical close.",
    points: [
      "600 to 2,000 words",
      "Friendly, professional, bold or witty",
      "Edit it, then copy it into your blog",
    ],
    action: "Write a blog post",
  },
  {
    type: "newsletter",
    description: "An email issue with a subject line, short sections and a sign-off.",
    points: [
      "300 to 1,000 words",
      "Short sections that are easy to scan",
      "Edit it, then paste it into your email tool",
    ],
    action: "Write a newsletter",
  },
  {
    type: "video",
    description: "A plan for a short video: the hook, each scene, the voiceover and a call to action.",
    points: ["15, 30 or 60 seconds", "Vertical, landscape or square"],
    comingSoon: "Turning the plan into a video file is coming soon",
    action: "Plan a video",
  },
]

const STEPS = [
  {
    title: "Fill in a short brief",
    description: "Say what it's about. Who it's for, the tone and the length are up to you.",
  },
  {
    title: "Watch it being written",
    description: "The draft appears word by word. You can stop it at any point.",
  },
  {
    title: "Edit, then save",
    description: "Change anything you like. Nothing is saved until you click Save.",
  },
]

/** How many unfinished drafts to show. The rest are a click away in the library. */
const RECENT_DRAFTS = 4

export default async function GeneratePage() {
  const [items, now, model] = await Promise.all([listContent(), getNow(), getWritingModel()])
  const sampleMode = !isOpenRouterConnected()
  const drafts = items.filter((item) => item.status === "draft")

  return (
    <>
      <PageHeader
        title="Generate"
        description="Choose what to make and fill in a short brief. The AI writes a first draft for you to edit, and nothing is saved until you say so."
      />

      <div className="px-4 lg:px-6">
        {sampleMode ? (
          <Alert>
            <HugeiconsIcon icon={Plug01Icon} strokeWidth={2} />
            <AlertTitle>You&apos;re in sample mode</AlertTitle>
            <AlertDescription>
              Drafts are sample text built from your brief, so you can try everything first.
              Connect OpenRouter to have AI write them for real.
            </AlertDescription>
            <AlertAction>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/settings#connections" />}
              >
                Connect
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <Alert>
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
            <AlertTitle>Writing with {model.name}</AlertTitle>
            <AlertDescription>
              Costs {costPerDraft(model)}, billed by OpenRouter. You can switch models in Settings.
            </AlertDescription>
            <AlertAction>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/settings#writing-model" />}
              >
                Change
              </Button>
            </AlertAction>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-3">
        {GENERATORS.map((generator) => {
          const config = TYPE_CONFIG[generator.type]

          return (
            <Link
              key={generator.type}
              href={`/generate/${generator.type}`}
              className="group/generator rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="h-full bg-linear-to-t from-primary/5 to-card shadow-xs transition-shadow group-hover/generator:shadow-md group-hover/generator:ring-primary/30 dark:bg-card">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-5" />
                  </div>
                  <CardTitle>{config.label}</CardTitle>
                  <CardDescription>{generator.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="flex flex-col gap-2">
                    {generator.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          strokeWidth={2}
                          className="mt-0.5 size-4 shrink-0 text-primary"
                        />
                        {point}
                      </li>
                    ))}
                    {generator.comingSoon && (
                      <li className="flex gap-2 text-muted-foreground">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          strokeWidth={2}
                          className="mt-0.5 size-4 shrink-0"
                        />
                        {generator.comingSoon}
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="justify-between font-medium">
                  {generator.action}
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    strokeWidth={2}
                    className="size-4 transition-transform group-hover/generator:translate-x-0.5"
                  />
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>From an idea to a draft in your library</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{step.title}</span>
                    <span className="text-muted-foreground">{step.description}</span>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pick up where you left off</CardTitle>
            <CardDescription>
              {drafts.length > 0
                ? `${pluralize(drafts.length, "draft")} waiting to be finished`
                : "Drafts you save show up here"}
            </CardDescription>
            {drafts.length > RECENT_DRAFTS && (
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/library?status=draft" />}
                >
                  See all
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <Empty className="border p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={NoteEditIcon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>No drafts waiting</EmptyTitle>
                  <EmptyDescription>
                    Everything you save from here starts as a draft, so it&apos;s easy to find again.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup className="gap-1">
                {drafts.slice(0, RECENT_DRAFTS).map((item) => (
                  <div key={item.id} role="listitem">
                    <Item size="sm" className="px-2" render={<Link href={`/library/${item.id}`} />}>
                      <ItemMedia>
                        <TypeIcon type={item.type} decorative />
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0.5">
                        <ItemTitle className="w-full min-w-0">
                          <span className="truncate">{item.title}</span>
                        </ItemTitle>
                        <ItemDescription className="line-clamp-1">
                          {TYPE_CONFIG[item.type].label} · edited {formatRelative(item.updatedAt, now)}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                          className="size-4 text-muted-foreground"
                        />
                      </ItemActions>
                    </Item>
                  </div>
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
