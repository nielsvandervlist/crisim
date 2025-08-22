import { getServerUserProfile } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Play, Plus, Clock, TrendingUp, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const profile = await getServerUserProfile()
  
  if (!profile) {
    return <div>Loading...</div>
  }

  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get organization details
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  // Get basic stats
  const { count: scenariosCount } = await supabase
    .from("scenarios")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id)

  const { count: sessionsCount } = await supabase
    .from("training_sessions")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id)

  const { count: membersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile.full_name || profile.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scenariosCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total crisis scenarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active training sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Organization members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{profile.role}</div>
            <p className="text-xs text-muted-foreground">
              {organization?.name || "Organization"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest training sessions and scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/scenarios/new"
              className="block p-3 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              Create New Scenario
            </a>
            <a
              href="/dashboard/sessions/new"
              className="block p-3 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              Start Training Session
            </a>
            <a
              href="/dashboard/members"
              className="block p-3 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              Manage Team Members
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
