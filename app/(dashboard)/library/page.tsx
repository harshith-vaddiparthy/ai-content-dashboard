import Link from "next/link"
import { LibraryIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LibraryPage() {
  return (
    <Card className="flex min-h-[70vh] flex-1 items-center justify-center">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <LibraryIcon className="text-primary size-6" />
        </div>
        <div>
          <p className="font-medium">No content yet</p>
          <p className="text-muted-foreground text-sm">
            Everything you generate — blog posts, newsletters, and videos — will show up here.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/generate" />}>
          Generate your first piece
        </Button>
      </CardContent>
    </Card>
  )
}
