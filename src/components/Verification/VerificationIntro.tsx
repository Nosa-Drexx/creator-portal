import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, Money03Icon, SquareUnlock02Icon } from "@hugeicons/core-free-icons"

const BENEFITS = [
  { icon: SquareUnlock02Icon, title: "Publish content", text: "Make videos public or schedule them" },
  { icon: Money03Icon, title: "Get paid", text: "Receive payouts from your sales" },
]

export function VerificationIntro() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-card">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
              <HugeiconsIcon icon={b.icon} size={18} />
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-text-primary">{b.title}</span>
              <span className="text-xs text-text-tertiary">{b.text}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <HugeiconsIcon icon={LockIcon} size={13} className="shrink-0" />
        Your documents are stored privately and only used for verification. Demo: no real identity check is performed.
      </p>
    </div>
  )
}
