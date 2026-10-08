"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/shared/forms/Field"
import { PasswordInput } from "@/components/shared/forms/PasswordInput"
import { useChangePassword } from "@/hooks/mutations/use-profile-mutations"
import { getApiError } from "@/lib/axios"
import { passwordChangeSchema, type PasswordChangeInput } from "@/lib/validation/profile"

const EMPTY: PasswordChangeInput = { currentPassword: "", newPassword: "", confirmPassword: "" }

export function PasswordForm() {
  const change = useChangePassword()
  const form = useForm<PasswordChangeInput>({ resolver: zodResolver(passwordChangeSchema), defaultValues: EMPTY })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) =>
    change.mutate(values, {
      onSuccess: () => form.reset(EMPTY),
      onError: (error) => {
        const fieldErrors = getApiError(error)?.fieldErrors ?? {}
        Object.entries(fieldErrors).forEach(([field, [message]]) =>
          form.setError(field as keyof PasswordChangeInput, { message }),
        )
      },
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Current password" htmlFor="current-password" error={errors.currentPassword?.message} className="sm:max-w-[calc(50%-0.5rem)]">
        <PasswordInput id="current-password" autoComplete="current-password" className="h-11" {...form.register("currentPassword")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="new-password" hint="8+ characters with a letter and a number." error={errors.newPassword?.message}>
          <PasswordInput id="new-password" autoComplete="new-password" className="h-11" {...form.register("newPassword")} />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm-password" error={errors.confirmPassword?.message}>
          <PasswordInput id="confirm-password" autoComplete="new-password" className="h-11" {...form.register("confirmPassword")} />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={change.isPending}>
          Update password
        </Button>
      </div>
    </form>
  )
}
