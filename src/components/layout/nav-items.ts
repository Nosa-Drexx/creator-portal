import {
  CheckmarkBadge01Icon,
  DashboardSquare02Icon,
  Settings02Icon,
  ShoppingBag02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { routes } from "@/constants/routes"

export interface NavItem {
  id: "overview" | "content" | "purchases" | "verification" | "settings"
  label: string
  icon: IconSvgElement
  href: (slug: string) => string
  /** Match nested routes as active */
  matchPrefix: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: DashboardSquare02Icon, href: routes.overview, matchPrefix: false },
  { id: "content", label: "Content", icon: Video01Icon, href: routes.content, matchPrefix: true },
  { id: "purchases", label: "Purchases", icon: ShoppingBag02Icon, href: routes.purchases, matchPrefix: true },
  { id: "verification", label: "Verification", icon: CheckmarkBadge01Icon, href: routes.verification, matchPrefix: true },
  { id: "settings", label: "Demo & settings", icon: Settings02Icon, href: routes.settings, matchPrefix: true },
]

export function isNavActive(item: NavItem, slug: string, pathname: string) {
  const href = item.href(slug)
  return item.matchPrefix ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href
}
