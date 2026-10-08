"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Mail01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field } from "@/components/shared/forms/Field"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { ESystemRole } from "@/constants/permissions"
import { useInviteMember } from "@/hooks/mutations/use-member-mutations"
import { useRoles } from "@/hooks/queries/use-members"
import { getApiErrorMessage } from "@/lib/axios"
import { inviteSchema, type InviteInput } from "@/lib/validation/members"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-stroke bg-muted/50 p-1.5 pl-3">
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary" title={url}>
        {url}
      </span>
      <Button type="button" size="sm" variant={copied ? "secondary" : "default"} onClick={copy} className="shrink-0">
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={14} className={copied ? "animate-pop" : undefined} />
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  )
}

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const { data: roles = [] } = useRoles()
  const invite = useInviteMember()
  const [created, setCreated] = useState<{ email: string; url: string } | null>(null)
  const editorRoleId = roles.find((r) => r.systemKey === ESystemRole.Editor)?.id ?? ""

  const form = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", roleId: editorRoleId },
  })
  const { errors } = form.formState
  const selectedRoleId = useWatch({ control: form.control, name: "roleId" })

  // Fresh form whenever the modal opens (and once roles have loaded)
  useEffect(() => {
    if (open) form.reset({ email: "", roleId: editorRoleId })
  }, [open, editorRoleId, form])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCreated(null)
      invite.reset()
    }
    onOpenChange(next)
  }

  const onSubmit = form.handleSubmit((values) =>
    invite.mutate(values, {
      onSuccess: ({ inviteUrl, invitation }) =>
        setCreated({ email: invitation.email, url: `${window.location.origin}${inviteUrl}` }),
      onError: (error) =>
        form.setError("email", { message: getApiErrorMessage(error, "We couldn't create that invitation.") }),
    }),
  )

  const inviteAnother = () => {
    form.reset({ email: "", roleId: form.getValues("roleId") })
    setCreated(null)
    invite.reset()
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleOpenChange}
      isPerformingAction={invite.isPending}
      title={created ? "Invitation ready" : "Invite a member"}
      description={
        created
          ? undefined
          : "They'll join with the role you choose. You can change it any time."
      }
      footer={
        created ? (
          <>
            <Button variant="outline" size="lg" onClick={inviteAnother}>
              Invite another
            </Button>
            <Button size="lg" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="lg" onClick={() => handleOpenChange(false)} disabled={invite.isPending}>
              Cancel
            </Button>
            <Button size="lg" onClick={onSubmit} isLoading={invite.isPending}>
              Create invitation
            </Button>
          </>
        )
      }
    >
      {created ? (
        <div className="flex animate-rise flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl bg-success-surface p-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success text-white">
              <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} className="animate-pop" />
            </span>
            <p className="text-[13.5px] leading-relaxed text-text-primary">
              We don&apos;t send emails in this demo, so share this link. Only{" "}
              <span className="font-semibold break-all">{created.email}</span> can accept it, and it expires in 14 days.
            </p>
          </div>
          <CopyLink url={created.url} />
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <Field label="Email" htmlFor="invite-email" error={errors.email?.message}>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-tertiary"
              />
              <Input
                id="invite-email"
                type="email"
                autoComplete="off"
                autoFocus
                placeholder="teammate@example.com"
                className="h-11 pl-9"
                {...form.register("email")}
              />
            </div>
          </Field>
          <Field label="Role" hint={roles.find((r) => r.id === selectedRoleId)?.description} error={errors.roleId?.message}>
            <Controller
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Role" className="h-11 w-full rounded-[10px] border-stroke-strong bg-surface">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="rounded-xl">
                    {roles
                      .filter((role) => role.systemKey !== ESystemRole.Owner)
                      .map((role) => (
                      <SelectItem key={role.id} value={role.id} className="rounded-lg">
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </form>
      )}
    </ResponsiveModal>
  )
}
