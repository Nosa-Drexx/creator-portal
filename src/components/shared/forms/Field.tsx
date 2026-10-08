import { cn } from "@/lib/utils"

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  error?: string
  optional?: boolean
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Field({ label, htmlFor, hint, error, optional, aside, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-text-primary">
          {label}
          {optional && <span className="ml-1 font-normal text-text-tertiary">(optional)</span>}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p role="alert" className="animate-rise text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-text-tertiary">{hint}</p>
      )}
    </div>
  )
}
