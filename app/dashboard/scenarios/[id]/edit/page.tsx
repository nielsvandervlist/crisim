import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ScenarioForm } from "@/components/scenarios/scenario-form"
import { notFound } from "next/navigation"

interface EditScenarioPageProps {
  params: {
    id: string
  }
}

export default async function EditScenarioPage({ params }: EditScenarioPageProps) {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = createClient()

  // Get scenario details
  const { data: scenario, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (error || !scenario) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Scenario</h1>
        <p className="text-gray-600 mt-2">Update the scenario details and settings</p>
      </div>

      <ScenarioForm scenario={scenario} mode="edit" />
    </div>
  )
}
