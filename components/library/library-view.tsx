"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  LibraryIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ChoiceGroup, type Choice } from "@/components/choice-group"
import { StatusBadge, TypeIcon } from "@/components/content-badges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/content/config"
import type { ContentRow } from "@/lib/content/rows"
import {
  CONTENT_TYPES,
  isContentStatus,
  isContentType,
  type ContentStatus,
  type ContentType,
} from "@/lib/content/types"
import { formatNumber, pluralize } from "@/lib/format"

const PAGE_SIZE = 10

type StatusFilter = "all" | ContentStatus
type TypeFilter = "all" | ContentType

type Filters = {
  status: StatusFilter
  type: TypeFilter
  query: string
  page: number
}

/** One tab per status. "All" leaves out archived pieces; they have their own tab. */
const STATUS_TABS: {
  value: StatusFilter
  label: string
  /** Only shown when something has this status, so the row of tabs stays short. */
  optional?: boolean
  empty: { title: string; description: string }
}[] = [
  {
    value: "all",
    label: "All",
    empty: {
      title: "Everything is archived",
      description: "Your pieces are waiting in the Archived tab.",
    },
  },
  {
    value: "draft",
    label: "Drafts",
    empty: {
      title: "No drafts",
      description: "Drafts you save from Generate land here.",
    },
  },
  {
    value: "processing",
    label: "Rendering",
    optional: true,
    empty: {
      title: "Nothing rendering",
      description: "Videos show up here while they render.",
    },
  },
  {
    value: "ready",
    label: "Ready",
    empty: {
      title: "Nothing ready yet",
      description: "Mark a draft as ready once it's finished and waiting to go out.",
    },
  },
  {
    value: "published",
    label: "Published",
    empty: {
      title: "Nothing published yet",
      description: "Mark a piece as published once it's live.",
    },
  },
  {
    value: "failed",
    label: "Failed",
    optional: true,
    empty: {
      title: "No failed renders",
      description: "Videos that didn't finish rendering show up here.",
    },
  },
  {
    value: "archived",
    label: "Archived",
    empty: {
      title: "Nothing archived",
      description: "Archive pieces you're done with. They wait here, out of the way.",
    },
  },
]

const TYPE_FILTERS: Choice<TypeFilter>[] = [
  { value: "all", label: "All" },
  ...CONTENT_TYPES.map((type) => ({
    value: type,
    label: TYPE_CONFIG[type].plural,
    icon: TYPE_CONFIG[type].icon,
  })),
]

function isStatusFilter(value: unknown): value is StatusFilter {
  return value === "all" || isContentStatus(value)
}

/** Reads the filters from the address bar, so links like /library?status=ready open the right tab. */
function readFilters(params: { get(name: string): string | null }): Filters {
  const status = params.get("status")
  const type = params.get("type")
  const page = Number(params.get("page"))

  return {
    status: isStatusFilter(status) ? status : "all",
    type: isContentType(type) ? type : "all",
    query: params.get("q") ?? "",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/** Mirrors the filters in the address bar, so refreshing or coming back keeps them. */
function writeFilters(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.type !== "all") params.set("type", filters.type)
  if (filters.query) params.set("q", filters.query)
  if (filters.page > 1) params.set("page", String(filters.page))

  const search = params.toString()
  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname)
}

