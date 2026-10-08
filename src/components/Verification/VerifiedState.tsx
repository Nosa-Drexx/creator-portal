"use client"

import type { Country } from "react-phone-number-input"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CountryFlag } from "@/components/shared/forms/CountryFlag"
import { countryName, formatDate } from "@/lib/format"
import type { Verification } from "@/types/verification"
import { DOCUMENT_LABEL } from "./constant"

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="text-sm font-semibold text-text-primary">{children}</dd>
    </div>
  )
}

export function VerifiedState({ verification }: { verification: Verification }) {
  return (
    <section className="flex animate-rise flex-col gap-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-success-surface text-success">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={24} />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary">Identity verified</h2>
            <StatusBadge tone="success" label="Verified" />
          </div>
          <p className="text-sm text-text-secondary">
            This workspace can publish content and receive payouts. No further action is needed.
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-5 border-t border-stroke pt-5 sm:grid-cols-4">
        <Detail label="Verified name">{verification.fullName ?? "—"}</Detail>
        <Detail label="Country">
          {verification.country ? (
            <span className="inline-flex items-center gap-2">
              <CountryFlag country={verification.country as Country} />
              {countryName(verification.country)}
            </span>
          ) : (
            "—"
          )}
        </Detail>
        <Detail label="Document">{verification.documentType ? DOCUMENT_LABEL[verification.documentType] : "—"}</Detail>
        <Detail label="Verified on">{verification.reviewedAt ? formatDate(verification.reviewedAt) : "—"}</Detail>
      </dl>
    </section>
  )
}
