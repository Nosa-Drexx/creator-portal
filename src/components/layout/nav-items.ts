import {
  CheckmarkBadge01Icon,
  DashboardSquare02Icon,
  Settings02Icon,
  ShoppingBag02Icon,
  UserGroupIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { canRead } from "@/components/shared/Permissions/Permissions.utils"
import { EModule } from "@/constants/permissions"
import { routes } from "@/constants/routes"

export interface NavItem {
  id: "overview" | "content" | "purchases" | "members" | "verification" | "settings"
  label: string
  shortLabel?: string
  icon: IconSvgElement
  href: (slug: string) => string
  /** Visible when the member can read this module; undefined = always visible */
  module?: EModule
  /** Match nested routes as active */
  matchPrefix: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: DashboardSquare02Icon, href: routes.overview, module: EModule.Analytics, matchPrefix: false },
  { id: "content", label: "Content", icon: Video01Icon, href: routes.content, module: EModule.Content, matchPrefix: true },
  { id: "purchases", label: "Purchases", icon: ShoppingBag02Icon, href: routes.purchases, module: EModule.Purchases, matchPrefix: true },
  { id: "members", label: "Team", icon: UserGroupIcon, href: routes.members, module: EModule.Members, matchPrefix: true },
  { id: "verification", label: "Verification", shortLabel: "Verify", icon: CheckmarkBadge01Icon, href: routes.verification, module: EModule.Verification, matchPrefix: true },
  { id: "settings", label: "Demo & settings", icon: Settings02Icon, href: routes.settings, matchPrefix: true },
]

export function isNavActive(item: NavItem, slug: string, pathname: string) {
  const href = item.href(slug)
  return item.matchPrefix ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href
}

export function navItemsForPermissions(permissions: readonly string[]) {
  return NAV_ITEMS.filter((item) => !item.module || canRead(permissions, item.module))
}

/** First page this member can open, used after login and when switching workspaces */
export function landingPathFor(slug: string, permissions: readonly string[]) {
  const [first] = navItemsForPermissions(permissions)
  return first.href(slug)
}
