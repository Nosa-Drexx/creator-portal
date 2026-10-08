import { EErrorCode } from "@/enums/errors"

export class AppError extends Error {
  constructor(
    public readonly code: EErrorCode,
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const Errors = {
  notFound: (what = "Resource") => new AppError(EErrorCode.NotFound, 404, `${what} not found`),
  forbidden: (message = "You don't have permission to do that") =>
    new AppError(EErrorCode.Forbidden, 403, message),
  badRequest: (message: string) => new AppError(EErrorCode.BadRequest, 400, message),
  conflict: (message: string) => new AppError(EErrorCode.Conflict, 409, message),
  verificationRequired: () =>
    new AppError(
      EErrorCode.VerificationRequired,
      403,
      "Verify your identity before publishing. Your work can be saved as a draft in the meantime.",
    ),
}
