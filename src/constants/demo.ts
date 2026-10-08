export const DEMO_COOKIES = {
  session: "ch_session",
  fault: "ch_demo_fault",
} as const

export enum EDemoFault {
  None = "none",
  Slow = "slow",
  Fail = "fail",
}

export const DEFAULT_WORKSPACE_SLUG = "amara-studio"

/** Shared password for every seeded account (documented in the README) */
export const DEMO_PASSWORD = "creatorhub-demo1"

export const DEMO_ACCOUNTS = [
  { email: "amara@creatorhub.dev", name: "Amara Lewis", role: "Owner", description: "Owns Amara Studio and Wild Frames" },
  { email: "jordan@creatorhub.dev", name: "Jordan Blake", role: "Admin", description: "Manages Amara Studio's team and content" },
  { email: "priya@creatorhub.dev", name: "Priya Shah", role: "Editor", description: "Uploads and edits, can't publish or see sales" },
  { email: "sam@creatorhub.dev", name: "Sam Okafor", role: "Analyst", description: "Read-only stats and purchases" },
  { email: "theo@creatorhub.dev", name: "Theo Marsh", role: "Owner", description: "Owns Northbound Films, has a pending invite" },
]
