import { apiClient, type Envelope } from "@/lib/axios"
import type { LoginInput, SignupInput } from "@/lib/validation/auth"
import type { User } from "@/types/workspace"

export async function logIn(payload: LoginInput): Promise<User> {
  const { data } = await apiClient.post<Envelope<User>>("/auth/login", payload)
  return data.data
}

export async function signUp(payload: SignupInput): Promise<User> {
  const { data } = await apiClient.post<Envelope<User>>("/auth/signup", payload)
  return data.data
}

export async function logOut(): Promise<void> {
  await apiClient.post("/auth/logout")
}
