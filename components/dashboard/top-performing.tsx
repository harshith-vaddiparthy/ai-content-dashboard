import Link from "next/link"
import { Award01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Card,
  CardContent,
  CardDescription,
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
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TYPE_CONFIG } from "@/lib/content/config"
import type { DashboardData } from "@/lib/content/stats"
import { CONTENT_TYPES } from "@/lib/content/types"
import { formatCompact, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/** The best pieces of each type. Views and opens aren't comparable, so each type has its own list. */
export function TopPerforming({
  ranked,
  className,
}: {
  ranked: DashboardData["topPerforming"]
  className?: string
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Top performers</CardTitle>
        <CardDescription>Ranked by views, or opens for newsletters</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="blog">
          <TabsList className="w-full">
            {CONTENT_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {TYPE_CONFIG[type].plural}
              </TabsTrigger>
            ))}
          </TabsList>
          {CONTENT_TYPES.map((type) => {
            const rows = ranked[type]
            const best = rows[0]?.value ?? 0

            return (
              <TabsContent key={type} value={type}>
                {rows.length === 0 ? (
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={Award01Icon} strokeWidth={2} />
                      </EmptyMedia>
                      <EmptyTitle>No numbers yet</EmptyTitle>
                      <EmptyDescription>
                        Add {type === "newsletter" ? "opens" : "views"} to a published{" "}
                        {TYPE_CONFIG[type].label.toLowerCase()} to rank it here.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ItemGroup className="gap-1">
                    {rows.map((row, index) => (
                      <div key={row.id} role="listitem">
                        <Item
                          size="xs"
                          className="px-2"
                          render={<Link href={`/library/${row.id}`} />}
                        >
                          <ItemMedia className="w-4 text-xs font-medium text-muted-foreground tabular-nums">
                            {index + 1}
                          </ItemMedia>
                          <ItemContent className="min-w-0">
                            <ItemTitle className="w-full min-w-0">
                              <span className="truncate">{row.title}</span>
                            </ItemTitle>
                            <Progress
                              value={best ? (row.value / best) * 100 : 0}
                              aria-label={`${formatNumber(row.value)} ${row.unit}`}
                              className="mt-2 **:data-[slot=progress-indicator]:bg-chart-1/80"
                            />
                          </ItemContent>
                          <ItemActions className="w-16 justify-end text-xs text-muted-foreground tabular-nums">
                            {formatCompact(row.value)} {row.unit}
                          </ItemActions>
                        </Item>
                      </div>
                    ))}
                  </ItemGroup>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
