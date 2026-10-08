import { Logo } from "@/components/shared/Logo"
import { BrandPanel } from "./BrandPanel"

interface AuthShellProps {
  title: string
  description: React.ReactNode
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh gap-6 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:p-4">
      <div className="flex flex-col px-3 py-6 sm:px-8 lg:px-12 lg:py-8">
        <Logo />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 animate-rise flex-col justify-center gap-7 py-10">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[28px] leading-tight font-bold">{title}</h1>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
          {children}
          <p className="text-center text-sm text-text-secondary">{footer}</p>
        </div>
      </div>
      <BrandPanel />
    </div>
  )
}
