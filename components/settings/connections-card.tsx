import { Suspense } from "react"
import {
  Alert01Icon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Database01Icon,
  LinkSquare02Icon,
  Plug01Icon,
  SparklesIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CopyField } from "@/components/settings/copy-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { checkOpenRouterKey } from "@/lib/ai/openrouter"
import type { IconData } from "@/lib/content/config"
import { getIntegrations, type Integration } from "@/lib/integrations"
import { cn } from "@/lib/utils"

const ICONS: Record<Integration["id"], IconData> = {
  openrouter: SparklesIcon,
  higgsfield: Video01Icon,
  database: Database01Icon,
}

const OPENROUTER_KEYS_URL = "https://openrouter.ai/settings/keys"
const OPENROUTER_ACTIVITY_URL = "https://openrouter.ai/activity"

/** The outside services the app uses, whether each one is set up, and how to set it up. */
export function ConnectionsCard() {
  return (
    <Card id="connections" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Connections</CardTitle>
        <CardDescription>
          The outside services that do the work. Their keys stay private: they&apos;re added
          where the app runs, never typed in here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-3">
          {getIntegrations().map((integration) => (
            <div key={integration.id} role="listitem">
              {integration.id === "openrouter" ? (
                <OpenRouter integration={integration} />
              ) : (
                <ComingSoon integration={integration} />
              )}
            </div>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}

function OpenRouter({ integration }: { integration: Integration }) {
  if (!integration.connected) {
    return (
      <IntegrationItem
        integration={integration}
        status={
          <Badge variant="outline">
            <HugeiconsIcon icon={Plug01Icon} strokeWidth={2} data-icon="inline-start" />
            Not connected
          </Badge>
        }
      >
        <ItemFooter className="border-t pt-3">
          <ConnectSteps envVar={integration.envVar} />
        </ItemFooter>
      </IntegrationItem>
    )
  }

  // Checking the key takes a moment, so the rest of the page doesn't wait for it.
  return (
    <Suspense
      fallback={
        <IntegrationItem
          integration={integration}
          status={
            <Badge variant="outline">
              <Spinner data-icon="inline-start" />
              Checking
            </Badge>
          }
        />
      }
    >
      <CheckedOpenRouter integration={integration} />
    </Suspense>
  )
}

/** Asks OpenRouter whether the key works, so a mistyped or deleted key shows up here first. */
async function CheckedOpenRouter({ integration }: { integration: Integration }) {
  const check = await checkOpenRouterKey()

  if (check === "valid") {
    return (
      <IntegrationItem
        integration={integration}
        status={
          <Badge>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} data-icon="inline-start" />
            Connected
          </Badge>
        }
      >
        <ItemFooter className="flex-wrap border-t pt-2.5">
          <p className="min-w-48 flex-1 text-muted-foreground">
            OpenRouter bills you for each draft it writes.
          </p>
          <ExternalButton href={OPENROUTER_ACTIVITY_URL}>See spending</ExternalButton>
        </ItemFooter>
      </IntegrationItem>
    )
  }

  if (check === "rejected") {
    return (
      <IntegrationItem
        integration={integration}
        status={
          <Badge variant="destructive">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} data-icon="inline-start" />
            Key not accepted
          </Badge>
        }
      >
        <ItemFooter className="flex-wrap border-t pt-2.5">
          <p className="min-w-48 flex-1 text-pretty text-muted-foreground">
            OpenRouter turned down the key saved as {integration.envVar}. It may be mistyped
            or deleted. Create a new one, put it in place of the old one, then restart the app.
          </p>
          <ExternalButton href={OPENROUTER_KEYS_URL}>Get a new key</ExternalButton>
        </ItemFooter>
      </IntegrationItem>
    )
  }

  return (
    <IntegrationItem
      integration={integration}
      status={
        <Badge variant="outline">
          <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} data-icon="inline-start" />
          Couldn&apos;t check
        </Badge>
      }
    >
      <ItemFooter className="border-t pt-2.5">
        <p className="text-pretty text-muted-foreground">
          OpenRouter didn&apos;t answer just now, so the key couldn&apos;t be checked. Drafts
          may still work. Reload the page to check again.
        </p>
      </ItemFooter>
    </IntegrationItem>
  )
}

/** Services this version doesn't use yet. Adding the key early does no harm. */
function ComingSoon({ integration }: { integration: Integration }) {
  return (
    <IntegrationItem
      integration={integration}
      status={
        <Badge variant="secondary">
          <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} data-icon="inline-start" />
          Coming soon
        </Badge>
      }
    >
      {integration.connected && (
        <ItemFooter className="border-t pt-2.5">
          <p className="text-muted-foreground">
            Your key is already added, ready for when this arrives.
          </p>
        </ItemFooter>
      )}
    </IntegrationItem>
  )
}

function IntegrationItem({
  integration,
  status,
  children,
}: {
  integration: Integration
  /** The badge next to the name. */
  status: React.ReactNode
  /** More detail under the description, like how to connect it. */
  children?: React.ReactNode
}) {
  return (
    <Item variant="outline">
      <ItemMedia
        className={cn(
          "size-9 rounded-lg",
          integration.inUse ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <HugeiconsIcon icon={ICONS[integration.id]} strokeWidth={2} className="size-4.5" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex-wrap">
          {integration.name}
          {status}
        </ItemTitle>
        <ItemDescription className="line-clamp-none text-pretty">
          {integration.description}
        </ItemDescription>
      </ItemContent>
      {children}
    </Item>
  )
}

/** Three steps to connect OpenRouter, written for someone who has never set up an API key. */
function ConnectSteps({ envVar }: { envVar: string }) {
  return (
    <ol className="flex flex-col gap-4">
      <Step
        number={1}
        title="Create a key on OpenRouter"
        description="Sign up, add a few dollars of credit, then create a key. One key covers every writing model."
      >
        <ExternalButton href={OPENROUTER_KEYS_URL}>Get a key</ExternalButton>
      </Step>
      <Step
        number={2}
        title="Add it where the app runs"
        description={
          <>
            Save the key under this exact name. On Vercel, that&apos;s Settings › Environment
            Variables. On your computer, it&apos;s the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
              .env.local
            </code>{" "}
            file.
          </>
        }
      >
        <CopyField value={envVar} label="Setting name" />
      </Step>
      <Step
        number={3}
        title="Restart the app"
        description="Redeploy on Vercel, or stop and start the app on your computer. This will then say Connected."
      />
    </ol>
  )
}

function Step({
  number,
  title,
  description,
  children,
}: {
  number: number
  title: string
  description: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      {/* The list already numbers its steps for screen readers. */}
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground tabular-nums"
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{title}</span>
          <span className="text-pretty text-muted-foreground">{description}</span>
        </div>
        {children}
      </div>
    </li>
  )
}

function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      size="sm"
      variant="outline"
      nativeButton={false}
      render={<a href={href} target="_blank" rel="noreferrer" />}
    >
      {children}
      <HugeiconsIcon icon={LinkSquare02Icon} strokeWidth={2} data-icon="inline-end" />
      <span className="sr-only">(opens in a new tab)</span>
    </Button>
  )
}
