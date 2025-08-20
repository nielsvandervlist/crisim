import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Play, Plus, Clock, TrendingUp, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const profile = await getUserProfile()
  const supabase = createClient()

  // Get dashboard statistics based on user role
  if (profile.role === "participant") {
    // Participant-specific dashboard
    const [assignedSessionsResult, completedSessionsResult, upcomingSessionsResult] = await Promise.all([
      supabase
        .from("session_participants")
        .select(`
          *,
          session:training_sessions(
            id, title, status, start_time, end_time,
            scenario:scenarios(title, crisis_type, estimated_duration)
          )
        `)
        .eq("participant_id", profile.id),
      supabase
        .from("session_participants")
        .select(`
          *,
          session:training_sessions(id, title, status, start_time, scenario:scenarios(title))
        `)
        .eq("participant_id", profile.id)
        .eq("status", "completed"),
      supabase
        .from("session_participants")
        .select(`
          *,
          session:training_sessions(
            id, title, status, start_time,
            scenario:scenarios(title, crisis_type, estimated_duration)
          )
        `)
        .eq("participant_id", profile.id)
        .in("status", ["invited", "joined"])
        .order("session.start_time", { ascending: true })
        .limit(5),
    ])

    const participantStats = {
      totalSessions: assignedSessionsResult.data?.length || 0,
      completedSessions: completedSessionsResult.data?.length || 0,
      upcomingSessions: upcomingSessionsResult.data?.filter((s) => s.session?.status === "scheduled").length || 0,
      activeSessions: upcomingSessionsResult.data?.filter((s) => s.session?.status === "active").length || 0,
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800"
        case "scheduled":
          return "bg-blue-100 text-blue-800"
        case "completed":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const getCrisisTypeColor = (type: string) => {
      switch (type) {
        case "cybersecurity":
          return "bg-purple-100 text-purple-800"
        case "natural_disaster":
          return "bg-orange-100 text-orange-800"
        case "public_relations":
          return "bg-blue-100 text-blue-800"
        case "financial":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.full_name || "User"}</h1>
          <p className="text-gray-600 mt-2">{profile.organization?.name} • Participant</p>
        </div>

        {/* Participant Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participantStats.totalSessions}</div>
              <p className="text-xs text-gray-600">Training sessions assigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participantStats.completedSessions}</div>
              <p className="text-xs text-gray-600">Sessions completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participantStats.upcomingSessions}</div>
              <p className="text-xs text-gray-600">Sessions scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Play className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participantStats.activeSessions}</div>
              <p className="text-xs text-gray-600">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions Alert */}
        {participantStats.activeSessions > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Play className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-orange-900">Active Training Session</h3>
                    <p className="text-orange-700">You have an active training session waiting for you.</p>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">Join Training</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Training Sessions</CardTitle>
            <CardDescription>Your scheduled crisis training sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessionsResult.data && upcomingSessionsResult.data.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessionsResult.data.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{participant.session?.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(participant.session?.status)} variant="secondary">
                          {participant.session?.status}
                        </Badge>
                        <Badge
                          className={getCrisisTypeColor(participant.session?.scenario?.crisis_type)}
                          variant="secondary"
                        >
                          {participant.session?.scenario?.crisis_type?.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Role: {participant.assigned_role || "Participant"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {participant.session?.scenario?.estimated_duration} min
                        </div>
                        {participant.session?.start_time && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(participant.session.start_time).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {participant.session?.status === "active" && (
                        <Link href={`/dashboard/sessions/${participant.session.id}/training`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Join Training
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/sessions/${participant.session?.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-gray-300" />
                <p className="text-gray-500 mt-2">No upcoming training sessions</p>
                <p className="text-sm text-gray-400">Your trainer will assign you to sessions when available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>Your crisis management training journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm text-gray-600">
                  {participantStats.totalSessions > 0
                    ? Math.round((participantStats.completedSessions / participantStats.totalSessions) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      participantStats.totalSessions > 0
                        ? (participantStats.completedSessions / participantStats.totalSessions) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Sessions Completed:</span>
                  <span className="ml-2 font-medium">{participantStats.completedSessions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sessions Remaining:</span>
                  <span className="ml-2 font-medium">
                    {participantStats.totalSessions - participantStats.completedSessions}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Trainer/Admin dashboard
  const [scenariosResult, sessionsResult, membersResult, recentScenariosResult, recentSessionsResult] =
    await Promise.all([
      supabase.from("scenarios").select("id, is_active").eq("organization_id", profile.organization_id),
      supabase.from("training_sessions").select("id, status").eq("organization_id", profile.organization_id),
      supabase.from("profiles").select("id, role").eq("organization_id", profile.organization_id),
      supabase
        .from("scenarios")
        .select("id, title, crisis_type, created_at, creator:profiles!scenarios_created_by_fkey(full_name)")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("training_sessions")
        .select("id, title, status, start_time, scenario:scenarios(title)")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const stats = {
    scenarios: scenariosResult.data?.length || 0,
    activeScenarios: scenariosResult.data?.filter((s) => s.is_active).length || 0,
    sessions: sessionsResult.data?.length || 0,
    activeSessions: sessionsResult.data?.filter((s) => s.status === "active").length || 0,
    members: membersResult.data?.length || 0,
    trainers: membersResult.data?.filter((m) => m.role === "trainer").length || 0,
  }

  const getCrisisTypeColor = (type: string) => {
    switch (type) {
      case "cybersecurity":
        return "bg-purple-100 text-purple-800"
      case "natural_disaster":
        return "bg-orange-100 text-orange-800"
      case "public_relations":
        return "bg-blue-100 text-blue-800"
      case "financial":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.full_name || "User"}</h1>
          <p className="text-gray-600 mt-2">
            {profile.organization?.name} • {profile.role}
          </p>
        </div>
        {(profile.role === "admin" || profile.role === "trainer") && (
          <div className="flex space-x-3">
            <Link href="/dashboard/scenarios/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Scenario
              </Button>
            </Link>
            <Link href="/dashboard/sessions/new">
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Start Training
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scenarios</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scenarios}</div>
            <p className="text-xs text-gray-600">{stats.activeScenarios} active scenarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessions}</div>
            <p className="text-xs text-gray-600">{stats.activeSessions} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.members}</div>
            <p className="text-xs text-gray-600">{stats.trainers} trainers available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-gray-600">Average completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Scenarios</CardTitle>
              <CardDescription>Latest crisis training scenarios</CardDescription>
            </div>
            <Link href="/dashboard/scenarios">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentScenariosResult.data && recentScenariosResult.data.length > 0 ? (
              <div className="space-y-3">
                {recentScenariosResult.data.map((scenario) => (
                  <div key={scenario.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Link href={`/dashboard/scenarios/${scenario.id}`}>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                          {scenario.title}
                        </h4>
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCrisisTypeColor(scenario.crisis_type)} variant="secondary">
                          {scenario.crisis_type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-gray-500">by {scenario.creator?.full_name || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(scenario.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-8 w-8 text-gray-300" />
                <p className="text-gray-500 mt-2">No scenarios created yet</p>
                <Link href="/dashboard/scenarios/new">
                  <Button size="sm" className="mt-2">
                    Create First Scenario
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest training activity</CardDescription>
            </div>
            <Link href="/dashboard/sessions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSessionsResult.data && recentSessionsResult.data.length > 0 ? (
              <div className="space-y-3">
                {recentSessionsResult.data.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Link href={`/dashboard/sessions/${session.id}`}>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                          {session.title}
                        </h4>
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(session.status)} variant="secondary">
                          {session.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{session.scenario?.title}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {session.start_time ? new Date(session.start_time).toLocaleDateString() : "Not scheduled"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Play className="mx-auto h-8 w-8 text-gray-300" />
                <p className="text-gray-500 mt-2">No training sessions yet</p>
                <Link href="/dashboard/sessions/new">
                  <Button size="sm" className="mt-2">
                    Start First Session
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Trainers */}
      {(profile.role === "admin" || profile.role === "trainer") && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common trainer tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/scenarios/new">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Target className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Create Scenario</h3>
                  <p className="text-sm text-gray-600">Design a new crisis training scenario</p>
                </div>
              </Link>
              <Link href="/dashboard/sessions/new">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Play className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Start Training</h3>
                  <p className="text-sm text-gray-600">Launch a new training session</p>
                </div>
              </Link>
              <Link href="/dashboard/members">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Users className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Manage Team</h3>
                  <p className="text-sm text-gray-600">Invite and manage team members</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
