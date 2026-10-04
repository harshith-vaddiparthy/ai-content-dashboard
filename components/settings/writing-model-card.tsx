"use client"

import * as React from "react"
import { Plug01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { setWritingModelAction } from "@/app/actions/settings"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { costPerDraft, isModelId, WRITING_MODELS } from "@/lib/ai/models"

/** Pick the AI that writes your drafts. The pick is saved as soon as you click. */
export function WritingModelCard({
  modelId,
  sampleMode,
}: {
  modelId: string
  sampleMode: boolean
}) {
  // Shows the new pick straight away, and goes back to the old one if saving fails.
  const [selected, setSelected] = React.useOptimistic(modelId)
  const [, startTransition] = React.useTransition()
  const id = React.useId()

  function choose(value: unknown) {
    if (!isModelId(value) || value === selected) return
    const model = WRITING_MODELS.find((option) => option.id === value)!

    startTransition(async () => {
      setSelected(value)
      const result = await setWritingModelAction(value)
      // One toast at a time, however fast you click through the list.
      if (result.ok) toast.success(`${model.name} writes your drafts now`, { id: "writing-model" })
      else toast.error(result.error, { id: "writing-model" })
    })
  }

  return (
    <Card id="writing-model" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Writing model</CardTitle>
        <CardDescription>
          The AI that writes your drafts. They all run on your OpenRouter key, so you can
          switch any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="@container/models flex flex-col gap-4">
        {sampleMode && (
          <Alert>
            <HugeiconsIcon icon={Plug01Icon} strokeWidth={2} />
            <AlertTitle>Saved for later</AlertTitle>
            <AlertDescription>
              In sample mode, drafts are templates. Connect OpenRouter and the model you pick
              here writes them for real.
            </AlertDescription>
          </Alert>
        )}
        <RadioGroup
          aria-label="Writing model"
          value={selected}
          onValueChange={choose}
          className="@xl/models:grid-cols-2"
        >
          {WRITING_MODELS.map((model) => (
            <FieldLabel key={model.id} htmlFor={`${id}-${model.id}`}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle className="flex-wrap">
                    {model.name}
                    {"tag" in model && <Badge variant="secondary">{model.tag}</Badge>}
                  </FieldTitle>
                  <FieldDescription className="nth-last-2:mt-0">
                    {model.description}
                  </FieldDescription>
                  <span className="text-xs text-muted-foreground">
                    {model.provider} · {costPerDraft(model)}
                  </span>
                </FieldContent>
                <RadioGroupItem value={model.id} id={`${id}-${model.id}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="text-pretty text-muted-foreground">
        Costs are rough estimates for a typical draft, billed by OpenRouter.
      </CardFooter>
    </Card>
  )
}
