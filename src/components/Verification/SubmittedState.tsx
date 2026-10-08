"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkBadge01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { routes } from "@/constants/routes"
import { EVerificationStatus } from "@/enums/verification"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { formatRelativeDay } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Verification } from "@/types/verification"
import { useCountdown } from "./use-countdown"

interface TimelineItemProps {
  title: string
  detail: string
  state: "done" | "active" | "todo"
  last?: boolean
}

function TimelineItem({ title, detail, state, last }: TimelineItemProps) {
  return (
    <li className={cn("relative flex gap-3", !last && "pb-5")}>
      {!last && <span className="absolute top-6 bottom-0 left-[11px] w-px bg-stroke" aria-hidden />}
      <span
        className={cn(
          "relative z-10 grid size-6 shrink-0 place-items-center rounded-full",
          state === "done" && "bg-success text-white",
          state === "active" && "bg-warning-surface text-warning ring-1 ring-warning-stroke",
          state === "todo" && "bg-muted text-text-tertiary",
        )}
      >
        {state === "done" ? (
          <HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={3} />
        ) : (
          <span className={cn("size-1.5 rounded-full bg-current", state === "active" && "animate-pulse")} />
        )}
      </span>
      <div className="flex flex-col">
        <span className={cn("text-sm font-semibold", state === "todo" ? "text-text-tertiary" : "text-text-primary")}>
          {title}
        </span>
        <span className="text-xs text-text-tertiary">{detail}</span>
      </div>
    </li>
  )
}

export function SubmittedState({ verification }: { verification: Verification }) {
  const slug = useWorkspaceSlug()
  const verified = verification.status === EVerificationStatus.Verified
  const remaining = useCountdown(verified ? null : verification.estimatedReviewAt)

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col items-center gap-6 rounded-3xl bg-surface px-5 py-9 text-center shadow-card sm:px-10">
      <div className="relative">
        <span
          aria-hidden
          className={cn(
            "absolute -inset-6 rounded-full blur-2xl transition-colors duration-700",
            verified ? "bg-brand/25" : "bg-success/20",
          )}
        />
        <span
          key={verified ? "verified" : "submitted"}
          className={cn(
            "relative grid size-16 animate-pop place-items-center rounded-full text-white shadow-float",
            verified ? "bg-brand" : "bg-success",
          )}
        >
          <HugeiconsIcon icon={verified ? CheckmarkBadge01Icon : Tick02Icon} size={30} strokeWidth={2.4} />
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <StatusBadge
          tone={verified ? "success" : "warning"}
          label={verified ? "Verified" : "In review"}
          pulse={!verified}
        />
        <h2 className="text-2xl font-bold text-text-primary">
          {verified ? "You're verified" : "Verification submitted"}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
          {verified
            ? "Publishing is unlocked. Your videos can now go live and start earning."
            : "Thanks! We're reviewing your details. Keep creating drafts in the meantime; publishing unlocks automatically once you're approved."}
        </p>
      </div>

      {!verified && (
        <ol className="w-full rounded-2xl border border-stroke p-4 text-left">
          <TimelineItem
            title="Details submitted"
            detail={verification.submittedAt ? formatRelativeDay(verification.submittedAt) : "Just now"}
            state="done"
          />
          <TimelineItem
            title="Identity review"
            detail={remaining ? `Usually done in under a minute · about ${remaining}s left` : "Finishing up…"}
            state="active"
          />
          <TimelineItem title="Publishing unlocked" detail="We'll update this page automatically" state="todo" last />
        </ol>
      )}

      {verified ? (
        <Button asChild size="xl" variant="brand" className="w-full sm:w-auto">
          <Link href={routes.content(slug)}>
            Publish your first video
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href={routes.content(slug)}>Continue working on drafts</Link>
        </Button>
      )}
    </div>
  )
}
