"use client"

import NumberFlow, { type Format } from "@number-flow/react"

interface AnimatedNumberProps {
  value: number
  format?: Format
  className?: string
  prefix?: string
  suffix?: string
}

/** Digits roll between values, e.g. when switching range or workspace */
export function AnimatedNumber({ value, format, className, prefix, suffix }: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      locales="en-US"
      format={format}
      prefix={prefix}
      suffix={suffix}
      className={className}
      willChange
      respectMotionPreference
    />
  )
}
