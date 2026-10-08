type ContentStatus = "draft" | "scheduled" | "published"

export interface ContentFixture {
  title: string
  description: string
  priceCents: number
  thumb: number
  status: ContentStatus
  /** Days ago (published) or days ahead (scheduled) */
  dayOffset: number
  durationSeconds: number
  /** Relative popularity, drives views and purchases */
  weight: number
}

export { DEMO_PASSWORD } from "@/constants/demo"

export const DEMO_USER = {
  id: "usr_demo_amara",
  name: "Amara Lewis",
  email: "amara@creatorhub.dev",
}

export const OTHER_USER = {
  id: "usr_demo_theo",
  name: "Theo Marsh",
  email: "theo@creatorhub.dev",
}

/** Members of Amara Studio, one per built-in role, so reviewers can see permissions in action */
export const TEAM_USERS = [
  { id: "usr_demo_jordan", name: "Jordan Blake", email: "jordan@creatorhub.dev", role: "admin" },
  { id: "usr_demo_priya", name: "Priya Shah", email: "priya@creatorhub.dev", role: "editor" },
  { id: "usr_demo_sam", name: "Sam Okafor", email: "sam@creatorhub.dev", role: "analyst" },
] as const

export const WORKSPACES = {
  studio: {
    id: "ws_amara_studio",
    slug: "amara-studio",
    name: "Amara Studio",
    handle: "@amaralewis",
    accentColor: "#e5562b",
  },
  travel: {
    id: "ws_wild_frames",
    slug: "wild-frames",
    name: "Wild Frames",
    handle: "@wildframes",
    accentColor: "#3355ff",
  },
  foreign: {
    id: "ws_northbound",
    slug: "northbound-films",
    name: "Northbound Films",
    handle: "@northbound",
    accentColor: "#1d8a52",
  },
} as const

export const STUDIO_CONTENT: ContentFixture[] = [
  { title: "Golden Hour Landscapes: The Complete Field Guide", description: "Plan, scout and shoot landscapes in the best light of the day. Includes my full location-scouting workflow.", priceCents: 4900, thumb: 1, status: "published", dayOffset: 340, durationSeconds: 5520, weight: 10 },
  { title: "Colour Grading in Lightroom, Start to Finish", description: "Build a repeatable grading workflow and create presets that hold up across a whole series.", priceCents: 2900, thumb: 2, status: "published", dayOffset: 290, durationSeconds: 3840, weight: 7 },
  { title: "Shooting Waterfalls Without a Tripod", description: "Handheld long-exposure tricks, ND filters and stabilisation for travel shooters.", priceCents: 1200, thumb: 3, status: "published", dayOffset: 250, durationSeconds: 1260, weight: 4 },
  { title: "Composition Fundamentals for Mobile Photographers", description: "Leading lines, layering and negative space using only your phone.", priceCents: 900, thumb: 4, status: "published", dayOffset: 210, durationSeconds: 1680, weight: 9 },
  { title: "Mountain Timelapse Masterclass", description: "Holy-grail day-to-night timelapses, intervals, deflicker and final edit.", priceCents: 3900, thumb: 5, status: "published", dayOffset: 160, durationSeconds: 4380, weight: 5 },
  { title: "Editing a Travel Film in 60 Minutes", description: "A real-time edit of a 3-minute travel film: pacing, sound design and export settings.", priceCents: 1900, thumb: 6, status: "published", dayOffset: 120, durationSeconds: 3600, weight: 6 },
  { title: "Fog, Mist and Moody Forests", description: "Reading weather forecasts for fog and shooting atmospheric woodland scenes.", priceCents: 1500, thumb: 7, status: "published", dayOffset: 75, durationSeconds: 2220, weight: 3 },
  { title: "Drone Basics: Your First Cinematic Shots", description: "Safe flying, camera settings and five shot types that always look cinematic.", priceCents: 2400, thumb: 8, status: "published", dayOffset: 40, durationSeconds: 2700, weight: 4 },
  { title: "Behind the Shot: Iceland Black Sand Beach", description: "A short breakdown of a single image, from planning to the final print.", priceCents: 499, thumb: 9, status: "published", dayOffset: 12, durationSeconds: 540, weight: 2 },
  { title: "Night Sky & Milky Way Planning", description: "Moon phases, light pollution maps and the settings I use for sharp stars.", priceCents: 2900, thumb: 10, status: "scheduled", dayOffset: 5, durationSeconds: 3120, weight: 0 },
  { title: "Printing Your Work: Paper, Profiles and Pricing", description: "Turn your best images into prints people want to buy.", priceCents: 1900, thumb: 11, status: "scheduled", dayOffset: 14, durationSeconds: 2460, weight: 0 },
  { title: "Gear I Actually Use in 2026", description: "An honest walkthrough of the kit in my bag, and what I would skip.", priceCents: 0, thumb: 12, status: "draft", dayOffset: 0, durationSeconds: 960, weight: 0 },
  { title: "Long Exposure Seascapes (Rough Cut)", description: "", priceCents: 1400, thumb: 13, status: "draft", dayOffset: 0, durationSeconds: 1800, weight: 0 },
  { title: "Portfolio Review Livestream Replay", description: "Reviewing viewer submissions live, with practical feedback on each one.", priceCents: 999, thumb: 14, status: "draft", dayOffset: 0, durationSeconds: 4200, weight: 0 },
]

export const TRAVEL_CONTENT: ContentFixture[] = [
  { title: "Two Weeks in the Dolomites: Full Vlog", description: "Hut-to-hut hiking with a camera bag.", priceCents: 1200, thumb: 15, status: "draft", dayOffset: 0, durationSeconds: 2940, weight: 0 },
  { title: "Packing a Carry-on Camera Kit", description: "Everything I fly with and how it fits.", priceCents: 600, thumb: 16, status: "draft", dayOffset: 0, durationSeconds: 780, weight: 0 },
  { title: "Patagonia Road Trip Diary", description: "", priceCents: 1500, thumb: 17, status: "draft", dayOffset: 0, durationSeconds: 3300, weight: 0 },
]

export const FOREIGN_CONTENT: ContentFixture[] = [
  { title: "Documentary Interview Lighting", description: "Three-point lighting on a budget.", priceCents: 3500, thumb: 18, status: "published", dayOffset: 90, durationSeconds: 2400, weight: 5 },
]

export const BUYER_FIRST_NAMES = ["Liam", "Zara", "Kofi", "Mia", "Arjun", "Sofia", "Chen", "Ada", "Lucas", "Emeka", "Hana", "Noah", "Ines", "Tariq", "Freya", "Mateo", "Yuki", "Grace", "Omar", "Elena"]
export const BUYER_LAST_NAMES = ["Smith", "Okoro", "Patel", "García", "Müller", "Kim", "Mensah", "Rossi", "Silva", "Dubois", "Khan", "Novak", "Adeyemi", "Larsen", "Costa", "Nakamura"]

/** ISO country codes weighted by share of buyers */
export const COUNTRY_WEIGHTS: [string, number][] = [
  ["US", 30], ["GB", 14], ["NG", 9], ["CA", 8], ["DE", 7], ["IN", 6], ["AU", 5],
  ["BR", 4], ["FR", 4], ["NL", 3], ["KE", 3], ["ZA", 3], ["JP", 2], ["ES", 2],
]

/** Pending is assigned separately, only to purchases from the last few days */
export const PURCHASE_STATUS_WEIGHTS: ["completed" | "refunded" | "failed", number][] = [
  ["completed", 89],
  ["refunded", 7],
  ["failed", 4],
]
