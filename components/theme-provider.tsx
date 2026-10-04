"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Light and dark mode. The choice is saved on this device. */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
