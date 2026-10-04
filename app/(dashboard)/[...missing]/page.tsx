import type { Metadata } from "next"
import { notFound } from "next/navigation"

// The not-found page titles the first load, but the browser takes the tab title from this
// page once it's running, so it needs to say Not found too.
export const metadata: Metadata = { title: "Not found" }

/** Catches every address no other page matches, so it gets the dashboard's not-found page. */
export default function MissingPage() {
  notFound()
}
