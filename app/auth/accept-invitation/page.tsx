"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserCheck } from "lucide-react"
import { acceptInvitation } from "@/lib/actions"
import { useState, useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        <>
          <UserCheck className="mr-2 h-4 w-4" />
          Accept Invitation
        </>
      )}
    </Button>
  )
}

export default function AcceptInvitationPage() {
  const [state, formAction] = useActionState(acceptInvitation, null)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [invitationDetails, setInvitationDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    // Fetch invitation details
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`)
        if (response.ok) {
          const data = await response.json()
          setInvitationDetails(data)
        }
      } catch (error) {
        console.error("Failed to fetch invitation:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">
              This invitation link is invalid or missing the required token.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Welcome!</CardTitle>
            <CardDescription className="text-center">
              {state.success}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Accept Invitation</CardTitle>
          <CardDescription className="text-center">
            {invitationDetails ? (
              <>
                You've been invited to join <strong>{invitationDetails.organization.name}</strong> as a <strong>{invitationDetails.role}</strong>.
              </>
            ) : (
              "Complete your account setup to join the organization."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {state.error}
              </div>
            )}

            <input type="hidden" name="token" value={token} />

            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full"
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
