import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group -ml-1 inline-flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
      {label}
    </Link>
  )
}
