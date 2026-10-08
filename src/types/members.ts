import type { User } from "./workspace"

export interface RoleSummary {
  id: string
  name: string
  description: string
  systemKey: string | null
  permissions: string[]
  memberCount: number
}

export interface Member {
  id: string
  user: User
  role: { id: string; name: string; systemKey: string | null }
  joinedAt: string
  isYou: boolean
}

export interface WorkspaceInvitation {
  id: string
  email: string
  role: { id: string; name: string }
  invitedBy: string
  expiresAt: string
  createdAt: string
}

export interface MyInvitation {
  id: string
  workspace: { name: string; slug: string; accentColor: string }
  role: { name: string }
  invitedBy: string
  expiresAt: string
}

/** Public view of an invite link, for invitees who aren't signed in yet */
export interface InvitationPreview extends MyInvitation {
  email: string
  hasAccount: boolean
}

export interface AcceptedInvitation {
  slug: string
  permissions: string[]
}

export interface CreatedInvitation {
  invitation: WorkspaceInvitation
  /** Admins can copy it again later from the pending list */
  inviteUrl: string
}

export interface RolePayload {
  name: string
  description: string
  permissions: string[]
}
