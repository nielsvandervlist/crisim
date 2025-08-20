import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Mail, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MembersListProps {
  organizationId: string
}

export async function MembersList({ organizationId }: MembersListProps) {
  const supabase = createClient()

  const { data: members } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("organization_id", organizationId)
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

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Team Members ({members?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(member.full_name, member.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{member.full_name || "No name set"}</p>
                    <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="mr-1 h-3 w-3" />
                    {member.email}
                  </div>
                  <p className="text-xs text-gray-400">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Role</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Remove Member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {!members?.length && (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No team members yet</p>
              <p className="text-sm">Invite your first team member to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
