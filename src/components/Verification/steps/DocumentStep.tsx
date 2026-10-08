"use client"

import { useFormContext } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { EUploadKind } from "@/enums/uploads"
import type { VerificationFormValues } from "@/lib/validation/verification"
import { cn } from "@/lib/utils"
import { DOCUMENT_TIPS, DOCUMENT_TYPES } from "../constant"
import { UploadDropzone } from "../UploadDropzone"
import { FIELD_LABEL, FIELD_MESSAGE } from "./PersonalInfoStep"
import { StepHeading } from "./StepHeading"

export function DocumentStep({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const form = useFormContext<VerificationFormValues>()

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Upload an identity document"
        description="Choose a government-issued photo ID, then add a clear photo of it."
      />

      <FormField
        control={form.control}
        name="documentType"
        render={({ field }) => (
          <FormItem>
            <span className={FIELD_LABEL}>Document type</span>
            <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-3">
              {DOCUMENT_TYPES.map((option) => {
                const selected = field.value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      field.onChange(option.value)
                      form.trigger("documentType")
                    }}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl border bg-surface p-3.5 text-left transition-[border-color,box-shadow,background-color] duration-200 sm:flex-col sm:items-start sm:gap-4",
                      selected
                        ? "border-brand bg-brand-soft ring-3 ring-brand/15"
                        : "border-stroke-strong hover:border-ink-400",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-xl transition-colors",
                        selected ? "bg-brand text-brand-foreground" : "bg-muted text-text-secondary",
                      )}
                    >
                      <HugeiconsIcon icon={option.icon} size={20} />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-text-primary">{option.label}</span>
                      <span className="text-xs text-text-tertiary">{option.hint}</span>
                    </span>
                    {selected && (
                      <span className="absolute top-3 right-3 grid size-5 animate-pop place-items-center rounded-full bg-brand text-brand-foreground">
                        <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <FormMessage className={FIELD_MESSAGE} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documentKey"
        render={({ field, fieldState }) => (
          <FormItem>
            <span className={FIELD_LABEL}>Photo of your document</span>
            <FormControl>
              <div>
                <UploadDropzone
                  kind={EUploadKind.Document}
                  value={field.value}
                  invalid={!!fieldState.error}
                  onBusyChange={onBusyChange}
                  title="Upload a photo or scan"
                  onChange={(key) => {
                    field.onChange(key)
                    if (key) form.trigger("documentKey")
                  }}
                />
              </div>
            </FormControl>
            <FormMessage className={FIELD_MESSAGE} />
          </FormItem>
        )}
      />

      <ul className="grid gap-2 rounded-xl bg-muted/60 p-3.5 sm:grid-cols-3">
        {DOCUMENT_TIPS.map((tip) => (
          <li key={tip} className="flex items-center gap-2 text-xs text-text-secondary">
            <HugeiconsIcon icon={Tick02Icon} size={14} className="shrink-0 text-success" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}
