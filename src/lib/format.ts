import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const number = new Intl.NumberFormat("en-US")

export function formatCurrency(cents: number, options: { whole?: boolean; compact?: boolean } = {}) {
  const dollars = cents / 100
  if (options.compact && Math.abs(dollars) >= 10_000) return `$${compact.format(dollars)}`
  return (options.whole ? usdWhole : usd).format(dollars)
}

export function formatPrice(cents: number) {
  return cents === 0 ? "Free" : formatCurrency(cents)
}

export const formatNumber = (value: number) => number.format(value)
export const formatCompact = (value: number) => (value < 10_000 ? number.format(value) : compact.format(value))

export function formatDate(iso: string, pattern = "d MMM yyyy") {
  return format(new Date(iso), pattern)
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "d MMM yyyy, HH:mm")
}

export function formatRelativeDay(iso: string) {
  const date = new Date(iso)
  if (isToday(date)) return `Today, ${format(date, "HH:mm")}`
  if (isYesterday(date)) return `Yesterday, ${format(date, "HH:mm")}`
  return format(date, "d MMM, HH:mm")
}

export const formatTimeAgo = (iso: string) => formatDistanceToNowStrict(new Date(iso), { addSuffix: true })

export function formatDuration(seconds: number | null) {
  if (!seconds) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`
}

export function formatBytes(bytes: number | null) {
  if (!bytes) return "—"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatPercentChange(current: number, previous: number) {
  // No baseline means a percentage would be meaningless
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null

export const countryName = (code: string) => regionNames?.of(code) ?? code

export const countryFlag = (code: string) =>
  code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}
