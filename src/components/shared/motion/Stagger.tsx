"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"
import { EASE_OUT_SOFT } from "./easing"

const group: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.05 } },
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT_SOFT } },
}

export function StaggerGroup({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={group} initial="hidden" animate="shown" {...props}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItemVariants} {...props}>
      {children}
    </motion.div>
  )
}
