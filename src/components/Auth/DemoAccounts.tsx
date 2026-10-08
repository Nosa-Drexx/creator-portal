"use client"

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/constants/demo"
import { initials } from "@/lib/format"

interface DemoAccountsProps {
  onPick: (email: string, password: string) => void
  disabled?: boolean
}

/** One-click sign-in with seeded accounts so reviewers can explore each role immediately */
export function DemoAccounts({ onPick, disabled }: DemoAccountsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium text-text-tertiary">
        <span className="h-px flex-1 bg-stroke" />
        Or try a demo account
        <span className="h-px flex-1 bg-stroke" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((account, index) => (
          <button
            key={account.email}
            type="button"
            disabled={disabled}
            title={account.description}
            onClick={() => onPick(account.email, DEMO_PASSWORD)}
            className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-stroke bg-surface p-2 text-left transition-[border-color,background-color,transform] duration-200 ease-out-soft last:odd:col-span-2 hover:border-stroke-strong hover:bg-muted/50 active:scale-[0.98] disabled:opacity-60"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">
              {initials(account.name)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-semibold">{account.name.split(" ")[0]}</span>
              <span className="truncate text-[11.5px] text-text-tertiary">{account.role}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-text-tertiary">
        Password for every demo account: <code className="rounded bg-muted px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>
      </p>
    </div>
  )
}
