import type { EVerificationStatus } from "@/enums/verification"

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
  role: { id: string; name: string; systemKey: string | null }
  permissions: string[]
  verificationStatus: EVerificationStatus
  /** Verified AND allowed to publish by role */
  canPublish: boolean
}

export interface Session {
  user: User
  workspaces: Workspace[]
}
