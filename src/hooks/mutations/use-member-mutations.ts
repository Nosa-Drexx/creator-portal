"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { routes } from "@/constants/routes"
import {
  MEMBERS_QUERY_KEY,
  MY_INVITATIONS_QUERY_KEY,
  ROLES_QUERY_KEY,
  WORKSPACE_INVITATIONS_QUERY_KEY,
} from "@/hooks/queries/use-members"
import { SESSION_QUERY_KEY } from "@/hooks/queries/use-session"
import { WORKSPACE_QUERY_KEY } from "@/hooks/queries/use-workspace"
import { customToast } from "@/hooks/use-toast"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { getApiErrorMessage } from "@/lib/axios"
import type { InviteInput, RoleInput } from "@/lib/validation/members"
import * as api from "@/services/api/members"

const toastError = (fallback: string) => (error: unknown) => customToast("error", getApiErrorMessage(error, fallback))

function useInvalidateTeam() {
  const queryClient = useQueryClient()
  const slug = useWorkspaceSlug()
  return () => {
    for (const key of [MEMBERS_QUERY_KEY, ROLES_QUERY_KEY, WORKSPACE_INVITATIONS_QUERY_KEY, WORKSPACE_QUERY_KEY]) {
      queryClient.invalidateQueries({ queryKey: [...key, slug] })
    }
    queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
  }
}

export function useChangeMemberRole() {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: string; roleId: string }) => api.changeMemberRole(slug, memberId, roleId),
    onSuccess: () => {
      invalidate()
      customToast("success", "Role updated")
    },
    onError: toastError("We couldn't change that role."),
  })
}

export function useRemoveMember() {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (memberId: string) => api.removeMember(slug, memberId),
    onSuccess: () => invalidate(),
    onError: toastError("We couldn't remove that member."),
  })
}

export function useInviteMember() {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (payload: InviteInput) => api.inviteMember(slug, payload),
    onSuccess: () => invalidate(),
  })
}

export function useRevokeInvitation() {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (invitationId: string) => api.revokeInvitation(slug, invitationId),
    onSuccess: () => {
      invalidate()
      customToast("success", "Invitation revoked")
    },
    onError: toastError("We couldn't revoke that invitation."),
  })
}

export function useSaveRole(roleId?: string) {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (payload: RoleInput) => (roleId ? api.updateRole(slug, roleId, payload) : api.createRole(slug, payload)),
    onSuccess: () => {
      invalidate()
      customToast("success", roleId ? "Role updated" : "Role created")
    },
  })
}

export function useDeleteRole() {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (roleId: string) => api.deleteRole(slug, roleId),
    onSuccess: () => {
      invalidate()
      customToast("success", "Role deleted")
    },
    onError: toastError("We couldn't delete that role."),
  })
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [...MY_INVITATIONS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
  }
  const accept = useMutation({
    mutationFn: api.acceptInvitation,
    onSuccess: ({ slug }) => {
      refresh()
      customToast("success", "You've joined the workspace")
      router.push(routes.overview(slug))
    },
    onError: toastError("We couldn't accept that invitation."),
  })
  const decline = useMutation({ mutationFn: api.declineInvitation, onSuccess: refresh, onError: toastError("Something went wrong.") })
  return { accept, decline }
}
