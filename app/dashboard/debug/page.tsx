import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export default async function DebugPage() {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  // Get all scenarios for the organization
  const { data: scenarios, error: scenariosError } = await supabase
    .from("scenarios")
    .select("*")
    .eq("organization_id", profile.organization_id)

  // Get all scenarios without filter
  const { data: allScenarios, error: allScenariosError } = await supabase
    .from("scenarios")
    .select("*")

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Current User</h2>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">User Profile</h2>
          <pre className="text-sm">{JSON.stringify(profile, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Organization</h2>
          <pre className="text-sm">{JSON.stringify(organization, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Scenarios for Organization</h2>
          <p>Organization ID: {profile.organization_id}</p>
          <p>Error: {scenariosError?.message || "None"}</p>
          <pre className="text-sm">{JSON.stringify(scenarios, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">All Scenarios</h2>
          <p>Error: {allScenariosError?.message || "None"}</p>
          <pre className="text-sm">{JSON.stringify(allScenarios, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
