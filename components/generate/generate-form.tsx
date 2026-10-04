"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createContentAction } from "@/app/actions/content"
import { BriefCard } from "@/components/generate/brief-card"
import { DraftCard, type DraftText, type DraftView } from "@/components/generate/draft-card"
import { LeaveGuard } from "@/components/leave-guard"
import { useDraftStream } from "@/hooks/use-draft-stream"
import { defaultTextBrief, defaultVideoBrief, isTextType, type Brief } from "@/lib/content/brief"
import { splitDraft } from "@/lib/content/text"
import type { ContentType } from "@/lib/content/types"

/**
 * Fill in a brief, watch the draft being written, edit it, then save it to the
 * library. Nothing is stored until you press Save.
 */
export function GenerateForm({
  type,
  sampleMode,
  modelName,
  cost,
}: {
  type: ContentType
  /** No OpenRouter key yet, so drafts are sample templates. */
  sampleMode: boolean
  modelName: string
  cost: string
}) {
  const router = useRouter()
  const stream = useDraftStream()
  const [brief, setBrief] = React.useState<Brief>(() =>
    isTextType(type) ? defaultTextBrief(type) : defaultVideoBrief()
  )
  const [topicError, setTopicError] = React.useState<string | null>(null)
  // Your changes to the draft. Until you change something, the draft is exactly what was written.
  const [edits, setEdits] = React.useState<DraftText | null>(null)
  // The model that wrote the draft, saved with it. Null for sample drafts.
  const [model, setModel] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [saving, startSaving] = React.useTransition()
  // Counts writes, so a write you've undone or replaced can't overwrite the draft when it ends.
  const runRef = React.useRef(0)
  // One Undo message at a time. It goes away when you save or leave, since there's nothing to undo then.
  const undoToastId = React.useId()
  React.useEffect(() => () => void toast.dismiss(undoToastId), [undoToastId])

  const writing = stream.status === "writing"
  const draft = edits ?? splitDraft(stream.text)
  const hasDraft = !writing && (draft.title.trim() !== "" || draft.body.trim() !== "")
  const view: DraftView = writing ? "writing" : hasDraft ? "draft" : "idle"

  // Ask before leaving while there's a draft you haven't saved.
  const unsaved = (writing || hasDraft) && !saved

  function changeBrief(next: Brief) {
    setBrief(next)
    if (next.topic.trim()) setTopicError(null)
  }

  async function write() {
    if (writing || saving || saved) return
    if (!brief.topic.trim()) {
      setTopicError("Say what it's about first.")
      document.getElementById("brief-topic")?.focus()
      return
    }

    const previous = hasDraft ? { draft, model } : null
    const run = ++runRef.current
    setEdits(null)
    setModel(null)

    if (previous) {
      toast("Writing a new draft", {
        id: undoToastId,
        description: "It replaces the one you had.",
        action: {
          label: "Undo",
          onClick: () => {
            runRef.current += 1
            stream.stop()
            setEdits(previous.draft)
            setModel(previous.model)
          },
        },
      })
    }

    const result = await stream.generate(brief)
    if (run !== runRef.current) return
    if (result) {
      setModel(result.model)
    } else if (previous) {
      // Nothing usable came back, so keep the draft you had. Nothing was replaced, so there's nothing to undo.
      toast.dismiss(undoToastId)
      setEdits(previous.draft)
      setModel(previous.model)
    }
  }

  function save() {
    if (view !== "draft" || saving || saved) return
    if (!draft.title.trim()) {
      document.getElementById("draft-title")?.focus()
      return
    }

    toast.dismiss(undoToastId)
    startSaving(async () => {
      const result = await createContentAction({
        type,
        title: draft.title,
        body: draft.body,
        model,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setSaved(true)
      toast.success("Saved to your library as a draft")
      router.push(`/library/${result.data.id}`)
    })
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 px-4 lg:px-6 @4xl/main:grid-cols-[24rem_minmax(0,1fr)]">
      <LeaveGuard
        when={unsaved}
        description={`Your ${type === "video" ? "concept" : "draft"} isn't in your library yet. If you leave now, it's gone.`}
      />
      <BriefCard
        brief={brief}
        onBriefChange={changeBrief}
        topicError={topicError}
        writing={writing}
        hasDraft={hasDraft}
        sampleMode={sampleMode}
        modelName={modelName}
        cost={cost}
        onWrite={write}
      />
      <DraftCard
        type={type}
        view={view}
        draft={draft}
        onDraftChange={setEdits}
        error={stream.error}
        onRetry={write}
        onStop={stream.stop}
        saving={saving || saved}
        onSave={save}
      />
    </div>
  )
}
