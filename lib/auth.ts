import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function getUserProfile() {
  const supabase = createClient()
  const user = await getCurrentUser()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    redirect("/auth/login")
  }

  return profile
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getUserProfile()

  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard")
  }

  return profile
}
