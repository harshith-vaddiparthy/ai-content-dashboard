"use client"

import * as React from "react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { deleteContentAction } from "@/app/actions/content"
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
import { Spinner } from "@/components/ui/spinner"

/** Deletes a piece for good, after asking first. */
export function DeleteContentButton({
  id,
  title,
  typeLabel,
}: {
  id: string
  title: string
  /** "Video", "Blog post" or "Newsletter". */
  typeLabel: string
}) {
  const [pending, startTransition] = React.useTransition()

  function remove() {
    startTransition(async () => {
      const result = await deleteContentAction(id)
      // On success the action takes you to the library, so only a failure comes back here.
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this {typeLabel.toLowerCase()}?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; and its numbers will be gone for good. To keep it out of the way
            instead, archive it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
            )}
            Delete for good
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
