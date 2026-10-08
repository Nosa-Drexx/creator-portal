"use client"

import { ThemeToggle } from "./ThemeToggle"
import { UserMenu } from "./UserMenu"

export function UserCard() {
  return (
    <div className="flex items-center gap-2 collapsed:flex-col">
      <UserMenu detailed className="flex-1" />
      <ThemeToggle />
    </div>
  )
}
