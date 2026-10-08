import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform,opacity] duration-200 ease-out-soft outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 data-[loading=true]:pointer-events-none aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-primary/88",
        brand: "bg-brand text-brand-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-brand/90",
        outline:
          "border-stroke-strong bg-surface text-text-primary shadow-[0_1px_1px_rgb(0_0_0/0.03)] hover:bg-muted aria-expanded:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-ink-200 dark:hover:bg-ink-800",
        ghost: "text-text-secondary hover:bg-muted hover:text-text-primary aria-expanded:bg-muted",
        destructive: "bg-danger-surface text-danger hover:bg-danger/15",
        link: "text-text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px]",
        lg: "h-10 gap-2 px-4",
        xl: "h-12 gap-2 rounded-xl px-5 text-[15px]",
        icon: "size-9",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={isLoading}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && (
            <span className="absolute inset-0 grid place-items-center">
              <Spinner className="size-4" />
            </span>
          )}
          <span className={cn("inline-flex items-center gap-[inherit]", isLoading && "invisible")}>{children}</span>
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
