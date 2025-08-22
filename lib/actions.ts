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

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Simple login - no user creation logic
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

export async function signOut() {
  const supabase = await createClient()
  
  if (!supabase) {
    redirect("/auth/login")
  }
  
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const role = formData.get("role")
  const organizationName = formData.get("organizationName")

  if (!email || !password || !fullName || !role) {
    return { error: "All required fields must be provided" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Create the user account
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    if (!user) {
      return { error: "Failed to create user account" }
    }

    let organizationId = null

    // If user is admin and provided organization name, create organization
    if (role === "admin" && organizationName) {
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: organizationName.toString(),
          slug: organizationName.toString().toLowerCase().replace(/\s+/g, "-"),
          description: `Organization created by ${fullName}`,
        })
        .select()
        .single()

      if (orgError) {
        console.error("Organization creation error:", orgError)
        return { error: "Failed to create organization" }
      }

      organizationId = organization.id
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        email: email.toString(),
        full_name: fullName.toString(),
        role: role.toString(),
        organization_id: organizationId,
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: "Failed to create user profile" }
    }

    return { success: "Account created successfully! Please check your email to verify your account." }
  } catch (error) {
    console.error("Sign up error:", error)
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

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and their organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

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
      console.error("Create scenario error:", error)
      return { error: "Failed to create scenario" }
    }

    revalidatePath("/dashboard/scenarios")
    return { success: "Scenario created successfully!" }
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

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and their organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to update scenarios" }
    }

    // Verify scenario belongs to organization
    const { data: existingScenario } = await supabase
      .from("scenarios")
      .select("id")
      .eq("id", scenarioId.toString())
      .eq("organization_id", profile.organization_id)
      .single()

    if (!existingScenario) {
      return { error: "Scenario not found or you don't have permission to edit it" }
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

    revalidatePath("/dashboard/scenarios")
    revalidatePath(`/dashboard/scenarios/${scenarioId}`)
    return { success: "Scenario updated successfully!" }
  } catch (error) {
    console.error("Update scenario error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createTrainingSession(prevState: any, formData: FormData) {
  const title = formData.get("title")
  const scenarioId = formData.get("scenarioId")
  const startTime = formData.get("startTime")

  if (!title || !scenarioId) {
    return { error: "Title and scenario are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and their organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

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

    revalidatePath("/dashboard/sessions")
    redirect(`/dashboard/sessions/${session.id}`)
  } catch (error) {
    console.error("Create training session error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function inviteParticipant(prevState: any, formData: FormData) {
  const sessionId = formData.get("sessionId")
  const participantEmail = formData.get("participantEmail")
  const roleAssignment = formData.get("roleAssignment") || "participant"

  if (!sessionId || !participantEmail) {
    return { error: "Session ID and participant email are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and verify permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to invite participants" }
    }

    // Find participant by email
    const { data: participant } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", participantEmail.toString())
      .single()

    if (!participant) {
      return { error: "Participant not found" }
    }

    // Verify session belongs to organization
    const { data: session } = await supabase
      .from("training_sessions")
      .select("id")
      .eq("id", sessionId.toString())
      .eq("organization_id", profile.organization_id)
      .single()

    if (!session) {
      return { error: "Session not found" }
    }

    // Add participant to session
    const { error: inviteError } = await supabase
      .from("session_participants")
      .insert({
        session_id: sessionId.toString(),
        participant_id: participant.user_id,
        role_assignment: roleAssignment.toString(),
        status: "invited",
      })

    if (inviteError) {
      return { error: "Failed to invite participant" }
    }

    revalidatePath(`/dashboard/sessions/${sessionId}`)
    return { success: "Participant invited successfully!" }
  } catch (error) {
    console.error("Invite participant error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function submitResponse(prevState: any, formData: FormData) {
  const sessionId = formData.get("sessionId")
  const digitalExperienceId = formData.get("digitalExperienceId")
  const responseContent = formData.get("responseContent")
  const responseType = formData.get("responseType") || "reaction"

  if (!sessionId || !responseContent) {
    return { error: "Session ID and response content are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    // Verify user is participant in this session
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
    const { error } = await supabase
      .from("participant_responses")
      .insert({
        session_id: sessionId.toString(),
        participant_id: user.id,
        digital_experience_id: digitalExperienceId?.toString() || null,
        response_type: responseType.toString(),
        response_content: responseContent.toString(),
        response_time: new Date().toISOString(),
      })

    if (error) {
      return { error: "Failed to submit response" }
    }

    revalidatePath(`/dashboard/sessions/${sessionId}/training`)
    return { success: "Response submitted successfully!" }
  } catch (error) {
    console.error("Submit response error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function uploadDocument(prevState: any, formData: FormData) {
  const scenarioId = formData.get("scenarioId")
  const title = formData.get("title")
  const fileName = formData.get("fileName")
  const filePath = formData.get("filePath")
  const fileType = formData.get("fileType")
  const fileSize = formData.get("fileSize")

  if (!scenarioId || !title || !fileName || !filePath || !fileType) {
    return { error: "All document fields are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and verify permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to upload documents" }
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

    // Create document record
    const { error } = await supabase
      .from("documents")
      .insert({
        scenario_id: scenarioId.toString(),
        title: title.toString(),
        file_name: fileName.toString(),
        file_path: filePath.toString(),
        file_type: fileType.toString(),
        file_size: fileSize ? Number.parseInt(fileSize.toString()) : null,
        uploaded_by: user.id,
      })

    if (error) {
      return { error: "Failed to upload document" }
    }

    revalidatePath(`/dashboard/scenarios/${scenarioId}`)
    return { success: "Document uploaded successfully!" }
  } catch (error) {
    console.error("Upload document error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function inviteMember(prevState: any, formData: FormData) {
  const email = formData.get("email")
  const role = formData.get("role")

  if (!email || !role) {
    return { error: "Email and role are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and verify permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return { error: "You don't have permission to invite members" }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toString())
      .single()

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // For now, we'll just create a placeholder profile
    // In a real implementation, you might want to send an email invitation
    // and create the profile when they accept
    const { error: inviteError } = await supabase
      .from("profiles")
      .insert({
        email: email.toString(),
        role: role.toString(),
        organization_id: profile.organization_id,
        full_name: null, // Will be set when user completes signup
        user_id: null, // Will be set when user creates account
      })

    if (inviteError) {
      console.error("Invite member error:", inviteError)
      return { error: "Failed to invite member" }
    }

    revalidatePath("/dashboard/members")
    revalidatePath("/dashboard/organization")
    return { success: "Member invited successfully!" }
  } catch (error) {
    console.error("Invite member error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createDigitalExperience(prevState: any, formData: FormData) {
  const scenarioId = formData.get("scenarioId")
  const typeName = formData.get("typeId") // This is actually the type name, not ID
  const title = formData.get("title")
  const content = formData.get("content")
  const triggerTime = formData.get("triggerTime") || "0"
  const platform = formData.get("platform")
  const authorName = formData.get("authorName")
  const urgencyLevel = formData.get("urgencyLevel")

  if (!scenarioId || !typeName || !content) {
    return { error: "Scenario, type, and content are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Get current user and verify permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "You must be logged in" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || !["admin", "trainer"].includes(profile.role)) {
      return { error: "You don't have permission to create digital experiences" }
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

    // Get the type_id from the type name
    const { data: typeData, error: typeError } = await supabase
      .from("digital_experience_types")
      .select("id")
      .eq("name", typeName.toString())
      .single()

    if (typeError || !typeData) {
      return { error: "Invalid experience type" }
    }

    // Create digital experience
    const { error } = await supabase
      .from("digital_experiences")
      .insert({
        scenario_id: scenarioId.toString(),
        type_id: typeData.id,
        title: title?.toString() || null,
        content: content.toString(),
        trigger_time: Number.parseInt(triggerTime.toString()) * 60, // Convert minutes to seconds
        metadata: {
          platform: platform?.toString() || null,
          author_name: authorName?.toString() || null,
          urgency_level: urgencyLevel?.toString() || null,
        },
        created_by: user.id,
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
