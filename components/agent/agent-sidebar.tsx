"use client"

import { useState } from "react"
import {
  AiChat02Icon,
  ArrowUp02Icon,
  BubbleChatAddIcon,
  Cancel01Icon,
  StopIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useAgent } from "@/components/agent/agent-provider"
import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Spinner } from "@/components/ui/spinner"
import { useAgentChat, type AgentMessage } from "@/hooks/use-agent-chat"

const SUGGESTIONS = [
  "What are my top posts?",
  "Give me three newsletter ideas",
  "Summarize my library",
]

/**
 * The right sidebar: a chat with the AI agent about your content. It sits in
 * the dashboard layout, so the conversation survives moving between pages.
 */
export function AgentSidebar() {
  const { toggleSidebar } = useAgent()
  const { messages, status, error, send, retry, stop, reset } = useAgentChat()
  const [draft, setDraft] = useState("")
  const thinking = status === "thinking"

  function submit(text: string) {
    if (thinking || !text.trim()) return
    send(text)
    setDraft("")
  }

  return (
    <Sidebar side="right" variant="inset" collapsible="offcanvas" className="md:pl-0">
      <SidebarHeader className="flex-row items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={AiChat02Icon} strokeWidth={2} className="size-4" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">AI Agent</p>
          <p className="truncate text-xs text-muted-foreground">Knows your library</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="New chat" title="New chat">
            <HugeiconsIcon icon={BubbleChatAddIcon} strokeWidth={2} />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar} aria-label="Close the agent" title="Close">
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        {messages.length === 0 ? (
          <Empty className="flex-1 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={AiChat02Icon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Ask about your content</EmptyTitle>
              <EmptyDescription>
                Get ideas, titles and outlines, or ask how your pieces are doing. It reads your
                library but never changes it.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => submit(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </EmptyContent>
          </Empty>
        ) : (
          <MessageScrollerProvider autoScroll>
            <MessageScroller>
              <MessageScrollerViewport aria-live="polite">
                <MessageScrollerContent className="gap-4 px-2 py-2">
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.role === "user"}
                    >
                      <ChatMessage message={message} />
                    </MessageScrollerItem>
                  ))}
                  {thinking && messages.at(-1)?.role === "user" && (
                    <MessageScrollerItem messageId="thinking">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> Thinking…
                      </p>
                    </MessageScrollerItem>
                  )}
                  {status === "error" && error && (
                    <MessageScrollerItem messageId="error">
                      <Alert variant="destructive">
                        <AlertTitle>{error}</AlertTitle>
                        <AlertAction>
                          <Button variant="outline" size="xs" onClick={retry}>
                            Try again
                          </Button>
                        </AlertAction>
                      </Alert>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </SidebarContent>

      <SidebarFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit(draft)
          }}
        >
          <InputGroup>
            <InputGroupTextarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  submit(draft)
                }
              }}
              placeholder="Ask the agent anything…"
              aria-label="Message the agent"
              rows={2}
              className="max-h-40"
            />
            <InputGroupAddon align="block-end">
              <InputGroupText className="text-xs">Enter to send · Shift+Enter for a new line</InputGroupText>
              {thinking ? (
                <InputGroupButton
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="ml-auto"
                  onClick={stop}
                  aria-label="Stop"
                >
                  <HugeiconsIcon icon={StopIcon} strokeWidth={2} />
                </InputGroupButton>
              ) : (
                draft.trim() && (
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    className="ml-auto"
                    aria-label="Send"
                  >
                    <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
                  </InputGroupButton>
                )
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function ChatMessage({ message }: { message: AgentMessage }) {
  const mine = message.role === "user"
  return (
    <Message align={mine ? "end" : "start"}>
      <MessageContent>
        <Bubble variant={mine ? "default" : "muted"} align={mine ? "end" : "start"}>
          <BubbleContent className="whitespace-pre-wrap">
            <span className="sr-only">{mine ? "You: " : "Agent: "}</span>
            <Formatted text={message.content} />
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

/** Shows **bold** and _italic_ from the agent's replies without a markdown library. */
function Formatted({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*|_[^_\n]+_)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return (
        <em key={index} className="text-muted-foreground">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}
