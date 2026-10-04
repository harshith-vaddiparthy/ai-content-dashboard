import type { Metadata } from "next"
import Link from "next/link"
import { FileNotFoundIcon, LibraryIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = { title: "Not found" }

export default function ContentNotFound() {
  return (
    <div className="px-4 lg:px-6">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FileNotFoundIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>This piece isn&apos;t here</EmptyTitle>
          <EmptyDescription>
            It may have been deleted, or the link is wrong. Sample content also resets when the
            app restarts.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/library" />}>
            <HugeiconsIcon icon={LibraryIcon} strokeWidth={2} data-icon="inline-start" />
            Back to library
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
