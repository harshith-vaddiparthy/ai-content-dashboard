"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

/**
 * While there's work you haven't saved, asks before you leave the page. Closing or reloading
 * the tab gets the browser's own prompt, and links inside the app get this dialog.
 */
export function LeaveGuard({ when, description }: { when: boolean; description: string }) {
  const router = useRouter()
  const [leaveTo, setLeaveTo] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!when) return

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    function intercept(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      // ⌘ or Ctrl+click opens a new tab and keeps this one, so nothing is lost.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const link = event.target instanceof Element ? event.target.closest("a[href]") : null
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target === "_blank" || link.hasAttribute("download")) return

      const url = new URL(link.href)
      // Links out of the app get the browser's prompt instead.
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      // The link sees the click was cancelled and stays put until you choose.
      event.preventDefault()
      setLeaveTo(url.pathname + url.search + url.hash)
    }

    window.addEventListener("beforeunload", warn)
    window.addEventListener("click", intercept, true)
    return () => {
      window.removeEventListener("beforeunload", warn)
      window.removeEventListener("click", intercept, true)
    }
  }, [when])

  function leave() {
    if (leaveTo) router.push(leaveTo)
    setLeaveTo(null)
  }

  return (
    <AlertDialog
      open={leaveTo !== null}
      onOpenChange={(open) => {
        if (!open) setLeaveTo(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={leave}>
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
