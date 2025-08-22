import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { SessionForm } from "@/components/sessions/session-form"

interface NewSessionPageProps {
  searchParams: {
    scenario?: string
  }
}

export default async function NewSessionPage({ searchParams }: NewSessionPageProps) {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get scenarios and members
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Training Session</h1>
        <p className="text-gray-600 mt-2">Set up a new crisis training session for your team</p>
      </div>

      <SessionForm scenarios={scenarios} members={members} initialScenarioId={searchParams.scenario} />
    </div>
  )
}
