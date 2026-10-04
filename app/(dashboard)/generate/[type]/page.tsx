import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { GenerateForm } from "@/components/generate/generate-form"
import { PageHeader } from "@/components/page-header"
import { costPerDraft } from "@/lib/ai/models"
import { isContentType, type ContentType } from "@/lib/content/types"
import { isOpenRouterConnected } from "@/lib/integrations"
import { getWritingModel } from "@/lib/preferences"

const PAGES: Record<ContentType, { title: string; description: string }> = {
  blog: {
    title: "New blog post",
    description:
      "Tell the AI what the post is about. It writes a first draft you can edit before saving.",
  },
  newsletter: {
    title: "New newsletter",
    description:
      "Tell the AI what this issue is about. It writes the subject line and the email for you to edit.",
  },
  video: {
    title: "New video",
    description:
      "Describe the video. The AI plans the hook, scenes, voiceover and call to action for you to edit.",
  },
}

export async function generateMetadata({
  params,
}: PageProps<"/generate/[type]">): Promise<Metadata> {
  const { type } = await params
  return { title: isContentType(type) ? PAGES[type].title : "Not found" }
}

export default async function GenerateTypePage({ params }: PageProps<"/generate/[type]">) {
  const { type } = await params
  if (!isContentType(type)) notFound()
  const model = await getWritingModel()

  return (
    <>
      <PageHeader title={PAGES[type].title} description={PAGES[type].description} />
      <GenerateForm
        type={type}
        sampleMode={!isOpenRouterConnected()}
        modelName={model.name}
        cost={costPerDraft(model)}
      />
    </>
  )
}
