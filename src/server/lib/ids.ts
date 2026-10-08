import { randomUUID } from "node:crypto"

export type IdPrefix = "usr" | "ws" | "mem" | "ver" | "cnt" | "pur" | "upl"

export function newId(prefix: IdPrefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 18)}`
}
