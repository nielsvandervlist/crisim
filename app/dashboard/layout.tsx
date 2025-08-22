import type React from "react"
import { getServerUser } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Try to get existing profile
  let { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("user_id", user.id)
    .single()

  // If profile doesn't exist, create one
  if (error || !profile) {
    console.log("Profile not found, creating one for user:", user.id)
    
    // First, check if there are any organizations
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(1)

    if (orgError || !organizations || organizations.length === 0) {
      console.error("No organizations found:", orgError)
      redirect("/auth/login?error=No organizations configured")
    }

    const defaultOrg = organizations[0]
    console.log("Using organization:", defaultOrg.name)

    // Create profile for the user
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        organization_id: defaultOrg.id,
        role: "admin", // Default to admin for now
      })
      .select(`
        *,
        organization:organizations(*)
      `)
      .single()

    if (createError || !newProfile) {
      console.error("Failed to create profile:", createError)
      redirect("/auth/login?error=Failed to create user profile")
    }

    profile = newProfile
    console.log("Profile created successfully")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={profile} organizationName={profile.organization?.name} />
      <DashboardNav userRole={profile.role} organizationName={profile.organization?.name} />
      <main className="md:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
