"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ACTIVITY_WEEKS, type DashboardData } from "@/lib/content/stats"
import { formatNumber } from "@/lib/format"

const chartConfig = {
  created: {
    label: "Created",
    color: "color-mix(in oklch, var(--chart-1) 45%, var(--chart-2))",
  },
  published: {
    label: "Published",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type Series = keyof typeof chartConfig

const SERIES: Series[] = ["created", "published"]

/** Pieces created or published each week. Pick which with the totals in the header. */
export function ActivityChart({ activity }: { activity: DashboardData["activity"] }) {
  const [active, setActive] = React.useState<Series>("published")
  const totals = {
    created: activity.reduce((sum, week) => sum + week.created, 0),
    published: activity.reduce((sum, week) => sum + week.published, 0),
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch gap-0 border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 pt-4 pb-3 sm:py-0! lg:px-6">
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            What you {active} each week over the last {ACTIVITY_WEEKS} weeks
          </CardDescription>
        </div>
        <div className="flex">
          {SERIES.map((series) => (
            <button
              key={series}
              type="button"
              data-active={active === series}
              aria-pressed={active === series}
              onClick={() => setActive(series)}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors outline-none even:border-l hover:bg-muted/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: chartConfig[series].color }}
                />
                {chartConfig[series].label}
              </span>
              <span className="text-lg leading-none font-semibold tabular-nums sm:text-3xl">
                {formatNumber(totals[series])}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 py-4 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart accessibilityLayer data={activity} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => `Week of ${value}`}
                />
              }
            />
            <Bar dataKey={active} fill={`var(--color-${active})`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
