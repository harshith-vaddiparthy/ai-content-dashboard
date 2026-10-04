"use client"

import * as React from "react"
import { ComputerIcon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTheme } from "next-themes"

import {
  Card,
  CardContent,
  CardDescription,
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
import { useMounted } from "@/hooks/use-mounted"

const THEMES = [
  { value: "light", label: "Light", description: "Bright and warm. The default.", icon: Sun01Icon },
  { value: "dark", label: "Dark", description: "Easier on the eyes at night.", icon: Moon02Icon },
  {
    value: "system",
    label: "Automatic",
    description: "Follows your computer's light or dark setting.",
    icon: ComputerIcon,
  },
] as const

type Theme = (typeof THEMES)[number]["value"]

function isTheme(value: unknown): value is Theme {
  return THEMES.some((option) => option.value === value)
}

/** Light, dark, or whatever the computer is set to. Saved in this browser. */
export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const id = React.useId()
  // The saved theme lives in the browser, so nothing is picked until the page is running there.
  const current = mounted && isTheme(theme) ? theme : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Saved in this browser only.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          aria-label="Theme"
          value={current}
          onValueChange={(value) => {
            if (isTheme(value)) setTheme(value)
          }}
        >
          {THEMES.map((option) => (
            <FieldLabel key={option.value} htmlFor={`${id}-${option.value}`}>
              <Field orientation="horizontal">
                <HugeiconsIcon
                  icon={option.icon}
                  strokeWidth={2}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <FieldContent>
                  <FieldTitle>{option.label}</FieldTitle>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
