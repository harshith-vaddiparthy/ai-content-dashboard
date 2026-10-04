"use client"

import { Label, Pie, PieChart } from "recharts"

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
import { TYPE_CONFIG } from "@/lib/content/config"
import type { DashboardData } from "@/lib/content/stats"
import { formatPercent } from "@/lib/format"

const chartConfig = {
  count: { label: "Pieces" },
  blog: { label: TYPE_CONFIG.blog.plural, color: TYPE_CONFIG.blog.color },
  newsletter: { label: TYPE_CONFIG.newsletter.plural, color: TYPE_CONFIG.newsletter.color },
  video: { label: TYPE_CONFIG.video.plural, color: TYPE_CONFIG.video.color },
} satisfies ChartConfig

/** How the library splits between blog posts, newsletters and videos. */
export function MixChart({ mix }: { mix: DashboardData["mix"] }) {
  const total = mix.reduce((sum, row) => sum + row.count, 0)
  const data = mix.map((row) => ({
    kind: row.type,
    count: row.count,
    fill: `var(--color-${row.type})`,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Content mix</CardTitle>
        <CardDescription>What&apos;s in your library right now</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="kind" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                  const cy = viewBox.cy ?? 0
                  return (
                    <text x={viewBox.cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={cy - 4}
                        className="fill-foreground text-3xl font-semibold tabular-nums"
                      >
                        {total}
                      </tspan>
                      <tspan x={viewBox.cx} y={cy + 20} className="fill-muted-foreground">
                        {total === 1 ? "piece" : "pieces"}
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="mt-auto grid gap-2">
          {mix.map((row) => (
            <li key={row.type} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: TYPE_CONFIG[row.type].color }}
              />
              <span className="text-muted-foreground">{TYPE_CONFIG[row.type].plural}</span>
              <span className="ml-auto font-medium tabular-nums">{row.count}</span>
              <span className="w-10 text-right text-muted-foreground tabular-nums">
                {total ? formatPercent(row.count / total) : "0%"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
