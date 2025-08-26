import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ExperienceForm } from "@/components/digital-experiences/experience-form"
import { ExistingExperiencesList } from "@/components/digital-experiences/existing-experiences-list"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
          <p className="text-gray-600 mt-2">Add digital content to "{scenario.title}"</p>
        </div>
      </div>

      <Tabs defaultValue="existing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Select Existing Experience
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Experience
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Experiences</CardTitle>
              <CardDescription>
                Select from existing standalone experiences that can be added to this scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <ExistingExperiencesList scenarioId={params.id} /> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Experience</CardTitle>
              <CardDescription>
                Create a new digital experience specifically for this scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExperienceForm scenarioId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
