"use client"

import { useFormContext } from "react-hook-form"
import type { Country } from "react-phone-number-input"
import { formatPhoneNumberIntl } from "react-phone-number-input"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { Checkbox } from "@/components/ui/checkbox"
import { S3Image } from "@/components/shared/S3Image"
import { CountryFlag } from "@/components/shared/forms/CountryFlag"
import { countryName, formatDate } from "@/lib/format"
import type { VerificationFormValues } from "@/lib/validation/verification"
import { DOCUMENT_LABEL } from "../constant"
import { StepHeading } from "./StepHeading"

interface ReviewStepProps {
  onEdit: (step: number) => void
  confirmed: boolean
  onConfirmedChange: (value: boolean) => void
  showConfirmError: boolean
}

function Section({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-stroke bg-surface p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-text-secondary">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={13} /> Edit
        </button>
      </header>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="min-w-0 font-medium break-words text-text-primary">{children}</dd>
    </div>
  )
}

export function ReviewStep({ onEdit, confirmed, onConfirmedChange, showConfirmError }: ReviewStepProps) {
  const values = useFormContext<VerificationFormValues>().getValues()
  const isPdf = values.documentKey?.toLowerCase().endsWith(".pdf")

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Review and submit" description="Check everything is correct before sending it for review." />

      <Section title="Personal information" step={0} onEdit={onEdit}>
        <dl className="flex flex-col gap-2.5">
          <Row label="Full name">{values.fullName}</Row>
          <Row label="Date of birth">{values.dateOfBirth ? formatDate(values.dateOfBirth) : "—"}</Row>
          <Row label="Country">
            <span className="inline-flex items-center gap-2">
              <CountryFlag country={values.country as Country} />
              {values.country ? countryName(values.country) : "—"}
            </span>
          </Row>
          <Row label="Phone">{values.phone ? formatPhoneNumberIntl(values.phone) || values.phone : "—"}</Row>
          <Row label="Address">{values.address}</Row>
        </dl>
      </Section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="Identity document" step={1} onEdit={onEdit}>
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {isPdf ? (
                <div className="grid size-full place-items-center text-text-secondary">
                  <HugeiconsIcon icon={File01Icon} size={20} />
                </div>
              ) : (
                <S3Image src={values.documentKey} alt="Document" containerClassName="absolute inset-0" sizes="80px" />
              )}
            </div>
            <span className="text-sm font-semibold">{values.documentType ? DOCUMENT_LABEL[values.documentType] : "—"}</span>
          </div>
        </Section>
        <Section title="Selfie" step={2} onEdit={onEdit}>
          <div className="flex items-center gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
              <S3Image src={values.selfieKey} alt="Selfie" containerClassName="absolute inset-0" sizes="56px" />
            </div>
            <span className="text-sm font-semibold">Selfie captured</span>
          </div>
        </Section>
      </div>

      <label
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
          showConfirmError && !confirmed ? "animate-shake border-danger/60 bg-danger-surface" : "border-stroke bg-surface"
        }`}
      >
        <Checkbox checked={confirmed} onCheckedChange={(v) => onConfirmedChange(v === true)} className="mt-0.5" />
        <span className="text-sm text-text-secondary">
          I confirm these details are accurate and belong to me, and I agree to CreatorHub verifying my identity.
        </span>
      </label>
    </div>
  )
}
