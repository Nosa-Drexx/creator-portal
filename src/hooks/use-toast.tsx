"use client"

import { useCallback } from "react"
import { type ExternalToast, toast } from "sonner"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Alert02Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

type ToastVariant = "success" | "error" | "warning" | "info"

const VARIANTS: Record<ToastVariant, { iconClass: string; icon: IconSvgElement }> = {
  success: { iconClass: "text-success", icon: CheckmarkCircle02Icon },
  error: { iconClass: "text-danger", icon: CancelCircleIcon },
  warning: { iconClass: "text-warning", icon: Alert02Icon },
  info: { iconClass: "text-info", icon: InformationCircleIcon },
}

export const customToast = (variant: ToastVariant, message = "", options?: ExternalToast) => {
  const { iconClass, icon } = VARIANTS[variant]
  return toast[variant](message, {
    icon: <HugeiconsIcon icon={icon} size={20} className={`shrink-0 ${iconClass}`} />,
    ...options,
  })
}

export default function useCustomToast() {
  return useCallback(
    (variant: ToastVariant, message = "", options?: ExternalToast) => customToast(variant, message, options),
    [],
  )
}
