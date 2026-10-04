import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { AppearanceCard } from "@/components/settings/appearance-card"
import { ConnectionsCard } from "@/components/settings/connections-card"
import { SampleContentCard } from "@/components/settings/sample-content-card"
import { WritingModelCard } from "@/components/settings/writing-model-card"
import { listContent, USING_SAMPLE_DATA } from "@/lib/db/content"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const [model, items] = await Promise.all([getWritingModel(), listContent()])
  // Matches the count next to Library in the sidebar.
  const libraryCount = items.filter((item) => item.status !== "archived").length

  return (
    <>
      <PageHeader
        title="Settings"
        description="Connect the services that do the work, choose which AI writes for you, and pick how the app looks."
      />

      <div className="grid grid-cols-1 items-start gap-4 px-4 lg:px-6 @4xl/main:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <ConnectionsCard />
          <WritingModelCard modelId={model.id} sampleMode={!isOpenRouterConnected()} />
        </div>
        <div className="flex flex-col gap-4">
          <AppearanceCard />
          {USING_SAMPLE_DATA && <SampleContentCard libraryCount={libraryCount} />}
        </div>
      </div>
    </>
  )
}
