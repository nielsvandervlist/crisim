import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()
  
  if (!supabase) {
    console.error("❌ Supabase client not available in getCurrentUser")
    return null
  }

  try {
    console.log("🔍 Getting user from Supabase auth...")
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("❌ Error getting user from auth:", error)
      return null
    }
    
    if (!user) {
      console.error("❌ No user found in auth context")
      return null
    }
    
    console.log("✅ User authenticated:", user.id, user.email)
    return user
  } catch (error) {
    console.error("❌ Error in getCurrentUser:", error)
    return null
  }
}

export async function getUserProfile() {
  const supabase = await createClient()
  
  if (!supabase) {
    console.error("❌ Supabase client not available in getUserProfile")
    return null
  }

  try {
    console.log("🔍 Getting current user...")
    const user = await getCurrentUser()
    if (!user) {
      console.error("❌ No current user found in getUserProfile")
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

    if (error) {
      console.error("❌ Error fetching profile:", error)
      return null
    }
    
    if (!profile) {
      console.error("❌ No profile found for user:", user.id)
      return null
    }

    return profile
  } catch (error) {
    console.error("❌ Error in getUserProfile:", error)
    return null
  }
}

export async function requireRole(allowedRoles: string[]) {
  try {
    console.log("🔐 requireRole called with allowed roles:", allowedRoles)
    
    const profile = await getUserProfile()

    if (!profile) {
      console.error("❌ No profile found in requireRole")
      throw new Error("User profile not found")
    }
    
    if (!profile.organization_id) {
      console.error("❌ Profile has no organization_id:", profile)
      throw new Error("User not associated with an organization")
    }
    
    if (!allowedRoles.includes(profile.role)) {
      console.error("❌ Insufficient permissions. User role:", profile.role, "Allowed roles:", allowedRoles)
      throw new Error("Insufficient permissions")
    }
    
    return profile
  } catch (error) {
    console.error("❌ Error in requireRole:", error)
    throw error
  }
}
