import { toast } from "sonner"

/** Copies text and says whether it worked. */
export async function copyText(text: string, done = "Copied") {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(done)
  } catch {
    toast.error("Couldn't copy. Select the text and copy it by hand instead.")
  }
}

/** Copies a piece as Markdown, with its title as the top heading, and says whether it worked. */
export function copyAsMarkdown(title: string, body: string) {
  return copyText(`# ${title.trim()}\n\n${body.trim()}\n`, "Copied as Markdown")
}