/** The full library: status tabs, a type filter, title search and a paged table. */
export function LibraryView({ rows }: { rows: ContentRow[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = React.useState(() => readFilters(searchParams))

  function update(change: Partial<Filters>) {
    // Any new filter starts back on the first page.
    const next = { ...filters, page: 1, ...change }
    setFilters(next)
    writeFilters(next)
  }

  const query = filters.query.trim().toLowerCase()
  const narrowed = query !== "" || filters.type !== "all"
  const matching = rows.filter(
    (row) =>
      (filters.type === "all" || row.type === filters.type) &&
      (!query || row.title.toLowerCase().includes(query))
  )

  // Tab counts follow the search and type filter, so you can see which tab has matches.
  const counts: Record<StatusFilter, number> = {
    all: 0,
    draft: 0,
    processing: 0,
    ready: 0,
    published: 0,
    archived: 0,
    failed: 0,
  }
  for (const row of matching) {
    counts[row.status] += 1
    if (row.status !== "archived") counts.all += 1
  }

  const statusesInUse = new Set<string>(rows.map((row) => row.status))
  const tabs = STATUS_TABS.filter(
    (tab) => !tab.optional || tab.value === filters.status || statusesInUse.has(tab.value)
  )
  const activeTab = STATUS_TABS.find((tab) => tab.value === filters.status) ?? STATUS_TABS[0]

  const filtered = matching.filter((row) =>
    filters.status === "all" ? row.status !== "archived" : row.status === filters.status
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(filters.page, pageCount)
  const start = (page - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  return (
    <Tabs
      value={filters.status}
      onValueChange={(value) => {
        if (isStatusFilter(value)) update({ status: value })
      }}
      className="gap-4 px-4 lg:px-6"
    >
      <TabsList className="max-w-full justify-start overflow-x-auto [scrollbar-width:none]">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            <Badge variant="secondary" className="tabular-nums">
              {formatNumber(counts[tab.value])}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={filters.status}>
        <Card className="gap-0 py-0">
          <CardHeader className="flex flex-col gap-3 border-b py-3 [.border-b]:pb-3 @3xl/main:flex-row @3xl/main:items-center @3xl/main:justify-between">
            <ChoiceGroup
              label="Content type"
              options={TYPE_FILTERS}
              value={filters.type}
              onValueChange={(type) => update({ type })}
              iconLabelClassName="sr-only @xl/main:not-sr-only"
            />
            <InputGroup className="@3xl/main:max-w-64">
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                value={filters.query}
                onChange={(event) => update({ query: event.target.value })}
                placeholder="Search by title"
                aria-label="Search by title"
              />
              {filters.query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => update({ query: "" })}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </CardHeader>

          <CardContent className="px-0">
            {visible.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon
                      icon={
                        narrowed
                          ? Search01Icon
                          : filters.status === "all"
                            ? LibraryIcon
                            : STATUS_CONFIG[filters.status].icon
                      }
                      strokeWidth={2}
                    />
                  </EmptyMedia>
                  <EmptyTitle>{narrowed ? "No matches" : activeTab.empty.title}</EmptyTitle>
                  <EmptyDescription>
                    {narrowed
                      ? "Nothing in this tab matches your search and type filter."
                      : activeTab.empty.description}
                  </EmptyDescription>
                </EmptyHeader>
                {narrowed && (
                  <EmptyContent>
                    <Button variant="outline" size="sm" onClick={() => update({ type: "all", query: "" })}>
                      Clear search and filter
                    </Button>
                  </EmptyContent>
                )}
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="pl-4">Title</TableHead>
                    <TableHead className="max-sm:pr-4">Status</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Reach</TableHead>
                    <TableHead className="hidden pr-4 text-right sm:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={(event) => {
                        // The title is the real link (for keyboards and new tabs). The rest of the row is a shortcut to it.
                        if ((event.target as Element).closest("a")) return
                        router.push(`/library/${row.id}`)
                      }}
                    >
                      <TableCell className="w-full max-w-0 py-2.5 pl-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <TypeIcon type={row.type} decorative />
                          <div className="flex min-w-0 flex-col">
                            <Link
                              href={`/library/${row.id}`}
                              className="truncate font-medium underline-offset-4 hover:underline"
                            >
                              {row.title}
                            </Link>
                            <span className="truncate text-xs text-muted-foreground">
                              {TYPE_CONFIG[row.type].label} ·{" "}
                              {/* Phones have no Updated column, so the line under the title shows it instead. */}
                              <span className="sm:hidden">Updated {row.updated}</span>
                              <span className="hidden sm:inline">Created {row.created}</span>
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-sm:pr-4">
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground tabular-nums md:table-cell">
                        {row.reach ?? "—"}
                      </TableCell>
                      <TableCell className="hidden pr-4 text-right text-muted-foreground sm:table-cell">
                        {row.updated}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {filtered.length > 0 && (
            <CardFooter className="justify-between gap-4 py-3">
              <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                {pageCount > 1
                  ? `Showing ${formatNumber(start + 1)}–${formatNumber(start + visible.length)} of ${pluralize(filtered.length, "piece")}`
                  : pluralize(filtered.length, "piece")}
              </p>
              {pageCount > 1 && (
                <div className="flex items-center gap-2">
                  <span className="hidden text-sm text-muted-foreground tabular-nums sm:inline">
                    Page {page} of {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Previous page"
                    disabled={page === 1}
                    onClick={() => update({ page: page - 1 })}
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Next page"
                    disabled={page === pageCount}
                    onClick={() => update({ page: page + 1 })}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  )
}
