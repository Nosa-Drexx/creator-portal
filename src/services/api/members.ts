import { apiClient, type Envelope } from "@/lib/axios"
import type { InviteInput, RoleInput } from "@/lib/validation/members"
import type { AcceptedInvitation, CreatedInvitation, InvitationPreview, Member, MyInvitation, RoleSummary, WorkspaceInvitation } from "@/types/members"

const ws = (slug: string) => `/workspaces/${slug}`

export async function fetchMembers(slug: string): Promise<Member[]> {
  const { data } = await apiClient.get<Envelope<Member[]>>(`${ws(slug)}/members`)
  return data.data
}

export async function changeMemberRole(slug: string, memberId: string, roleId: string): Promise<void> {
  await apiClient.patch(`${ws(slug)}/members/${memberId}`, { roleId })
}

export async function removeMember(slug: string, memberId: string): Promise<void> {
  await apiClient.delete(`${ws(slug)}/members/${memberId}`)
}

export async function fetchRoles(slug: string): Promise<RoleSummary[]> {
  const { data } = await apiClient.get<Envelope<RoleSummary[]>>(`${ws(slug)}/roles`)
  return data.data
}

export async function createRole(slug: string, payload: RoleInput): Promise<RoleSummary> {
  const { data } = await apiClient.post<Envelope<RoleSummary>>(`${ws(slug)}/roles`, payload)
  return data.data
}

export async function updateRole(slug: string, roleId: string, payload: RoleInput): Promise<RoleSummary> {
  const { data } = await apiClient.put<Envelope<RoleSummary>>(`${ws(slug)}/roles/${roleId}`, payload)
  return data.data
}

export async function deleteRole(slug: string, roleId: string): Promise<void> {
  await apiClient.delete(`${ws(slug)}/roles/${roleId}`)
}

export async function fetchWorkspaceInvitations(slug: string): Promise<WorkspaceInvitation[]> {
  const { data } = await apiClient.get<Envelope<WorkspaceInvitation[]>>(`${ws(slug)}/invitations`)
  return data.data
}

export async function inviteMember(slug: string, payload: InviteInput): Promise<CreatedInvitation> {
  const { data } = await apiClient.post<Envelope<CreatedInvitation>>(`${ws(slug)}/invitations`, payload)
  return data.data
}

export async function revokeInvitation(slug: string, invitationId: string): Promise<void> {
  await apiClient.delete(`${ws(slug)}/invitations/${invitationId}`)
}

export async function fetchMyInvitations(): Promise<MyInvitation[]> {
  const { data } = await apiClient.get<Envelope<MyInvitation[]>>("/invitations")
  return data.data
}

export async function acceptInvitation(id: string): Promise<AcceptedInvitation> {
  const { data } = await apiClient.post<Envelope<AcceptedInvitation>>(`/invitations/${id}/accept`)
  return data.data
}

export async function declineInvitation(id: string): Promise<void> {
  await apiClient.post(`/invitations/${id}/decline`)
}

export async function fetchInvitationLink(slug: string, invitationId: string): Promise<{ inviteUrl: string }> {
  const { data } = await apiClient.get<Envelope<{ inviteUrl: string }>>(`${ws(slug)}/invitations/${invitationId}/link`)
  return data.data
}

export async function fetchInvitationPreview(token: string): Promise<InvitationPreview> {
  const { data } = await apiClient.get<Envelope<InvitationPreview>>(`/invitations/preview/${token}`)
  return data.data
}

export async function acceptInvitationByToken(token: string): Promise<AcceptedInvitation> {
  const { data } = await apiClient.post<Envelope<AcceptedInvitation>>(`/invitations/token/${token}`)
  return data.data
}
