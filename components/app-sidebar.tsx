import {
  AiContentGenerator01Icon,
  DashboardSquare01Icon,
  LibraryIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { NavMain, SidebarLink, type NavItem } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TYPE_CONFIG } from "@/lib/content/config"
import { CONTENT_TYPES } from "@/lib/content/types"
import { site } from "@/lib/site"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  /** Pieces in the library, not counting the archive. */
  libraryCount: number
}

export function AppSidebar({ libraryCount, ...props }: AppSidebarProps) {
  const main: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: DashboardSquare01Icon },
    { title: "Library", url: "/library", icon: LibraryIcon, badge: libraryCount },
  ]

  const create: NavItem[] = CONTENT_TYPES.map((type) => ({
    title: TYPE_CONFIG[type].label,
    url: `/generate/${type}`,
    icon: TYPE_CONFIG[type].icon,
    tooltip: `New ${TYPE_CONFIG[type].label.toLowerCase()}`,
  }))

  const secondary: NavItem[] = [
    { title: "Settings", url: "/settings", icon: Settings01Icon },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<SidebarLink href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={AiContentGenerator01Icon} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{site.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {site.workspace}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavMain items={main} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={create} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <NavMain items={secondary} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
