import { getServerUserProfile } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { TrainingInterface } from "@/components/training/training-interface"

interface TrainingPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TrainingPage({ params }: TrainingPageProps) {
  const { id } = await params
  const profile = await getServerUserProfile()
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get session details with all related data
  const { data: session, error } = await supabase
    .from("training_sessions")
    .select(`
      *,
      scenario:scenarios(*),
      session_participants(
        id,
        participant_id,
        role_assignment,
        participant:profiles(full_name, email)
      ),
      digital_experiences:scenarios(
        digital_experiences(*)
      )
    `)
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (error || !session) {
    notFound()
  }

  // Check if user has access to this session
  const isTrainer = ["admin", "trainer"].includes(profile.role)
  const isParticipant = session.session_participants?.some((p: any) => p.participant_id === profile.user_id)

  if (!isTrainer && !isParticipant) {
    notFound()
  }

  // Get participant's role assignment
  const participantData = session.session_participants?.find((p: any) => p.participant_id === profile.user_id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Training Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {session.status}
              </Badge>
              <span className="text-sm text-gray-600">Scenario: {session.scenario?.title}</span>
              {participantData && (
                <span className="text-sm text-blue-600 font-medium">Role: {participantData.role_assignment}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Session Duration</div>
              <div className="font-medium">{session.scenario?.estimated_duration} minutes</div>
            </div>
            {isTrainer && (
              <Button variant="outline" size="sm">
                Trainer Controls
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Training Interface */}
      <TrainingInterface
        session={session}
        userProfile={profile}
        isTrainer={isTrainer}
        participantRole={participantData?.role_assignment}
      />
    </div>
  )
}
