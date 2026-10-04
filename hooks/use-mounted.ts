"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * False during the server render and the first paint, true once the page is
 * running in the browser. Use it for anything the server can't know, like the
 * theme saved on this device.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
