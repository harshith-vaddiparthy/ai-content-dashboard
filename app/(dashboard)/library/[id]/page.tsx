import { Fragment } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { StatusBadge, TypeBadge } from "@/components/content-badges"
import { ContentEditor } from "@/components/library/content-editor"
import { DeleteContentButton } from "@/components/library/delete-content-button"
import { PerformanceCard } from "@/components/library/performance-card"
import { StatusCard } from "@/components/library/status-card"
import { VideoPreview } from "@/components/library/video-preview"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { modelName } from "@/lib/ai/models"
import { TYPE_CONFIG } from "@/lib/content/config"
import { buildPerformance } from "@/lib/content/stats"
import { getContent, getNow, listContent } from "@/lib/db/content"
import { formatDate, formatRelative } from "@/lib/format"

export async function generateMetadata({
  params,
}: PageProps<"/library/[id]">): Promise<Metadata> {
  const { id } = await params
  const item = await getContent(id)
  return { title: item?.title ?? "Not found" }
}

export default async function ContentPage({ params }: PageProps<"/library/[id]">) {
  const { id } = await params
  const [item, items, now] = await Promise.all([getContent(id), listContent(), getNow()])
  if (!item) notFound()

  const typeLabel = TYPE_CONFIG[item.type].label
  const details = [
    { label: "Type", value: typeLabel },
    { label: "Created", value: formatDate(item.createdAt) },
    { label: "Last edited", value: formatDate(item.updatedAt) },
    { label: "Published", value: item.publishedAt ? formatDate(item.publishedAt) : "Not yet" },
    { label: "Written by", value: modelName(item.model) ?? "You" },
  ]

  return (
    <>
      <PageHeader
        title={item.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
            <span>Updated {formatRelative(item.updatedAt, now)}</span>
          </span>
        }
        actions={<DeleteContentButton id={item.id} title={item.title} typeLabel={typeLabel} />}
      />

      <div className="grid grid-cols-1 items-start gap-4 px-4 lg:px-6 @4xl/main:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {item.type === "video" && (
            <VideoPreview body={item.body} status={item.status} videoUrl={item.videoUrl} />
          )}
          <ContentEditor
            key={item.id}
            id={item.id}
            type={item.type}
            title={item.title}
            body={item.body}
          />
        </div>

        <div className="flex flex-col gap-4">
          <StatusCard id={item.id} status={item.status} />
          <PerformanceCard
            key={item.id}
            id={item.id}
            typeLabel={typeLabel}
            performance={buildPerformance(item, items)}
            published={item.status === "published" || item.publishedAt != null}
          />
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
                {details.map(({ label, value }) => (
                  <Fragment key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </Fragment>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
