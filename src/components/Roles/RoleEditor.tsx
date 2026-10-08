"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Copy01Icon, Delete02Icon, SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/shared/ConfirmationModal"
import { CustomDrawer } from "@/components/shared/CustomDrawer"
import { Field } from "@/components/shared/forms/Field"
import { EAction, EModule } from "@/constants/permissions"
import { useDeleteRole, useSaveRole } from "@/hooks/mutations/use-member-mutations"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePermissions } from "@/hooks/use-permissions"
import { getApiErrorMessage } from "@/lib/axios"
import { roleSchema } from "@/lib/validation/members"
import type { RoleSummary } from "@/types/members"
import { PermissionsPicker } from "./PermissionsPicker"
import { expandPermissions, isBuiltIn } from "./role-utils"

type FormIn = z.input<typeof roleSchema>
type FormOut = z.output<typeof roleSchema>

interface RoleEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null opens the editor in create mode */
  role: RoleSummary | null
}

export function RoleEditor({ open, onOpenChange, role }: RoleEditorProps) {
  const isMobile = useIsMobile()
  return (
    <CustomDrawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
      className="sm:max-w-[480px]!"
    >
      {/* Keyed so switching roles always starts from a clean form */}
      {open && <RoleEditorForm key={role?.id ?? "new"} role={role} onClose={() => onOpenChange(false)} />}
    </CustomDrawer>
  )
}

function RoleEditorForm({ role, onClose }: { role: RoleSummary | null; onClose: () => void }) {
  const { can } = usePermissions()
  const canManageRoles = can(EAction.Manage, EModule.Roles)
  const [duplicateOf, setDuplicateOf] = useState<RoleSummary | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const editing = duplicateOf ? null : role
  const readOnly = !!editing && (isBuiltIn(editing) || !canManageRoles)
  const save = useSaveRole(editing?.id)
  const remove = useDeleteRole()

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role ? expandPermissions(role.permissions) : [],
    },
  })
  const { errors } = form.formState

  const duplicate = () => {
    if (!role) return
    setDuplicateOf(role)
    save.reset()
    form.reset({
      name: `${role.name} (custom)`,
      description: role.description,
      permissions: expandPermissions(role.permissions),
    })
  }

  const onSubmit = form.handleSubmit((values) => save.mutate(values, { onSuccess: onClose }))

  const title = editing ? editing.name : duplicateOf ? "Duplicate role" : "Create role"
  const subtitle = editing
    ? readOnly
      ? isBuiltIn(editing)
        ? "Built-in roles can't be edited. Duplicate it to make a custom version."
        : "You can view this role, but only people who can manage roles can change it."
      : `${editing.memberCount} ${editing.memberCount === 1 ? "member has" : "members have"} this role`
    : "Choose exactly what people with this role can see and do."

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-stroke px-5 pt-5 pb-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="flex items-center gap-2 truncate text-lg font-semibold tracking-tight">
            {readOnly && <HugeiconsIcon icon={SquareLock02Icon} size={16} className="shrink-0 text-text-tertiary" />}
            {title}
          </h2>
          <p className="text-[13px] text-text-secondary">{subtitle}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close" className="max-md:hidden">
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 py-5">
        {save.isError && (
          <p role="alert" className="animate-rise rounded-xl border border-danger-stroke bg-danger-surface px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {getApiErrorMessage(save.error, "We couldn't save this role.")}
          </p>
        )}
        <Field label="Role name" htmlFor="role-name" error={errors.name?.message}>
          <Input id="role-name" disabled={readOnly} placeholder="e.g. Video Producer" className="h-11" {...form.register("name")} />
        </Field>
        <Field label="Description" htmlFor="role-description" optional error={errors.description?.message}>
          <Textarea
            id="role-description"
            rows={2}
            disabled={readOnly}
            placeholder="What is this role for?"
            className="resize-none"
            {...form.register("description")}
          />
        </Field>
        <Field label="Permissions" error={errors.permissions?.message}>
          <Controller
            control={form.control}
            name="permissions"
            render={({ field }) => <PermissionsPicker value={field.value} onChange={field.onChange} readOnly={readOnly} />}
          />
        </Field>
      </div>

      <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-stroke bg-surface/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {editing && !isBuiltIn(editing) && canManageRoles && (
            <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} className="max-sm:flex-1">
              <HugeiconsIcon icon={Delete02Icon} size={15} />
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2 max-sm:flex-col-reverse">
          {readOnly ? (
            <>
              <Button type="button" variant="outline" size="lg" onClick={onClose} className="max-sm:w-full">
                Close
              </Button>
              {isBuiltIn(editing!) && canManageRoles && (
                <Button type="button" size="lg" onClick={duplicate} className="max-sm:w-full">
                  <HugeiconsIcon icon={Copy01Icon} size={15} />
                  Duplicate as custom role
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={save.isPending} className="max-sm:w-full">
                Cancel
              </Button>
              <Button type="submit" size="lg" isLoading={save.isPending} className="max-sm:w-full">
                {editing ? "Save changes" : "Create role"}
              </Button>
            </>
          )}
        </div>
      </footer>

      {editing && (
        <ConfirmationModal
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete this role?"
          description={
            editing.memberCount > 0
              ? `${editing.memberCount} ${editing.memberCount === 1 ? "member still has" : "members still have"} this role. Move them to another role first.`
              : `"${editing.name}" will be removed. This can't be undone.`
          }
          confirmLabel="Delete role"
          isLoading={remove.isPending}
          onConfirm={() =>
            remove.mutate(editing.id, {
              onSuccess: () => {
                setConfirmDelete(false)
                onClose()
              },
              onSettled: () => setConfirmDelete(false),
            })
          }
        />
      )}
    </form>
  )
}
