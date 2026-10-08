import localFont from "next/font/local"
import { Geist_Mono } from "next/font/google"

// Satoshi (Fontshare, ITF Free Font License), variable 300–900
export const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [{ path: "./satoshi/Satoshi-Variable.woff2", weight: "300 900", style: "normal" }],
})

export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const fontVariables = [satoshi.variable, geistMono.variable].join(" ")
