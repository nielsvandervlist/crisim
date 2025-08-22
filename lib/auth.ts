import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()
  
  if (!supabase) {
    return null
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function getUserProfile() {
  const supabase = await createClient()
  
  if (!supabase) {
    return null
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq("user_id", user.id)
      .single()

    if (error || !profile) {
      return null
    }

    return profile
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getUserProfile()

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error("Insufficient permissions")
  }

  return profile
}
