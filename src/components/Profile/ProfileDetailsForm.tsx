"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/shared/forms/Field"
import { useSaveProfile, type PhotoChange } from "@/hooks/mutations/use-profile-mutations"
import { useObjectUrl } from "@/hooks/use-object-url"
import { customToast } from "@/hooks/use-toast"
import { getApiError } from "@/lib/axios"
import { profileSchema, type ProfileInput } from "@/lib/validation/profile"
import type { User } from "@/types/workspace"
import { AvatarField } from "./AvatarField"

export function ProfileDetailsForm({ user }: { user: User }) {
  const save = useSaveProfile()
  const [photo, setPhoto] = useState<PhotoChange>(null)
  const preview = useObjectUrl(photo instanceof Blob ? photo : null)
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  })
  const { errors, isDirty: nameChanged } = form.formState
  const isDirty = nameChanged || photo !== null
  const avatarUrl = photo === "remove" ? null : (preview ?? user.avatarUrl)

  useEffect(() => {
    form.reset({ name: user.name })
  }, [user.name, form])

  const discard = () => {
    form.reset()
    setPhoto(null)
  }

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(
      { name: nameChanged ? values.name : undefined, photo },
      {
        onSuccess: () => setPhoto(null),
        onError: (error) => {
          const message = getApiError(error)?.message ?? "Couldn't save changes"
          if (nameChanged) form.setError("name", { message })
          else customToast("error", message)
        },
      },
    ),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <AvatarField
        name={user.name}
        avatarUrl={avatarUrl}
        disabled={save.isPending}
        onPick={setPhoto}
        onRemove={() => setPhoto(user.avatarUrl ? "remove" : null)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="profile-name" error={errors.name?.message}>
          <Input id="profile-name" autoComplete="name" className="h-11" {...form.register("name")} />
        </Field>
        <Field label="Email" htmlFor="profile-email" hint="Your email is your login and can't be changed.">
          <Input id="profile-email" type="email" value={user.email} disabled readOnly className="h-11" />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        {isDirty && (
          <Button type="button" variant="ghost" onClick={discard} disabled={save.isPending}>
            Discard
          </Button>
        )}
        <Button type="submit" disabled={!isDirty} isLoading={save.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  )
}
