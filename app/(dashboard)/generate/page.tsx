import { FileTextIcon, MailIcon, VideoIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const options = [
  {
    title: "Blog post",
    description: "Long-form article drafted from a topic or prompt via OpenRouter.",
    icon: FileTextIcon,
  },
  {
    title: "Newsletter",
    description: "Email-ready content with a subject line, drafted via OpenRouter.",
    icon: MailIcon,
  },
  {
    title: "Video",
    description: "OpenRouter drafts the concept, then Higgsfield renders the real video.",
    icon: VideoIcon,
  },
]

export default function GeneratePage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => (
        <Card key={option.title}>
          <CardHeader>
            <div className="bg-primary/10 mb-2 flex size-10 items-center justify-center rounded-lg">
              <option.icon className="text-primary size-5" />
            </div>
            <CardTitle>{option.title}</CardTitle>
            <CardAction>
              <Badge variant="secondary">Coming soon</Badge>
            </CardAction>
            <CardDescription>{option.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Create {option.title.toLowerCase()}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
