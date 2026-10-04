import {
  Award01Icon,
  ChartDownIcon,
  ChartUpIcon,
  MailOpen01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { IconData } from "@/lib/content/config"
import type { DashboardData } from "@/lib/content/stats"
import { formatChange, formatCompact, formatNumber, pluralize } from "@/lib/format"

type Headline = { text: string; icon?: IconData }

/** The four headline numbers at the top of the dashboard. */
export function SectionCards({ data }: { data: DashboardData }) {
  const { created, published, views, opens } = data

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <StatCard
        label="Pieces created"
        value={formatNumber(created.last30)}
        badge={<TrendBadge change={created.change} />}
        headline={monthOverMonth(created.change, created.prev30)}
        detail={`Last 30 days · ${formatNumber(created.total)} in your library`}
      />
      <StatCard
        label="Pieces published"
        value={formatNumber(published.last30)}
        badge={<TrendBadge change={published.change} />}
        headline={monthOverMonth(published.change, published.prev30)}
        detail={`Last 30 days · ${formatNumber(published.live)} live in total`}
      />
      <StatCard
        label="Total views"
        value={views.tracked ? formatNumber(views.total) : "—"}
        badge={
          views.tracked > 0 && (
            <Badge variant="outline">
              <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
              {formatCompact(views.average)} avg
            </Badge>
          )
        }
        headline={
          views.best
            ? { text: `${formatNumber(views.best.value)} on your best piece`, icon: Award01Icon }
            : { text: "No views entered yet" }
        }
        detail={
          views.best
            ? views.best.title
            : "Add view counts to published posts and videos"
        }
      />
      <StatCard
        label="Newsletter opens"
        value={opens.issues ? formatNumber(Math.round(opens.average)) : "—"}
        badge={<TrendBadge change={opens.change} />}
        headline={issueTrend(opens.change, opens.issues)}
        detail={
          opens.issues
            ? `Average per issue · ${pluralize(opens.issues, "issue")}`
            : "Add open counts to sent newsletters"
        }
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  badge,
  headline,
  detail,
}: {
  label: string
  value: string
  badge?: React.ReactNode
  headline: Headline
  detail: string
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {badge && <CardAction>{badge}</CardAction>}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex max-w-full items-center gap-2 font-medium">
          <span className="truncate">{headline.text}</span>
          {headline.icon && (
            <HugeiconsIcon icon={headline.icon} strokeWidth={2} className="size-4 shrink-0" />
          )}
        </div>
        <div className="max-w-full truncate text-muted-foreground">{detail}</div>
      </CardFooter>
    </Card>
  )
}

function TrendBadge({ change }: { change: number | null }) {
  if (change == null) return null

  return (
    <Badge variant="outline">
      <HugeiconsIcon icon={change < 0 ? ChartDownIcon : ChartUpIcon} strokeWidth={2} />
      {formatChange(change)}
    </Badge>
  )
}

function monthOverMonth(change: number | null, previous: number): Headline {
  if (change == null) return { text: "None in the 30 days before" }
  if (change > 0) return { text: `Up from ${formatNumber(previous)} the month before`, icon: ChartUpIcon }
  if (change < 0) return { text: `Down from ${formatNumber(previous)} the month before`, icon: ChartDownIcon }
  return { text: "Same as the month before" }
}

function issueTrend(change: number | null, issues: number): Headline {
  if (!issues) return { text: "No opens entered yet" }
  if (change == null) return { text: "Trend shows after 6 issues", icon: MailOpen01Icon }
  if (change > 0) return { text: "Rising over your last 3 issues", icon: ChartUpIcon }
  if (change < 0) return { text: "Dipping over your last 3 issues", icon: ChartDownIcon }
  return { text: "Steady over your last 3 issues", icon: MailOpen01Icon }
}
