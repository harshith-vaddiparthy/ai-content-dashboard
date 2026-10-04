"use client"

import { AiChat02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useAgent } from "@/components/agent/agent-provider"
import { Button } from "@/components/ui/button"

/** The "AI Agent" button in the top bar. Opens and closes the right sidebar. */
export function AgentButton() {
  const { open, openMobile, isMobile, toggleSidebar } = useAgent()
  const isOpen = isMobile ? openMobile : open

  return (
    <Button
      size="sm"
      variant={isOpen ? "secondary" : "default"}
      aria-pressed={isOpen}
      onClick={toggleSidebar}
    >
      <HugeiconsIcon icon={AiChat02Icon} strokeWidth={2} data-icon="inline-start" />
      AI Agent
    </Button>
  )
}
