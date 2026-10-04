import { Alert02Icon, Video01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { readVideoFormat } from "@/lib/content/text"
import type { ContentStatus } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** The finished video, or a frame in the video's shape that says where rendering is up to. */
export function VideoPreview({
  body,
  status,
  videoUrl,
}: {
  body: string
  status: ContentStatus
  videoUrl: string | null
}) {
  const format = readVideoFormat(body)
  const aspect = format?.aspect ?? 16 / 9

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video</CardTitle>
        <CardDescription>
          {format?.summary ?? "The concept doesn't say which shape, so this shows 16:9"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center rounded-lg bg-muted/50 p-4 sm:p-6">
          <div
            className={cn(
              "w-full",
              aspect < 1 ? "max-w-60" : aspect === 1 ? "max-w-80" : "max-w-xl"
            )}
          >
            <AspectRatio
              ratio={aspect}
              className="@container/frame overflow-hidden rounded-lg border bg-background shadow-xs"
            >
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  className="size-full bg-black object-contain"
                />
              ) : (
                <Empty className="absolute inset-0 gap-2 p-4">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      {status === "processing" ? (
                        <Spinner />
                      ) : (
                        <HugeiconsIcon
                          icon={status === "failed" ? Alert02Icon : Video01Icon}
                          strokeWidth={2}
                        />
                      )}
                    </EmptyMedia>
                    <EmptyTitle>
                      {status === "processing"
                        ? "Rendering"
                        : status === "failed"
                          ? "Rendering didn't finish"
                          : "No video file yet"}
                    </EmptyTitle>
                    {/* A wide frame on a phone is too short for the explanation. */}
                    <EmptyDescription className={cn(aspect > 1 && "@max-sm/frame:hidden")}>
                      {status === "processing"
                        ? "The video is being made. It shows up here when it's done."
                        : status === "failed"
                          ? "Something went wrong while making it. You can still edit the concept below."
                          : "Rendering with Higgsfield is coming. Until then, the concept below works with any video tool."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </AspectRatio>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
