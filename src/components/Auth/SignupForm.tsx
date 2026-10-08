"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/shared/forms/Field"
import { PasswordInput } from "@/components/shared/forms/PasswordInput"
import { useSignUp } from "@/hooks/mutations/use-auth-mutations"
import { getApiError } from "@/lib/axios"
import { signupSchema, type SignupInput } from "@/lib/validation/auth"
import { AuthShell } from "./AuthShell"

export function SignupForm() {
  const signup = useSignUp()
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  })
  const { errors } = form.formState
  const apiError = getApiError(signup.error)

  const onSubmit = form.handleSubmit((values) => signup.mutate(values))

  return (
    <AuthShell
      title="Create your account"
      description="Start publishing in minutes. You'll set up your first workspace next."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {apiError && (
          <p role="alert" className="animate-rise rounded-xl border border-danger-stroke bg-danger-surface px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {apiError.message}
          </p>
        )}
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Amara Lewis" className="h-11" {...form.register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-11" {...form.register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters, with a letter and a number." error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" className="h-11" {...form.register("password")} />
        </Field>
        <Button type="submit" size="xl" isLoading={signup.isPending} className="mt-1 w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  )
}
