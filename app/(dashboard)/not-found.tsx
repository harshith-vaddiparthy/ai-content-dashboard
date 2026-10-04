import type { Metadata } from "next"
import Link from "next/link"
import {
  DashboardSquare01Icon,
  FileNotFoundIcon,
  LibraryIcon,
} from "@hugeicons/core-free-icons"
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

/** Any address that doesn't exist, shown inside the dashboard so the sidebar is still there. */
export default function NotFound() {
  return (
    <div className="px-4 lg:px-6">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FileNotFoundIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>This page isn&apos;t here</EmptyTitle>
          <EmptyDescription>
            The link may be wrong or out of date. Everything you&apos;ve made is in your library.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Button nativeButton={false} render={<Link href="/dashboard" />}>
              <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} data-icon="inline-start" />
              Go to dashboard
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>
              <HugeiconsIcon icon={LibraryIcon} strokeWidth={2} data-icon="inline-start" />
              Open library
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
