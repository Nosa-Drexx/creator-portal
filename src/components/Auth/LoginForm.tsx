"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/shared/forms/Field"
import { PasswordInput } from "@/components/shared/forms/PasswordInput"
import { useLogIn } from "@/hooks/mutations/use-auth-mutations"
import { getApiErrorMessage } from "@/lib/axios"
import { loginSchema, type LoginInput } from "@/lib/validation/auth"
import { AuthShell } from "./AuthShell"
import { DemoAccounts } from "./DemoAccounts"

export function LoginForm() {
  const next = useSearchParams().get("next")
  const login = useLogIn(next)
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) => login.mutate(values))

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to manage your videos, sales and workspaces."
      footer={
        <>
          New to CreatorHub?{" "}
          <Link href="/signup" className="font-semibold text-text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {login.isError && (
          <p role="alert" className="animate-rise rounded-xl border border-danger-stroke bg-danger-surface px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {getApiErrorMessage(login.error, "We couldn't log you in. Please try again.")}
          </p>
        )}
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-11" {...form.register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" placeholder="••••••••" className="h-11" {...form.register("password")} />
        </Field>
        <Button type="submit" size="xl" isLoading={login.isPending} className="mt-1 w-full">
          Log in
        </Button>
      </form>
      <DemoAccounts
        disabled={login.isPending}
        onPick={(email, password) => {
          form.reset({ email, password })
          login.mutate({ email, password })
        }}
      />
    </AuthShell>
  )
}
