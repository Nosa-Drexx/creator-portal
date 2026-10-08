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
