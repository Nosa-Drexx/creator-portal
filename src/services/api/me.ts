import { apiClient, type Envelope } from "@/lib/axios"
import type { PasswordChangeInput, ProfileInput } from "@/lib/validation/profile"
import type { User } from "@/types/workspace"

export async function updateProfile(payload: ProfileInput): Promise<User> {
  const { data } = await apiClient.patch<Envelope<User>>("/me", payload)
  return data.data
}

export async function changePassword(payload: PasswordChangeInput): Promise<void> {
  await apiClient.post("/me/password", payload)
}

export async function uploadAvatar(image: Blob): Promise<User> {
  const { data } = await apiClient.put<Envelope<User>>("/me/avatar", image, {
    headers: { "Content-Type": image.type },
  })
  return data.data
}

export async function removeAvatar(): Promise<User> {
  const { data } = await apiClient.delete<Envelope<User>>("/me/avatar")
  return data.data
}
