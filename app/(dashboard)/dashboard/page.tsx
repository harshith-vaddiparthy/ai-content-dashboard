import Link from "next/link"
import { FileTextIcon, MailIcon, VideoIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  { label: "Blog posts", value: 0, icon: FileTextIcon },
  { label: "Newsletters", value: 0, icon: MailIcon },
  { label: "Videos", value: 0, icon: VideoIcon },
]

export default function DashboardPage() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {stat.label}
              </CardTitle>
              <CardAction>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex min-h-[60vh] flex-1 items-center justify-center md:min-h-min">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
            <SparklesIcon className="text-primary size-6" />
          </div>
          <div>
            <p className="font-medium">No content yet</p>
            <p className="text-muted-foreground text-sm">
              Generate your first blog post, newsletter, or video to see activity here.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/generate" />}>
            Generate content
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
