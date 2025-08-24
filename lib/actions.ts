"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { emailService } from "@/lib/email-service"

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

    // Send welcome email
    try {
      const emailResult = await emailService.sendWelcomeEmail(user.id)
      if (!emailResult.success) {
        console.error("Failed to send welcome email:", emailResult.error)
        // Don't fail signup if email fails, just log it
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Continue with success even if email fails
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
  const participants = formData.get("participants")
  const participantRoles = formData.get("participantRoles")

  if (!title || !scenarioId) {
    return { error: "Title and scenario are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

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
    console.error("Session creation error:", sessionError)
    return { error: "Failed to create training session" }
  }

  // Add participants if any were selected
  console.log("Raw form data:", { participants, participantRoles })
  console.log("Participants type:", typeof participants, "Roles type:", typeof participantRoles)
  
  if (participants && participantRoles) {
    try {
      const participantsList = JSON.parse(participants.toString())
      const rolesMap = JSON.parse(participantRoles.toString())
      
      console.log("Parsed participants data:", { participantsList, rolesMap })
      console.log("Participants list length:", participantsList.length)
      
      if (participantsList.length > 0) {
        const participantRecords = participantsList.map((participantId: string) => ({
          session_id: session.id,
          participant_id: participantId,
          role_assignment: rolesMap[participantId] || "Observer",
          status: "invited",
        }))

        console.log("Participant records to insert:", participantRecords)

        const { error: participantsError } = await supabase
          .from("session_participants")
          .insert(participantRecords)

        if (participantsError) {
          console.error("Failed to add participants:", participantsError)
          // Don't fail the entire operation if adding participants fails
        } else {
          console.log("Participants added successfully!")
        }
      } else {
        console.log("No participants selected")
      }
    } catch (parseError) {
      console.error("Failed to parse participants data:", parseError)
      console.error("Parse error details:", parseError)
      // Don't fail the entire operation if parsing fails
    }
  } else {
    console.log("No participants data in form")
    console.log("Participants value:", participants)
    console.log("Roles value:", participantRoles)
  }

  revalidatePath("/dashboard/sessions")
  return { success: true, sessionId: session.id }
}

export async function updateTrainingSession(prevState: any, formData: FormData) {
  const sessionId = formData.get("sessionId")
  const title = formData.get("title")
  const scenarioId = formData.get("scenarioId")
  const startTime = formData.get("startTime")
  const participants = formData.get("participants")
  const participantRoles = formData.get("participantRoles")

  if (!sessionId || !title || !scenarioId) {
    return { error: "Session ID, title and scenario are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

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
    return { error: "You don't have permission to update training sessions" }
  }

  // Verify session belongs to organization and user has access
  const { data: existingSession, error: sessionCheckError } = await supabase
    .from("training_sessions")
    .select("id, created_by")
    .eq("id", sessionId.toString())
    .eq("organization_id", profile.organization_id)
    .single()

  if (sessionCheckError || !existingSession) {
    return { error: "Session not found or access denied" }
  }

  // Only allow creator or admin to edit
  if (existingSession.created_by !== user.id && profile.role !== "admin") {
    return { error: "You don't have permission to edit this session" }
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

  // Update training session
  const { error: updateError } = await supabase
    .from("training_sessions")
    .update({
      scenario_id: scenarioId.toString(),
      title: title.toString(),
      start_time: startTime ? new Date(startTime.toString()).toISOString() : null,
    })
    .eq("id", sessionId.toString())

  if (updateError) {
    console.error("Session update error:", updateError)
    return { error: "Failed to update training session" }
  }

  // Update participants if any were selected
  console.log("Update - Raw form data:", { participants, participantRoles })
  console.log("Update - Participants type:", typeof participants, "Roles type:", typeof participantRoles)
  
  if (participants && participantRoles) {
    try {
      // First, remove all existing participants
      const { error: deleteError } = await supabase
        .from("session_participants")
        .delete()
        .eq("session_id", sessionId.toString())

      if (deleteError) {
        console.error("Failed to remove existing participants:", deleteError)
      }

      // Then add the new participants
      const participantsList = JSON.parse(participants.toString())
      const rolesMap = JSON.parse(participantRoles.toString())
      
      console.log("Update - Parsed participants data:", { participantsList, rolesMap })
      console.log("Update - Participants list length:", participantsList.length)
      
      if (participantsList.length > 0) {
        const participantRecords = participantsList.map((participantId: string) => ({
          session_id: sessionId.toString(),
          participant_id: participantId,
          role_assignment: rolesMap[participantId] || "Observer",
          status: "invited",
        }))

        console.log("Update - Participant records to insert:", participantRecords)

        const { error: participantsError } = await supabase
          .from("session_participants")
          .insert(participantRecords)

        if (participantsError) {
          console.error("Failed to add participants:", participantsError)
          // Don't fail the entire operation if adding participants fails
        } else {
          console.log("Update - Participants updated successfully!")
        }
      } else {
        console.log("Update - No participants selected")
      }
    } catch (parseError) {
      console.error("Failed to parse participants data:", parseError)
      console.error("Update - Parse error details:", parseError)
      // Don't fail the entire operation if parsing fails
    }
  } else {
    console.log("Update - No participants data in form")
    console.log("Update - Participants value:", participants)
    console.log("Update - Roles value:", participantRoles)
  }

  revalidatePath("/dashboard/sessions")
  revalidatePath(`/dashboard/sessions/${sessionId}`)
  return { success: true, sessionId: sessionId.toString() }
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

    // Send invitation email
    try {
      const emailResult = await emailService.sendSessionInvitations(sessionId.toString())
      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error)
        // Don't fail the entire operation if email fails, just log it
      }
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError)
      // Continue with success even if email fails
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
      .select("organization_id, role, full_name")
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

    // Clean up expired invitations for this email in this organization
    await supabase
      .from("member_invitations")
      .update({ status: "expired" })
      .eq("email", email.toString())
      .eq("organization_id", profile.organization_id)
      .eq("status", "pending")
      .lt("expires_at", new Date().toISOString())

    // Check if there's already a valid pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from("member_invitations")
      .select("id, expires_at")
      .eq("email", email.toString())
      .eq("organization_id", profile.organization_id)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString()) // Only consider non-expired invitations
      .single()

    if (existingInvitation) {
      return { error: "An active invitation has already been sent to this email address" }
    }

    // Get organization details for the email
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .single()

    if (!organization) {
      return { error: "Organization not found" }
    }

    // Generate invitation token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_invitation_token')

    if (tokenError || !tokenData) {
      console.error("Token generation error:", tokenError)
      return { error: "Failed to generate invitation token" }
    }

    // Create invitation record
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { error: inviteError } = await supabase
      .from("member_invitations")
      .insert({
        email: email.toString(),
        organization_id: profile.organization_id,
        role: role.toString(),
        invited_by: user.id,
        invitation_token: tokenData,
        expires_at: expiresAt.toISOString(),
      })

    if (inviteError) {
      console.error("Invite member error:", inviteError)
      return { error: "Failed to create invitation" }
    }

    // Send invitation email
    try {
      const emailResult = await emailService.sendMemberInvitation(
        profile.full_name || "Admin",
        organization.name,
        role.toString(),
        email.toString(),
        tokenData
      )
      
      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error)
        // Don't fail the entire operation if email fails, just log it
        return { success: "Invitation created but email delivery failed. Please try again." }
      }
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError)
      return { success: "Invitation created but email delivery failed. Please try again." }
    }

    revalidatePath("/dashboard/members")
    revalidatePath("/dashboard/organization")
    return { success: "Invitation sent successfully! The user will receive an email to join your organization." }
  } catch (error) {
    console.error("Invite member error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function acceptInvitation(prevState: any, formData: FormData) {
  const token = formData.get("token")
  const fullName = formData.get("fullName")
  const password = formData.get("password")

  if (!token || !fullName || !password) {
    return { error: "All fields are required" }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    return { error: "Supabase is not configured" }
  }

  try {
    // Create service client for admin operations
    const serviceClient = createServiceClient()
    
    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("member_invitations")
      .select(`
        *,
        organization:organizations(name)
      `)
      .eq("invitation_token", token.toString())
      .eq("status", "pending")
      .single()

    if (inviteError || !invitation) {
      return { error: "Invalid or expired invitation" }
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { error: "This invitation has expired" }
    }

    // Create the user account using service client to bypass email verification
    const { data: { user }, error: signUpError } = await serviceClient.auth.admin.createUser({
      email: invitation.email,
      password: password.toString(),
      email_confirm: true, // Automatically confirm email for invited users
      user_metadata: {
        full_name: fullName.toString(),
      }
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    if (!user) {
      return { error: "Failed to create user account" }
    }

    // Create user profile using service client to bypass RLS
    const { error: profileError } = await serviceClient
      .from("profiles")
      .insert({
        user_id: user.id,
        email: invitation.email,
        full_name: fullName.toString(),
        role: invitation.role,
        organization_id: invitation.organization_id,
        email_verified: true, // Since they came through invitation
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: "Failed to create user profile" }
    }

    // Mark invitation as accepted using service client
    const { error: updateError } = await serviceClient
      .from("member_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("invitation_token", token.toString())

    if (updateError) {
      console.error("Failed to update invitation status:", updateError)
      // Don't fail the entire operation if this fails
    }

    // Send welcome email
    try {
      const emailResult = await emailService.sendWelcomeEmail(user.id)
      if (!emailResult.success) {
        console.error("Failed to send welcome email:", emailResult.error)
        // Don't fail signup if email fails, just log it
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Continue with success even if email fails
    }

    return { success: "Account created successfully! You can now log in to access your organization." }
  } catch (error) {
    console.error("Accept invitation error:", error)
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
