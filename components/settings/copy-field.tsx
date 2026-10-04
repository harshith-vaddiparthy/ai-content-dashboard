"use client"

import { Copy01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { copyText } from "@/lib/clipboard"

/** Text you'll paste somewhere else, like the name of a setting, with a button that copies it. */
export function CopyField({ value, label }: { value: string; label: string }) {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput
        readOnly
        value={value}
        aria-label={label}
        className="font-mono"
        onFocus={(event) => event.currentTarget.select()}
      />
      <InputGroupAddon align="inline-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <InputGroupButton
                size="icon-xs"
                aria-label={`Copy ${label.toLowerCase()}`}
                onClick={() => copyText(value, `Copied ${value}`)}
              />
            }
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  )
}
