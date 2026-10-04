"use client"

import * as React from "react"
import { DatabaseRestoreIcon, Undo02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { resetSampleContentAction } from "@/app/actions/content"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { pluralize } from "@/lib/format"

/** Explains sample mode, and puts the original sample content back after asking first. */
export function SampleContentCard({
  libraryCount,
}: {
  /** Pieces in the library, not counting the archive. */
  libraryCount: number
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function reset() {
    startTransition(async () => {
      const result = await resetSampleContentAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setOpen(false)
      toast.success("The sample content is back to how it started")
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample content</CardTitle>
        <CardDescription>
          Until a database is connected, your library is sample content kept in memory.
          Everything works, but changes are lost when the app restarts.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <span className="text-muted-foreground">
          {pluralize(libraryCount, "piece")} in your library
        </span>
        {/* Stays open while resetting, so it can't be closed halfway through. */}
        <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
          <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
            <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} data-icon="inline-start" />
            Reset
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                <HugeiconsIcon icon={DatabaseRestoreIcon} strokeWidth={2} />
              </AlertDialogMedia>
              <AlertDialogTitle>Reset the sample content?</AlertDialogTitle>
              <AlertDialogDescription>
                The library goes back to the original sample pieces. Anything you&apos;ve
                written, edited or deleted since will be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={pending} onClick={reset}>
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} data-icon="inline-start" />
                )}
                Reset everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
