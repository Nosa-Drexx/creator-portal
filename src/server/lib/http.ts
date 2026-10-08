import "server-only"

import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { z, ZodError, type ZodType } from "zod"
import { EErrorCode } from "@/enums/errors"
import { DEMO_COOKIES, EDemoFault } from "@/constants/demo"
import { ensureDatabase } from "@/server/db/setup"
import { AppError } from "./errors"

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ success: true, data }, init)
}

function fail(error: AppError) {
  return Response.json(
    {
      success: false,
      error: { code: error.code, message: error.message, fieldErrors: error.fieldErrors },
    },
    { status: error.status },
  )
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error instanceof ZodError) {
    const { fieldErrors } = z.flattenError(error)
    return new AppError(
      EErrorCode.ValidationFailed,
      422,
      "Some fields need attention",
      fieldErrors as Record<string, string[]>,
    )
  }
  console.error("[api] unhandled error", error)
  return new AppError(EErrorCode.Internal, 500, "Something went wrong on our side. Please try again.")
}

/** Demo-state controls: lets reviewers force slow or failing API responses */
async function applyDemoFaults() {
  const fault = (await cookies()).get(DEMO_COOKIES.fault)?.value
  if (fault === EDemoFault.Slow) await new Promise((r) => setTimeout(r, 1800))
  if (fault === EDemoFault.Fail) {
    throw new AppError(EErrorCode.SimulatedFailure, 503, "The service is temporarily unavailable (simulated).")
  }
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>

export function handle<C>(handler: Handler<C>, options: { faults?: boolean } = {}): Handler<C> {
  return async (req, ctx) => {
    try {
      await ensureDatabase()
      if (options.faults !== false) await applyDemoFaults()
      return await handler(req, ctx)
    } catch (error) {
      return fail(toAppError(error))
    }
  }
}

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  const body = await req.json().catch(() => {
    throw new AppError(EErrorCode.BadRequest, 400, "Request body must be valid JSON")
  })
  return schema.parse(body)
}

export function parseQuery<T>(req: NextRequest, schema: ZodType<T>): T {
  const raw = Object.fromEntries(
    [...req.nextUrl.searchParams.entries()].filter(([, v]) => v !== ""),
  )
  return schema.parse(raw)
}
