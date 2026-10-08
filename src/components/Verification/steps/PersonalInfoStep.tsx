"use client"

import { useFormContext } from "react-hook-form"
import type { Country } from "react-phone-number-input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CountrySelect } from "@/components/shared/forms/CountrySelect"
import { fieldBase, fieldTextarea } from "@/components/shared/forms/field-styles"
import { PhoneInput } from "@/components/shared/forms/PhoneInput"
import type { VerificationFormValues } from "@/lib/validation/verification"
import { cn } from "@/lib/utils"
import { StepHeading } from "./StepHeading"

const LABEL = "text-[13px] font-semibold text-text-primary"
const MESSAGE = "text-xs font-medium text-danger"

function latestAllowedBirthDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

export function PersonalInfoStep() {
  const form = useFormContext<VerificationFormValues>()
  const country = form.watch("country") as Country | ""

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Tell us about yourself"
        description="Use your legal details exactly as they appear on your ID."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className={LABEL}>Full legal name</FormLabel>
              <FormControl>
                <input {...field} autoComplete="name" placeholder="e.g. Amara Lewis" className={fieldBase} />
              </FormControl>
              <FormMessage className={MESSAGE} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL}>Date of birth</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="date"
                  autoComplete="bday"
                  max={latestAllowedBirthDate()}
                  className={cn(fieldBase, "block appearance-none [&::-webkit-date-and-time-value]:text-left")}
                />
              </FormControl>
              <FormMessage className={MESSAGE} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL}>Country of residence</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={(code) => {
                    field.onChange(code)
                    form.trigger("country")
                  }}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage className={MESSAGE} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className={LABEL}>Phone number</FormLabel>
              <FormControl>
                <PhoneInput
                  key={country || "default"}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  defaultCountry={country || "US"}
                  autoComplete="tel"
                  placeholder="Phone number"
                />
              </FormControl>
              <FormMessage className={MESSAGE} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className={LABEL}>Residential address</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  autoComplete="street-address"
                  placeholder="Street, city, postcode"
                  className={cn(fieldBase, fieldTextarea, "h-auto resize-none")}
                />
              </FormControl>
              <FormMessage className={MESSAGE} />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export { LABEL as FIELD_LABEL, MESSAGE as FIELD_MESSAGE }
