import { requireRole } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SessionForm } from "@/components/sessions/session-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditSessionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()
  const { id } = await params

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get session details
  const { data: session, error: sessionError } = await supabase
    .from("training_sessions")
    .select(`
      *,
      scenarios (
        id,
        title,
        crisis_type,
        difficulty_level,
        estimated_duration
      )
    `)
    .eq("id", id)
    .single()

  if (sessionError || !session) {
    notFound()
  }

  // Check if user has access to edit this session
  const isCreator = session.created_by === profile.id
  const isAdmin = profile.role === "admin"
  const hasAccess = isCreator || isAdmin

  if (!hasAccess) {
    notFound()
  }

  // Get scenarios and members for the form
  const [scenariosResult, membersResult] = await Promise.all([
    supabase
      .from("scenarios")
      .select("id, title, crisis_type, difficulty_level, estimated_duration")
      .eq("organization_id", profile.organization_id)
      .order("title"),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("organization_id", profile.organization_id)
      .order("full_name"),
  ])

  const scenarios = scenariosResult.data || []
  const members = membersResult.data || []

  // Get current participants
  const { data: participants } = await supabase
    .from("session_participants")
    .select(`
      participant_id,
      role_assignment,
      status,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq("session_id", id)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/sessions/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Session
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Training Session</h1>
        <p className="text-gray-600 mt-2">
          Update details for "{session.title}"
        </p>
      </div>

      <SessionForm 
        scenarios={scenarios} 
        members={members} 
        initialScenarioId={session.scenario_id}
        initialTitle={session.title}
        initialStartTime={session.start_time}
        initialParticipants={participants || []}
        isEditing={true}
        sessionId={id}
      />
    </div>
  )
}
