"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/constants/demo"
import { initials } from "@/lib/format"

interface DemoAccountsProps {
  onPick: (email: string, password: string) => void
  disabled?: boolean
}

/** One-click sign-in with seeded accounts so reviewers can explore immediately */
export function DemoAccounts({ onPick, disabled }: DemoAccountsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium text-text-tertiary">
        <span className="h-px flex-1 bg-stroke" />
        Demo accounts
        <span className="h-px flex-1 bg-stroke" />
      </div>
      <div className="flex flex-col gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={disabled}
            onClick={() => onPick(account.email, DEMO_PASSWORD)}
            className="group flex items-center gap-3 rounded-xl border border-stroke bg-surface p-2.5 text-left transition-[border-color,background-color] duration-200 hover:border-stroke-strong hover:bg-muted/50 disabled:opacity-60"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
              {initials(account.name)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[13.5px] font-semibold">{account.name}</span>
              <span className="truncate text-xs text-text-tertiary">{account.description}</span>
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              className="text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-text-tertiary">
        Password for all demo accounts: <code className="rounded bg-muted px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>
      </p>
    </div>
  )
}
