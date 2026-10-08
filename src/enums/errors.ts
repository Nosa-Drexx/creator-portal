export enum EErrorCode {
  BadRequest = "BAD_REQUEST",
  ValidationFailed = "VALIDATION_FAILED",
  Unauthenticated = "UNAUTHENTICATED",
  Forbidden = "FORBIDDEN",
  NotFound = "NOT_FOUND",
  Conflict = "CONFLICT",
  VerificationRequired = "VERIFICATION_REQUIRED",
  PayloadTooLarge = "PAYLOAD_TOO_LARGE",
  RateLimited = "RATE_LIMITED",
  Internal = "INTERNAL",
  SimulatedFailure = "SIMULATED_FAILURE",
}
