"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { IconData } from "@/lib/content/config"

export type NavItem = {
  title: string
  url: string
  icon: IconData
  /** Shown when the sidebar is collapsed to icons. Defaults to the title. */
  tooltip?: string
  badge?: number
}

/** A link that also closes the sidebar on phones, so you land on the page you tapped. */
export function SidebarLink({ onClick, ...props }: React.ComponentProps<typeof Link>) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (isMobile) setOpenMobile(false)
      }}
    />
  )
}

/** Flat list of links. No dropdowns: every item is one click away. */
export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.tooltip ?? item.title}
              render={<SidebarLink href={item.url} />}
              className="data-active:bg-secondary data-active:text-secondary-foreground"
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
              <span>{item.title}</span>
            </SidebarMenuButton>
            {item.badge != null && (
              <SidebarMenuBadge className="peer-data-active/menu-button:text-secondary-foreground">
                {item.badge}
              </SidebarMenuBadge>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
