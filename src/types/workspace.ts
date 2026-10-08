import type { EVerificationStatus } from "@/enums/verification"
import type { EWorkspaceRole } from "@/enums/workspace"

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface Workspace {
  id: string
  slug: string
  name: string
  handle: string
  accentColor: string
  avatarUrl: string | null
  role: EWorkspaceRole
  verificationStatus: EVerificationStatus
  canPublish: boolean
}

export interface Session {
  user: User
  workspaces: Workspace[]
}
