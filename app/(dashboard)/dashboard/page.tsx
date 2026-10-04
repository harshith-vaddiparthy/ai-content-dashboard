import type { Metadata } from "next"
import Link from "next/link"
import { AiMagicIcon, Analytics01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ActivityChart } from "@/components/dashboard/activity-chart"
import { MixChart } from "@/components/dashboard/mix-chart"
import { PipelineChart } from "@/components/dashboard/pipeline-chart"
import { RecentContent } from "@/components/dashboard/recent-content"
import { SectionCards } from "@/components/dashboard/section-cards"
import { TopPerforming } from "@/components/dashboard/top-performing"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { toContentRow } from "@/lib/content/rows"
import { getDashboardData, getNow, listContent } from "@/lib/db/content"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const [data, items, now] = await Promise.all([getDashboardData(), listContent(), getNow()])
  const recent = items
    .filter((item) => item.status !== "archived")
    .slice(0, 6)
    .map((item) => toContentRow(item, now))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="How your content is doing: what you made, what went live, and what people read."
      />

      {data.isEmpty ? (
        <div className="px-4 lg:px-6">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Nothing to measure yet</EmptyTitle>
              <EmptyDescription>
                Once you create and publish content, your numbers and charts show up here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button nativeButton={false} render={<Link href="/generate" />}>
                <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} data-icon="inline-start" />
                Generate your first piece
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <>
          <SectionCards data={data} />
          <div className="px-4 lg:px-6">
            <ActivityChart activity={data.activity} />
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            <MixChart mix={data.mix} />
            <PipelineChart pipeline={data.pipeline} />
            <TopPerforming
              ranked={data.topPerforming}
              className="@3xl/main:col-span-2 @5xl/main:col-span-1"
            />
          </div>
          <div className="px-4 lg:px-6">
            <RecentContent rows={recent} />
          </div>
        </>
      )}
    </>
  )
}
