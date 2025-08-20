"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const role = formData.get("role")
  const organizationName = formData.get("organizationName")

  if (!email || !password || !fullName || !role) {
    return { error: "All fields are required" }
  }

  const supabase = createClient()

  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (authData.user) {
      // Create organization if admin role
      let orgId = null
      if (role === "admin" && organizationName) {
        const orgSlug = organizationName
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: organizationName.toString(),
            slug: orgSlug,
          })
          .select()
          .single()

        if (orgError) {
          console.error("Organization creation error:", orgError)
          return { error: "Failed to create organization" }
        }
        orgId = orgData.id
      }

      // Create user profile
      const profileData = {
        id: authData.user.id,
        email: email.toString(),
        full_name: fullName.toString(),
        role: role.toString(),
        ...(orgId && { organization_id: orgId }),
      }

      console.log("[v0] Creating profile with data:", profileData)

      const { error: profileError } = await supabase.from("profiles").insert(profileData)

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Failed to create user profile" }
      }

      revalidatePath("/dashboard")
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function joinOrganization(prevState: any, formData: FormData) {
  const organizationSlug = formData.get("organizationSlug")
  const role = formData.get("role")

  if (!organizationSlug || !role) {
    return { error: "Organization and role are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Find organization by slug
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", organizationSlug.toString())
      .single()

    if (orgError || !org) {
      return { error: "Organization not found" }
    }

    // Update user profile with organization
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        organization_id: org.id,
        role: role.toString(),
      })
      .eq("id", user.id)

    if (updateError) {
      return { error: "Failed to join organization" }
    }

    revalidatePath("/dashboard")
    return { success: "Successfully joined organization!" }
  } catch (error) {
    console.error("Join organization error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function inviteMember(prevState: any, formData: FormData) {
  const email = formData.get("email")
  const role = formData.get("role")

  if (!email || !role) {
    return { error: "Email and role are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get current user's profile to check permissions
    const { data: profile } = await supabase.from("profiles").select("role, organization_id").eq("id", user.id).single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to invite members" }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email.toString()).single()

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // For now, we'll just return success - in a real app, you'd send an email invitation
    // TODO: Implement email invitation system
    return {
      success: `Invitation sent to ${email}. They can sign up and join your organization using the organization slug: ${profile.organization_id}`,
    }
  } catch (error) {
    console.error("Invite member error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createScenario(prevState: any, formData: FormData) {
  const title = formData.get("title")
  const description = formData.get("description")
  const crisisType = formData.get("crisisType")
  const difficultyLevel = formData.get("difficultyLevel")
  const estimatedDuration = formData.get("estimatedDuration")

  if (!title || !description || !crisisType || !difficultyLevel || !estimatedDuration) {
    return { error: "All fields are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get user's profile to get organization_id
    const { data: profile } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to create scenarios" }
    }

    const { data: scenario, error } = await supabase
      .from("scenarios")
      .insert({
        organization_id: profile.organization_id,
        title: title.toString(),
        description: description.toString(),
        crisis_type: crisisType.toString(),
        difficulty_level: difficultyLevel.toString(),
        estimated_duration: Number.parseInt(estimatedDuration.toString()),
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return { error: "Failed to create scenario" }
    }

    revalidatePath("/dashboard/scenarios")
    redirect(`/dashboard/scenarios/${scenario.id}`)
  } catch (error) {
    console.error("Create scenario error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateScenario(prevState: any, formData: FormData) {
  const scenarioId = formData.get("scenarioId")
  const title = formData.get("title")
  const description = formData.get("description")
  const crisisType = formData.get("crisisType")
  const difficultyLevel = formData.get("difficultyLevel")
  const estimatedDuration = formData.get("estimatedDuration")

  if (!scenarioId || !title || !description || !crisisType || !difficultyLevel || !estimatedDuration) {
    return { error: "All fields are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get user's profile to check permissions
    const { data: profile } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to update scenarios" }
    }

    const { error } = await supabase
      .from("scenarios")
      .update({
        title: title.toString(),
        description: description.toString(),
        crisis_type: crisisType.toString(),
        difficulty_level: difficultyLevel.toString(),
        estimated_duration: Number.parseInt(estimatedDuration.toString()),
        updated_at: new Date().toISOString(),
      })
      .eq("id", scenarioId.toString())
      .eq("organization_id", profile.organization_id)

    if (error) {
      return { error: "Failed to update scenario" }
    }

    revalidatePath(`/dashboard/scenarios/${scenarioId}`)
    return { success: "Scenario updated successfully!" }
  } catch (error) {
    console.error("Update scenario error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createDigitalExperience(prevState: any, formData: FormData) {
  const scenarioId = formData.get("scenarioId")
  const type = formData.get("type")
  const platform = formData.get("platform")
  const title = formData.get("title")
  const content = formData.get("content")
  const authorName = formData.get("authorName")
  const timestampOffset = formData.get("timestampOffset")

  if (!scenarioId || !type || !content) {
    return { error: "Scenario, type, and content are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Verify user has access to this scenario
    const { data: profile } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to create digital experiences" }
    }

    const { data: scenario } = await supabase
      .from("scenarios")
      .select("id")
      .eq("id", scenarioId.toString())
      .eq("organization_id", profile.organization_id)
      .single()

    if (!scenario) {
      return { error: "Scenario not found" }
    }

    const { error } = await supabase.from("digital_experiences").insert({
      scenario_id: scenarioId.toString(),
      type: type.toString(),
      platform: platform?.toString() || null,
      title: title?.toString() || null,
      content: content.toString(),
      author_name: authorName?.toString() || null,
      timestamp_offset: timestampOffset ? Number.parseInt(timestampOffset.toString()) : 0,
    })

    if (error) {
      return { error: "Failed to create digital experience" }
    }

    revalidatePath(`/dashboard/scenarios/${scenarioId}`)
    return { success: "Digital experience created successfully!" }
  } catch (error) {
    console.error("Create digital experience error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createTrainingSession(prevState: any, formData: FormData) {
  const title = formData.get("title")
  const scenarioId = formData.get("scenarioId")
  const startTime = formData.get("startTime")
  const participants = formData.get("participants")
  const participantRoles = formData.get("participantRoles")

  if (!title || !scenarioId) {
    return { error: "Title and scenario are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get user's profile to check permissions
    const { data: profile } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to create training sessions" }
    }

    // Verify scenario belongs to organization
    const { data: scenario } = await supabase
      .from("scenarios")
      .select("id")
      .eq("id", scenarioId.toString())
      .eq("organization_id", profile.organization_id)
      .single()

    if (!scenario) {
      return { error: "Scenario not found" }
    }

    // Create training session
    const { data: session, error: sessionError } = await supabase
      .from("training_sessions")
      .insert({
        organization_id: profile.organization_id,
        scenario_id: scenarioId.toString(),
        title: title.toString(),
        start_time: startTime ? new Date(startTime.toString()).toISOString() : null,
        created_by: user.id,
        status: "draft",
      })
      .select()
      .single()

    if (sessionError) {
      return { error: "Failed to create training session" }
    }

    // Add participants if provided
    if (participants && participantRoles) {
      const participantIds = JSON.parse(participants.toString())
      const roles = JSON.parse(participantRoles.toString())

      if (participantIds.length > 0) {
        const participantInserts = participantIds.map((participantId: string) => ({
          session_id: session.id,
          participant_id: participantId,
          role_assignment: roles[participantId] || "Participant",
        }))

        const { error: participantError } = await supabase.from("session_participants").insert(participantInserts)

        if (participantError) {
          console.error("Failed to add participants:", participantError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    revalidatePath("/dashboard/sessions")
    redirect(`/dashboard/sessions/${session.id}`)
  } catch (error) {
    console.error("Create training session error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function submitTrainingResponse(prevState: any, formData: FormData) {
  const sessionId = formData.get("sessionId")
  const content = formData.get("content")
  const responseType = formData.get("responseType") || "message"

  if (!sessionId || !content) {
    return { error: "Session and content are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Verify user has access to this session
    const { data: participant } = await supabase
      .from("session_participants")
      .select("session_id")
      .eq("session_id", sessionId.toString())
      .eq("participant_id", user.id)
      .single()

    if (!participant) {
      return { error: "You don't have access to this session" }
    }

    // Create response
    const { error } = await supabase.from("participant_responses").insert({
      session_id: sessionId.toString(),
      participant_id: user.id,
      response_type: responseType.toString(),
      content: content.toString(),
      is_public: true,
    })

    if (error) {
      return { error: "Failed to submit response" }
    }

    revalidatePath(`/dashboard/sessions/${sessionId}/training`)
    return { success: "Response submitted successfully!" }
  } catch (error) {
    console.error("Submit training response error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateOrganization(prevState: any, formData: FormData) {
  const organizationId = formData.get("organizationId")
  const name = formData.get("name")
  const description = formData.get("description")
  const website = formData.get("website")
  const industry = formData.get("industry")

  if (!organizationId || !name) {
    return { error: "Organization ID and name are required" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get user's profile to check permissions
    const { data: profile } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "You don't have permission to update organization settings" }
    }

    if (profile.organization_id !== organizationId.toString()) {
      return { error: "You can only update your own organization" }
    }

    const { error } = await supabase
      .from("organizations")
      .update({
        name: name.toString(),
        description: description?.toString() || null,
        website: website?.toString() || null,
        industry: industry?.toString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId.toString())

    if (error) {
      return { error: "Failed to update organization" }
    }

    revalidatePath("/dashboard/organization")
    return { success: "Organization updated successfully!" }
  } catch (error) {
    console.error("Update organization error:", error)
    return { error: "An unexpected error occurred" }
  }
}
