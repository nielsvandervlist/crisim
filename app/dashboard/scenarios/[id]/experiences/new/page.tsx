import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ExperienceForm } from "@/components/digital-experiences/experience-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewExperiencePageProps {
  params: {
    id: string
  }
}

export default async function NewExperiencePage({ params }: NewExperiencePageProps) {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Verify scenario exists and user has access
  const { data: scenario, error } = await supabase
    .from("scenarios")
    .select("id, title")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (error || !scenario) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/scenarios/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scenario
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Digital Experience</h1>
          <p className="text-gray-600 mt-2">Create realistic digital content for "{scenario.title}"</p>
        </div>
      </div>

      <ExperienceForm scenarioId={params.id} />
    </div>
  )
}
