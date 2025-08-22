import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Get current user (server-side)
export async function getServerUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}

// Get current session (server-side)
export async function getServerSession() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }
    
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

// Require authentication (server-side)
export async function requireAuth() {
  const user = await getServerUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  return user
}

// Get user profile (server-side)
export async function getServerUserProfile() {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("user_id", user.id)
    .single()

  if (error || !profile) {
    redirect("/auth/login")
  }

  return profile
}

// Require specific role (server-side)
export async function requireRole(allowedRoles: string[]) {
  const profile = await getServerUserProfile()

  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard")
  }

  return profile
} 