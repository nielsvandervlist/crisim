import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Users, Calendar, Settings } from "lucide-react"
import { InviteMemberForm } from "@/components/organization/invite-member-form"
import { OrganizationSettingsForm } from "@/components/organization/organization-settings-form"
import { MembersList } from "@/components/organization/members-list"

export default async function OrganizationPage() {
  const profile = await requireRole(["admin"])
  const supabase = createClient()

  // Get organization stats
  const [membersResult, scenariosResult, sessionsResult] = await Promise.all([
    supabase.from("profiles").select("id, role").eq("organization_id", profile.organization_id),
    supabase.from("scenarios").select("id").eq("organization_id", profile.organization_id),
    supabase.from("training_sessions").select("id, status").eq("organization_id", profile.organization_id),
  ])

  const stats = {
    totalMembers: membersResult.data?.length || 0,
    adminCount: membersResult.data?.filter((m) => m.role === "admin").length || 0,
    trainerCount: membersResult.data?.filter((m) => m.role === "trainer").length || 0,
    participantCount: membersResult.data?.filter((m) => m.role === "participant").length || 0,
    totalScenarios: scenariosResult.data?.length || 0,
    totalSessions: sessionsResult.data?.length || 0,
    activeSessions: sessionsResult.data?.filter((s) => s.status === "active").length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600 mt-2">Manage your organization settings and view analytics</p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Organization Details
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Organization Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.organization?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Organization Slug</label>
              <p className="text-lg font-mono text-gray-900 mt-1">{profile.organization?.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created</label>
              <p className="text-lg text-gray-900 mt-1">
                {new Date(profile.organization?.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Your Role</label>
              <Badge className="mt-1 bg-red-100 text-red-800">{profile.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <div className="text-xs text-gray-600 mt-2">
              {stats.adminCount} admin • {stats.trainerCount} trainers • {stats.participantCount} participants
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scenarios</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScenarios}</div>
            <p className="text-xs text-gray-600">Training scenarios created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-gray-600">Training sessions conducted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-gray-600">Currently running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Settings */}
        <OrganizationSettingsForm organization={profile.organization} />

        {/* Invite Members */}
        <InviteMemberForm />
      </div>

      {/* Members List */}
      <MembersList organizationId={profile.organization_id} />
    </div>
  )
}
