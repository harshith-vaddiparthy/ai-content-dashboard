"use client"

import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { STATUS_CONFIG } from "@/lib/content/config"
import type { DashboardData } from "@/lib/content/stats"
import { pluralize } from "@/lib/format"

const chartConfig = {
  count: { label: "Pieces" },
  draft: { label: STATUS_CONFIG.draft.label, color: "var(--chart-1)" },
  processing: {
    label: STATUS_CONFIG.processing.label,
    color: "color-mix(in oklch, var(--chart-1) 65%, var(--chart-2))",
  },
  ready: {
    label: STATUS_CONFIG.ready.label,
    color: "color-mix(in oklch, var(--chart-1) 40%, var(--chart-2))",
  },
  failed: { label: STATUS_CONFIG.failed.label, color: "var(--destructive)" },
} satisfies ChartConfig

/** Everything that isn't out yet, by stage. */
export function PipelineChart({ pipeline }: { pipeline: DashboardData["pipeline"] }) {
  const data = pipeline.map((row) => ({
    status: row.status,
    label: STATUS_CONFIG[row.status].label,
    count: row.count,
    fill: `var(--color-${row.status})`,
  }))
  const total = pipeline.reduce((sum, row) => sum + row.count, 0)
  const ready = pipeline.find((row) => row.status === "ready")?.count ?? 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>In the works</CardTitle>
        <CardDescription>
          {total ? `${pluralize(total, "piece")} not published yet` : "Nothing waiting. All caught up"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 28 }}>
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={76}
            />
            <XAxis dataKey="count" type="number" hide allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="status" />}
            />
            <Bar dataKey="count" radius={6} maxBarSize={32}>
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground tabular-nums"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{pluralize(ready, "piece")} ready to go</span>
          <span className="text-xs text-muted-foreground">Finished and waiting to publish</span>
        </div>
        {ready > 0 && (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/library?status=ready" />}
          >
            Review
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
