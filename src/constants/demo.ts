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
  { email: "amara@creatorhub.dev", name: "Amara Lewis", description: "Owns Amara Studio and Wild Frames" },
  { email: "theo@creatorhub.dev", name: "Theo Marsh", description: "Owns Northbound Films" },
]
