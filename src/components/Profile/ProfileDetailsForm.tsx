"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/shared/forms/Field"
import { useUpdateProfile } from "@/hooks/mutations/use-profile-mutations"
import { getApiError } from "@/lib/axios"
import { profileSchema, type ProfileInput } from "@/lib/validation/profile"
import type { User } from "@/types/workspace"

export function ProfileDetailsForm({ user }: { user: User }) {
  const update = useUpdateProfile()
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  })
  const { errors, isDirty } = form.formState

  useEffect(() => {
    form.reset({ name: user.name, email: user.email })
  }, [user.name, user.email, form])

  const onSubmit = form.handleSubmit((values) =>
    update.mutate(values, {
      onError: (error) => form.setError("email", { message: getApiError(error)?.message ?? "Couldn't save changes" }),
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="profile-name" error={errors.name?.message}>
          <Input id="profile-name" autoComplete="name" className="h-11" {...form.register("name")} />
        </Field>
        <Field label="Email" htmlFor="profile-email" error={errors.email?.message}>
          <Input id="profile-email" type="email" autoComplete="email" className="h-11" {...form.register("email")} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        {isDirty && (
          <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={update.isPending}>
            Discard
          </Button>
        )}
        <Button type="submit" disabled={!isDirty} isLoading={update.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  )
}
