"use client"

import { Controller, useWatch, type UseFormReturn } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/shared/forms/Field"
import { WorkspaceAvatar } from "@/components/shared/WorkspaceAvatar"
import { ACCENT_COLORS } from "@/constants/workspace"
import type { CreateWorkspaceInput } from "@/lib/validation/workspace"
import { cn } from "@/lib/utils"

export function WorkspaceFormFields({ form }: { form: UseFormReturn<CreateWorkspaceInput> }) {
  const { errors } = form.formState
  const [name, handle, accentColor] = useWatch({ control: form.control, name: ["name", "handle", "accentColor"] })

  return (
    <>
    <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
      <WorkspaceAvatar
        name={name || "New workspace"}
        color={accentColor}
        className="size-10 rounded-xl text-sm transition-colors duration-300"
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{name || "New workspace"}</span>
        <span className="truncate text-xs text-text-tertiary">{handle ? `@${handle.replace(/^@/, "")}` : "@handle"}</span>
      </div>
    </div>

    <Field label="Name" htmlFor="ws-name" error={errors.name?.message}>
      <Input id="ws-name" autoFocus placeholder="e.g. Wild Frames" className="h-11" {...form.register("name")} />
    </Field>
    <Field label="Handle" htmlFor="ws-handle" hint="Shown to buyers on your videos." error={errors.handle?.message}>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-tertiary">@</span>
        <Input id="ws-handle" className="h-11 pl-7" {...form.register("handle", { setValueAs: (v: string) => v.replace(/^@/, "") })} />
      </div>
    </Field>
    <Field label="Accent colour" error={errors.accentColor?.message}>
      <Controller
        control={form.control}
        name="accentColor"
        render={({ field }) => (
          <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap gap-2.5">
            {ACCENT_COLORS.map((color) => {
              const selected = field.value === color.value
              return (
                <button
                  key={color.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color.label}
                  onClick={() => field.onChange(color.value)}
                  className={cn(
                    "grid size-9 place-items-center rounded-full text-white ring-offset-2 ring-offset-surface transition-transform duration-200 ease-out-soft hover:scale-105 active:scale-95",
                    selected && "ring-2 ring-text-primary",
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {selected && <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} className="animate-pop" />}
                </button>
              )
            })}
          </div>
        )}
      />
    </Field>
    </>
  )
}
