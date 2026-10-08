"use client"

import { useWatch, type UseFormReturn } from "react-hook-form"
import { Field } from "@/components/shared/forms/Field"
import { SectionCard } from "@/components/shared/SectionCard"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CONTENT_LIMITS } from "@/lib/validation/content"
import { cn } from "@/lib/utils"
import type { ContentFormValues } from "./schema"

export function DetailsSection({ form }: { form: UseFormReturn<ContentFormValues> }) {
  const { register, formState, control } = form
  const description = useWatch({ control, name: "description" })
  const remaining = CONTENT_LIMITS.descriptionMax - (description?.length ?? 0)

  return (
    <SectionCard title="Details" description="What buyers see before they purchase." bodyClassName="gap-5 p-4 sm:p-5">
      <Field label="Title" htmlFor="title" error={formState.errors.title?.message}>
        <Input
          id="title"
          placeholder="e.g. Golden hour landscapes: a field guide"
          autoComplete="off"
          aria-invalid={!!formState.errors.title}
          className="h-11 text-[15px]"
          {...register("title")}
        />
      </Field>
      <Field
        label="Description"
        htmlFor="description"
        optional
        error={formState.errors.description?.message}
        aside={
          <span className={cn("text-xs tabular", remaining < 100 ? "text-warning" : "text-text-tertiary")}>
            {remaining}
          </span>
        }
      >
        <Textarea
          id="description"
          rows={5}
          placeholder="What will viewers learn or enjoy? Mention length, level and anything included."
          aria-invalid={!!formState.errors.description}
          className="min-h-28 resize-y text-[14.5px] leading-relaxed"
          {...register("description")}
        />
      </Field>
      <Field
        label="Price"
        htmlFor="price"
        hint="In USD. Set to 0 to offer it for free."
        error={formState.errors.price?.message}
        className="sm:max-w-[220px]"
      >
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] font-semibold text-text-tertiary">
            $
          </span>
          <Input
            id="price"
            inputMode="decimal"
            placeholder="0.00"
            aria-invalid={!!formState.errors.price}
            className="h-11 pl-7 text-[15px] font-semibold tabular"
            {...register("price")}
          />
        </div>
      </Field>
    </SectionCard>
  )
}
