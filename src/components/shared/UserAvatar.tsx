import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { S3Image } from "./S3Image"

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <S3Image
        src={avatarUrl}
        alt={name}
        sizes="64px"
        containerClassName={cn("size-8 shrink-0 rounded-full", className)}
        fallback={<Initials name={name} className={className} />}
      />
    )
  }
  return <Initials name={name} className={className} />
}

function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-ink-0 dark:bg-ink-100 dark:text-ink-900",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
