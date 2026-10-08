"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { EASE_OUT_SOFT } from "@/components/shared/motion/easing"
import { cn } from "@/lib/utils"
import { WIZARD_STEPS } from "./constant"

interface WizardStepperProps {
  current: number
  onStepClick: (step: number) => void
}

export function WizardStepper({ current, onStepClick }: WizardStepperProps) {
  const total = WIZARD_STEPS.length

  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-text-primary">{WIZARD_STEPS[current].label}</span>
          <span className="text-text-tertiary tabular">
            Step {current + 1} of {total}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={false}
            animate={{ width: `${((current + 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: EASE_OUT_SOFT }}
          />
        </div>
      </div>

      <ol className="hidden items-center md:flex" aria-label="Verification steps">
        {WIZARD_STEPS.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={step.id} className={cn("flex items-center", index < total - 1 && "flex-1")}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onStepClick(index)}
                aria-current={active ? "step" : undefined}
                className="group flex items-center gap-2.5 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-[background-color,color,box-shadow] duration-300",
                    done && "bg-brand text-brand-foreground group-hover:ring-4 group-hover:ring-brand/15",
                    active && "bg-ink-900 text-ink-0 ring-4 ring-ink-900/10 dark:bg-ink-50 dark:text-ink-950",
                    !done && !active && "bg-muted text-text-tertiary",
                  )}
                >
                  {done ? <HugeiconsIcon icon={Tick02Icon} size={15} strokeWidth={2.8} /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-semibold whitespace-nowrap transition-colors",
                    active || done ? "text-text-primary" : "text-text-tertiary",
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < total - 1 && (
                <span className="relative mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-brand"
                    initial={false}
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT_SOFT }}
                  />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}
