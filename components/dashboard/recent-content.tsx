import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { StatusBadge, TypeIcon } from "@/components/content-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ContentRow } from "@/lib/content/rows"

/** The last few pieces you worked on, with a way into the full library. */
export function RecentContent({ rows }: { rows: ContentRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently updated</CardTitle>
        <CardDescription>The pieces you worked on last</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/library" />}>
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right md:table-cell">Reach</TableHead>
              <TableHead className="pr-4 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="w-full max-w-0 pl-4">
                  <Link
                    href={`/library/${row.id}`}
                    className="flex min-w-0 items-center gap-3 font-medium underline-offset-4 hover:underline"
                  >
                    <TypeIcon type={row.type} />
                    <span className="truncate">{row.title}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground tabular-nums md:table-cell">
                  {row.reach ?? "—"}
                </TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground">
                  {row.updated}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
