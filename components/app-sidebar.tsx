import {
  AiContentGenerator01Icon,
  AiMagicIcon,
  DashboardSquare01Icon,
  LibraryIcon,
  Plug01Icon,
  Settings01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { NavMain, SidebarLink, type NavItem } from "@/components/nav-main"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  /** True until an OpenRouter key is added. */
  sampleMode: boolean
  modelName: string
}

export function AppSidebar({
  libraryCount,
  sampleMode,
  modelName,
  ...props
}: AppSidebarProps) {
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
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Generate content"
                  render={<SidebarLink href="/generate" />}
                  className="min-w-8 bg-primary text-primary-foreground shadow-xs duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} />
                  <span>Generate content</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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

      <SidebarFooter>
        {sampleMode ? <SampleModeCard /> : <WritingModel name={modelName} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

/** Shown until OpenRouter is connected, so it's always clear why drafts are templates. */
function SampleModeCard() {
  return (
    <Card size="sm" className="gap-3 shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Plug01Icon}
            strokeWidth={2}
            className="size-4 text-muted-foreground"
          />
          Sample mode
        </CardTitle>
        <CardDescription className="text-xs">
          Drafts are sample text until you connect OpenRouter, the service that
          runs the AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          nativeButton={false}
          render={<SidebarLink href="/settings#connections" />}
        >
          Connect OpenRouter
        </Button>
      </CardContent>
    </Card>
  )
}

function WritingModel({ name }: { name: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={`Writing with ${name}`}
          render={<SidebarLink href="/settings#writing-model" />}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              Writes your drafts
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
