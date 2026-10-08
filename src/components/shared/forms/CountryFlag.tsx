import flags from "react-phone-number-input/flags"
import type { Country } from "react-phone-number-input"
import { cn } from "@/lib/utils"

export function CountryFlag({ country, className }: { country?: Country; className?: string }) {
  const Flag = country ? flags[country] : undefined
  return (
    <span
      className={cn(
        "flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] bg-muted ring-1 ring-black/5 [&_svg:not([class*='size-'])]:size-full",
        className,
      )}
    >
      {Flag && <Flag title={country ?? ""} />}
    </span>
  )
}
