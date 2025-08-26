import { requireRole } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Play, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface SessionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const profile = await requireRole(["admin", "trainer", "participant"])
  const supabase = await createClient()
  const { id } = await params

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get session details with scenario and participants
  const { data: session, error: sessionError } = await supabase
    .from("training_sessions")
    .select(`
      *,
      scenarios (
        id,
        title,
        crisis_type,
        difficulty_level,
        estimated_duration,
        description
      ),
      session_participants (
        id,
        participant_id,
        role_assignment,
        status,
        profiles (
          id,
          full_name,
          email
        )
      )
    `)
    .eq("id", id)
    .single()

  if (sessionError || !session) {
    console.error("Session error:", sessionError)
    notFound()
  }

  console.log("Session data:", session)
  console.log("Session participants:", session.session_participants)

    // Check if user has access to this session
  const isAdminOrTrainer = ["admin", "trainer"].includes(profile.role)
  const isParticipant = session.session_participants?.some(
    (p: any) => p.participant_id === profile.user_id
  ) || false
  const isCreator = session.created_by === profile.user_id
  const hasAccess = isAdminOrTrainer || isParticipant || isCreator

  console.log(isParticipant)

  if (!hasAccess) {
    notFound()
  }

  // Ensure session_participants is always an array
  const sessionParticipants = session.session_participants || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
          <p className="text-gray-600 mt-2">
            Training session for {session.scenarios?.title}
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdminOrTrainer && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/sessions/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Session
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/sessions/${id}/training`}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Training
                </Link>
              </Button>
            </>
          )}
          {isParticipant && (
            <Button asChild>
              <Link href={`/dashboard/sessions/${id}/training`}>
                <Play className="mr-2 h-4 w-4" />
                Join Training
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Session Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(session.status)}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created by {profile.full_name}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {session.start_time ? formatDate(session.start_time) : "Not scheduled"}
                  </span>
                </div>
                {session.start_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatTime(session.start_time)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Information */}
          <Card>
            <CardHeader>
              <CardTitle>Training Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{session.scenarios?.title}</h4>
                  <p className="text-sm text-gray-600">{session.scenarios?.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline">
                    {session.scenarios?.crisis_type.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">
                    {session.scenarios?.difficulty_level}
                  </Badge>
                  <Badge variant="outline">
                    {session.scenarios?.estimated_duration} min
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Participants
              </CardTitle>
              <CardDescription>
                {sessionParticipants.length} team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionParticipants.length > 0 ? (
                <div className="space-y-3">
                  {sessionParticipants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.profiles?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {participant.role_assignment}
                        </p>
                      </div>
                      <Badge
                        variant={participant.status === "invited" ? "outline" : "default"}
                        className="text-xs"
                      >
                        {participant.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    No participants added yet
                  </p>
                  {isAdminOrTrainer && (
                    <p className="text-xs text-gray-400 mt-1">
                      Edit the session to add participants
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isAdminOrTrainer && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/sessions/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Session
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/sessions/${id}/training`}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Training
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/sessions">
                    ← Back to Sessions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
