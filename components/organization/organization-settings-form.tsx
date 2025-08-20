"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { updateOrganization } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Update Organization
        </>
      )}
    </Button>
  )
}

interface OrganizationSettingsFormProps {
  organization: {
    id: string
    name: string
    slug: string
  }
}

export function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
  const [state, formAction] = useActionState(updateOrganization, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>Update your organization details</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="organizationId" value={organization.id} />

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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <Input id="name" name="name" type="text" defaultValue={organization.name} required className="w-full" />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Organization Slug
            </label>
            <Input
              id="slug"
              name="slug"
              type="text"
              defaultValue={organization.slug}
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
              required
              className="w-full font-mono"
            />
            <p className="text-xs text-gray-500">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
