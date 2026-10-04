"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AgentButton } from "@/components/agent/agent-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TYPE_CONFIG } from "@/lib/content/config"
import { isContentType } from "@/lib/content/types"

const SECTIONS: Record<string, string> = {
  dashboard: "Dashboard",
  library: "Library",
  generate: "Generate",
  settings: "Settings",
}

type Crumb = { label: string; href?: string }

/**
 * "/generate/blog" → Generate › Blog post. "/library/abc123" → Library › Details.
 * An address no page has, like "/generate/podcast", says Not found.
 */
function crumbsFor(pathname: string): Crumb[] {
  const [section = "", child, ...rest] = pathname.split("/").filter(Boolean)
  const label = SECTIONS[section]
  if (!label) return [{ label: "Not found" }]
  if (!child) return [{ label }]

  const parent = { label, href: `/${section}` }
  if (rest.length === 0) {
    if (section === "generate" && isContentType(child)) {
      return [parent, { label: TYPE_CONFIG[child].label }]
    }
    if (section === "library") return [parent, { label: "Details" }]
  }
  return [parent, { label: "Not found" }]
}

export function SiteHeader() {
  const crumbs = crumbsFor(usePathname())

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <AgentButton />
        </div>
      </div>
    </header>
  )
}
