import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InviteMemberForm } from "@/components/organization/invite-member-form"
import { Users, Mail } from "lucide-react"

export default async function MembersPage() {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get organization members
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "trainer":
        return "bg-blue-100 text-blue-800"
      case "participant":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600 mt-2">Manage your organization's team members and their roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Organization Members ({members?.length || 0})
              </CardTitle>
              <CardDescription>Current team members in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member) => {
                    const initials = member.full_name
                      ? member.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                      : member.email[0].toUpperCase()

                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{member.full_name || "Unknown"}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by inviting team members to join your organization.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invite Form */}
        <div>{profile.role === "admin" && <InviteMemberForm />}</div>
      </div>
    </div>
  )
}
