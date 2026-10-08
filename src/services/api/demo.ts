import { apiClient, type Envelope } from "@/lib/axios"
import type { EDemoFault } from "@/constants/demo"
import type { EVerificationStatus } from "@/enums/verification"

export async function fetchDemoState(): Promise<{ fault: EDemoFault }> {
  const { data } = await apiClient.get<Envelope<{ fault: EDemoFault }>>("/demo")
  return data.data
}

export async function resetDemo(): Promise<void> {
  await apiClient.post("/demo", { action: "reset" })
}

export async function setDemoFault(value: EDemoFault): Promise<void> {
  await apiClient.post("/demo", { action: "fault", value })
}

export async function setDemoVerification(workspace: string, status: EVerificationStatus): Promise<void> {
  await apiClient.post("/demo", { action: "verification", workspace, status })
}
