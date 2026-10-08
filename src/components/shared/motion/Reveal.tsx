"use client"

import { motion, type HTMLMotionProps } from "motion/react"
import { EASE_OUT_SOFT } from "./easing"

type RevealProps = HTMLMotionProps<"div"> & { delay?: number }

/** Gentle fade-up on mount; use for page sections */
export function Reveal({ delay = 0, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_SOFT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
