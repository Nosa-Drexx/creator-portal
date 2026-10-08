import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"

const BARS = [38, 52, 44, 63, 58, 72, 66, 84, 78, 92]

/** Decorative product preview; purely visual, hidden on small screens */
export function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden rounded-[28px] bg-ink-900 p-10 text-white lg:flex lg:flex-col lg:justify-between dark:bg-surface">
      <span aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-brand opacity-30 blur-3xl" />
      <span aria-hidden className="absolute -bottom-32 -left-20 size-72 rounded-full bg-info opacity-15 blur-3xl" />

      <div className="relative flex max-w-sm flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-white/50 uppercase">Creator portal</span>
        <h2 className="text-[30px] leading-tight font-bold">Publish videos people pay for. Know exactly how they perform.</h2>
      </div>

      <div className="relative flex flex-col gap-3">
        <div className="w-full max-w-sm animate-rise rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[13px] text-white/60">
            Revenue this month
            <span className="inline-flex items-center gap-0.5 rounded-md bg-white/10 px-1.5 py-0.5 text-[11.5px] font-bold text-white">
              <HugeiconsIcon icon={ArrowUp01Icon} size={12} strokeWidth={2.5} />
              18%
            </span>
          </div>
          <p className="mt-2 text-[32px] font-bold tracking-tight tabular">$12,480</p>
          <div className="mt-4 flex h-16 items-end gap-1.5">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="flex-1 origin-bottom animate-[grow-y_0.9s_var(--ease-out-soft)_both] rounded-t-[4px] bg-brand/80 last:bg-brand"
                style={{ height: `${h}%`, animationDelay: `${300 + i * 45}ms` }}
              />
            ))}
          </div>
        </div>
        <div
          className="flex w-fit animate-rise items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pr-3.5 pl-1.5 text-[13px] ring-1 ring-white/10"
          style={{ animationDelay: "250ms" }}
        >
          <span className="grid size-6 place-items-center rounded-full bg-success/20 text-success">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} />
          </span>
          Identity verified · publishing unlocked
        </div>
      </div>
    </div>
  )
}
