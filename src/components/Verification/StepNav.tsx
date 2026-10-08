"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StepNavProps {
  step: number
  isLast: boolean
  onBack: () => void
  onNext: () => void
  isSubmitting?: boolean
  disabled?: boolean
}

/** Sticks above the mobile tab bar so the primary action stays in thumb reach */
export function StepNav({ step, isLast, onBack, onNext, isSubmitting, disabled }: StepNavProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-stroke pt-5",
        "max-md:sticky max-md:bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] max-md:z-10 max-md:border-0 max-md:pt-0 max-md:[&>button]:shadow-[0_12px_28px_-10px_rgb(0_0_0/0.45)]",
      )}
    >
      {step > 0 && (
        <Button type="button" variant="outline" size="xl" onClick={onBack} disabled={isSubmitting} className="max-md:px-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          <span className="max-sm:sr-only">Back</span>
        </Button>
      )}
      <Button
        type="button"
        size="xl"
        variant={isLast ? "brand" : "default"}
        onClick={onNext}
        isLoading={isSubmitting}
        disabled={disabled}
        className="flex-1 md:ml-auto md:flex-none md:min-w-40"
      >
        {isLast ? "Submit for review" : disabled ? "Uploading…" : "Continue"}
        {!isLast && !disabled && <HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
      </Button>
    </div>
  )
}
