import type { Metadata } from "next"
import Link from "next/link"
import { AiMagicIcon, LibraryIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { LibraryView } from "@/components/library/library-view"
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
import { getNow, listContent } from "@/lib/db/content"

export const metadata: Metadata = { title: "Library" }

export default async function LibraryPage() {
  const [items, now] = await Promise.all([listContent(), getNow()])
  const rows = items.map((item) => toContentRow(item, now))

  return (
    <>
      <PageHeader
        title="Library"
        description="Every blog post, newsletter and video you've made. What you worked on last is on top."
        actions={
          <Button nativeButton={false} render={<Link href="/generate" />}>
            <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} data-icon="inline-start" />
            Generate content
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="px-4 lg:px-6">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={LibraryIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>No content yet</EmptyTitle>
              <EmptyDescription>
                Everything you generate, from blog posts to newsletters and videos, shows up here.
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
        // A fresh key on every visit, so following a link here (like Library in the sidebar)
        // resets the filters to match the address bar.
        <LibraryView key={now.getTime()} rows={rows} />
      )}
    </>
  )
}
