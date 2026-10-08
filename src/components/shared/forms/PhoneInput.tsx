"use client"

import { forwardRef, useCallback, useState } from "react"
import * as RPNInput from "react-phone-number-input"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CountryFlag } from "./CountryFlag"
import { CountryOptionsList } from "./CountryOptionsList"
import { fieldBase } from "./field-styles"

type PhoneInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "ref" | "defaultValue"> & {
  value?: string
  /** E.164 string, or "" when cleared */
  onChange?: (value: string) => void
  defaultCountry?: RPNInput.Country
  onCountryChange?: (country: RPNInput.Country | undefined) => void
  inputClassName?: string
  countryTriggerClassName?: string
}

const NumberInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function NumberInput(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(fieldBase, "min-w-0 flex-1 rounded-s-none tabular", className)}
      inputMode="tel"
      {...props}
    />
  )
})

interface CountrySelectProps {
  value?: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
  disabled?: boolean
  triggerClassName?: string
}

function CountryButton({ value, onChange, disabled, triggerClassName }: CountrySelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Choose country calling code"
          className={cn(
            fieldBase,
            "z-10 flex w-auto shrink-0 items-center gap-1.5 rounded-e-none border-e-0 px-3 focus-visible:z-20",
            triggerClassName,
          )}
        >
          <CountryFlag country={value} />
          <span className="text-[13px] text-text-secondary tabular">
            {value ? `+${RPNInput.getCountryCallingCode(value)}` : "+"}
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-text-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0">
        <CountryOptionsList
          value={value}
          showCallingCode
          onSelect={(option) => {
            onChange(option.code)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** International phone field: flag + calling-code picker joined to a formatted number input */
export const PhoneInput = forwardRef<React.ComponentRef<typeof RPNInput.default>, PhoneInputProps>(
  function PhoneInput(
    { className, inputClassName, countryTriggerClassName, value, onChange, defaultCountry = "US", ...props },
    ref,
  ) {
    const inputComponent = useCallback(
      (inputProps: React.ComponentProps<"input">) => <NumberInput {...inputProps} className={inputClassName} />,
      [inputClassName],
    )
    const countrySelectComponent = useCallback(
      (selectProps: CountrySelectProps) => <CountryButton {...selectProps} triggerClassName={countryTriggerClassName} />,
      [countryTriggerClassName],
    )

    return (
      <RPNInput.default
        ref={ref}
        smartCaret={false}
        className={cn("flex w-full", className)}
        defaultCountry={defaultCountry}
        countrySelectComponent={countrySelectComponent}
        inputComponent={inputComponent}
        value={value || undefined}
        onChange={(next) => onChange?.(next ?? "")}
        {...props}
      />
    )
  },
)
