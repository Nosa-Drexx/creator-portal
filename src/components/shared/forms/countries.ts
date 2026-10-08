import { getCountries, getCountryCallingCode, type Country } from "react-phone-number-input"

export interface CountryOption {
  code: Country
  name: string
  callingCode: string
}

let cache: CountryOption[] | null = null

/** Every ISO country the phone library knows, with localized names, sorted A–Z */
export function getCountryOptions(): CountryOption[] {
  if (cache) return cache
  const names = new Intl.DisplayNames(["en"], { type: "region" })
  cache = getCountries()
    .map((code) => ({ code, name: names.of(code) ?? code, callingCode: `+${getCountryCallingCode(code)}` }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return cache
}

export function filterCountries(options: CountryOption[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter(
    (o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase() === q || o.callingCode.includes(q),
  )
}
