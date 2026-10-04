"use client"

import { createContext, useContext } from "react"

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"

/** Remembers whether the agent was open, like `sidebar_state` does for the left sidebar. */
export const AGENT_COOKIE = "agent_state"

type AgentState = ReturnType<typeof useSidebar>

const AgentContext = createContext<AgentState | null>(null)

/**
 * The right sidebar's own SidebarProvider. It wraps the left one, so inside
 * the page `useSidebar()` means the left sidebar, and `useAgent()` reaches
 * this one. Toggle with ⌘I / Ctrl+I.
 */
export function AgentProvider({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      cookieName={AGENT_COOKIE}
      keyboardShortcut="i"
      style={{ "--sidebar-width": "calc(var(--spacing) * 96)" } as React.CSSProperties}
    >
      <Bridge>{children}</Bridge>
    </SidebarProvider>
  )
}

function Bridge({ children }: { children: React.ReactNode }) {
  return <AgentContext.Provider value={useSidebar()}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) throw new Error("useAgent must be used within an AgentProvider.")
  return context
}
