import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { listContent, USING_SAMPLE_DATA } from "@/lib/db/content"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [cookieStore, items, model] = await Promise.all([
    cookies(),
    listContent(),
    getWritingModel(),
  ])
  // Remember whether the sidebar was open or collapsed last time.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
  const libraryCount = items.filter((item) => item.status !== "archived").length

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        libraryCount={libraryCount}
        sampleMode={!isOpenRouterConnected()}
        modelName={model.name}
      />
      <SidebarInset>
        <SiteHeader sampleData={USING_SAMPLE_DATA} />
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
