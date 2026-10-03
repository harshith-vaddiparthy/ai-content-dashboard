import { CircleCheckIcon, CircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const connections = [
  {
    name: "OpenRouter",
    description: "Powers blog post and newsletter text generation.",
    configured: Boolean(process.env.OPENROUTER_API_KEY),
  },
  {
    name: "Higgsfield",
    description: "Renders the real generated video from an approved concept.",
    configured: Boolean(process.env.HIGGSFIELD_API_KEY),
  },
]

const models = ["openai/gpt-5", "anthropic/claude-sonnet-5", "google/gemini-3-pro"]

export default function SettingsPage() {
  return (
    <div className="grid gap-4 md:max-w-2xl">
      {connections.map((connection) => (
        <Card key={connection.name}>
          <CardHeader>
            <CardTitle>{connection.name}</CardTitle>
            <CardAction>
              {connection.configured ? (
                <Badge className="gap-1">
                  <CircleCheckIcon className="size-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <CircleIcon className="size-3" />
                  Not connected
                </Badge>
              )}
            </CardAction>
            <CardDescription>{connection.description}</CardDescription>
          </CardHeader>
          {!connection.configured && (
            <CardContent className="text-muted-foreground text-sm">
              Add an API key as an environment variable to connect this.
            </CardContent>
          )}
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Default text model</CardTitle>
          <CardDescription>Used for blog post and newsletter generation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue={models[0]}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
