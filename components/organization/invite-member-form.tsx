"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"
import { inviteMember } from "@/lib/actions"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending invitation...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Send Invitation
        </>
      )}
    </Button>
  )
}

export function InviteMemberForm() {
  const [state, formAction] = useActionState(inviteMember, null)
  const [role, setRole] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
        <CardDescription>Send an invitation to join your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {state.success}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@company.com"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <Select name="role" value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
