import { getServerUserProfile } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users, Target, Plus } from "lucide-react"
import Link from "next/link"

export default async function SessionsPage() {
  const profile = await getServerUserProfile()
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  console.log('Profile:', { 
    role: profile.role, 
    organization_id: profile.organization_id,
    user_id: profile.user_id 
  })

  // Get training sessions based on user role
  let sessionsQuery = supabase
    .from("training_sessions")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  // If participant, only show sessions they're assigned to
  if (profile.role === "participant") {
    const { data: participantSessions } = await supabase
      .from("session_participants")
      .select("session_id")
      .eq("participant_id", profile.user_id)
    
    const sessionIds = participantSessions?.map(p => p.session_id) || []
    sessionsQuery = sessionsQuery.in("id", sessionIds)
  }

  const { data: sessions } = await sessionsQuery

  console.log('Sessions:', sessions)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canCreateSessions = ["admin", "trainer"].includes(profile.role)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Sessions</h1>
          <p className="text-gray-600 mt-2">
            {profile.role === "participant"
              ? "Your assigned training sessions"
              : "Manage and monitor training sessions"}
          </p>
        </div>
        {canCreateSessions && (
          <Link href="/dashboard/sessions/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </Link>
        )}
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const isParticipant = session.session_participants?.some((p: any) => p.participant_id === profile.user_id)
            const participantRole = session.session_participants?.find(
              (p: any) => p.participant_id === profile.user_id,
            )?.role_assignment

            return (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                      <CardDescription className="mt-1">{session.scenario?.title}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.scenario && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {session.scenario.crisis_type.replace("_", " ")}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.scenario.estimated_duration} min
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {session.session_participants?.length || 0} participants
                      </div>
                      {session.start_time && <div>{new Date(session.start_time).toLocaleDateString()}</div>}
                    </div>

                    {isParticipant && participantRole && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                        <p className="text-xs text-blue-700">
                          Your role: <span className="font-medium">{participantRole}</span>
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">Created by {session.creator?.full_name || "Unknown"}</div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/sessions/${session.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      {session.status === "active" && (
                        <Link href={`/dashboard/sessions/${session.id}/training`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Play className="mr-1 h-3 w-3" />
                            Join
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {profile.role === "participant" ? "No training sessions assigned" : "No training sessions yet"}
            </h3>
            <p className="mt-2 text-gray-600">
              {profile.role === "participant"
                ? "You haven't been assigned to any training sessions yet."
                : "Create your first training session to start practicing crisis management."}
            </p>
            {canCreateSessions && (
              <Link href="/dashboard/sessions/new">
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Session
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
