"use client"

import { useQuery } from "@tanstack/react-query"
import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { fetchMembers, fetchMyInvitations, fetchRoles, fetchWorkspaceInvitations } from "@/services/api/members"

export const MEMBERS_QUERY_KEY = ["members"] as const
export const ROLES_QUERY_KEY = ["roles"] as const
export const WORKSPACE_INVITATIONS_QUERY_KEY = ["workspace-invitations"] as const
export const MY_INVITATIONS_QUERY_KEY = ["my-invitations"] as const

export function useMembers() {
  const slug = useWorkspaceSlug()
  return useQuery({ queryKey: [...MEMBERS_QUERY_KEY, slug], queryFn: () => fetchMembers(slug) })
}

export function useRoles() {
  const slug = useWorkspaceSlug()
  return useQuery({ queryKey: [...ROLES_QUERY_KEY, slug], queryFn: () => fetchRoles(slug) })
}

/** Only fetched for people who can manage members, so others never hit a 403 */
export function useWorkspaceInvitations() {
  const slug = useWorkspaceSlug()
  const { can } = usePermissions()
  return useQuery({
    queryKey: [...WORKSPACE_INVITATIONS_QUERY_KEY, slug],
    queryFn: () => fetchWorkspaceInvitations(slug),
    enabled: can(EAction.Manage, EModule.Members),
  })
}

export function useMyInvitations() {
  return useQuery({ queryKey: [...MY_INVITATIONS_QUERY_KEY], queryFn: fetchMyInvitations, staleTime: 30_000 })
}
