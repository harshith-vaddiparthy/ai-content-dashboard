import { cookies } from "next/headers"

import { AgentProvider } from "@/components/agent/agent-provider"
import { AgentSidebar } from "@/components/agent/agent-sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { listContent } from "@/lib/db/content"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [cookieStore, items] = await Promise.all([cookies(), listContent()])
  // Remember whether the sidebar was open or collapsed last time.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
  const agentOpen = cookieStore.get("agent_state")?.value === "true"
  const libraryCount = items.filter((item) => item.status !== "archived").length

  return (
    <AgentProvider defaultOpen={agentOpen}>
    <SidebarProvider
      className="min-h-0 min-w-0 flex-1"
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" libraryCount={libraryCount} />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    <AgentSidebar />
    </AgentProvider>
  )
}
