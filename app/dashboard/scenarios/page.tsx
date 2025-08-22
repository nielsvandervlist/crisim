import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Clock, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function ScenariosPage() {
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get scenarios for the organization
  const { data: scenarios, error } = await supabase
    .from("scenarios")
    .select(`
      *,
      digital_experiences(id)
    `)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  // Debug logging
  console.log("Organization ID:", profile.organization_id)
  console.log("Scenarios found:", scenarios?.length || 0)
  console.log("Scenarios data:", scenarios)
  console.log("Error:", error)

  if (error) {
    console.error("Error fetching scenarios:", error)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCrisisTypeColor = (type: string) => {
    switch (type) {
      case "cybersecurity":
        return "bg-purple-100 text-purple-800"
      case "natural_disaster":
        return "bg-orange-100 text-orange-800"
      case "public_relations":
        return "bg-blue-100 text-blue-800"
      case "financial":
        return "bg-red-100 text-red-800"
      case "operational":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crisis Scenarios</h1>
          <p className="text-gray-600 mt-2">Create and manage crisis training scenarios for your team</p>
        </div>
        <Link href="/dashboard/scenarios/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Scenario
          </Button>
        </Link>
      </div>

      {scenarios && scenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{scenario.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">{scenario.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/scenarios/${scenario.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/scenarios/${scenario.id}/edit`}>Edit Scenario</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCrisisTypeColor(scenario.crisis_type)}>
                      {scenario.crisis_type.replace("_", " ")}
                    </Badge>
                    <Badge className={getDifficultyColor(scenario.difficulty_level)}>{scenario.difficulty_level}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {scenario.estimated_duration} min
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {scenario.digital_experiences?.length || 0} experiences
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created {new Date(scenario.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/scenarios/${scenario.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/sessions/new?scenario=${scenario.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Start Training
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No scenarios yet</h3>
            <p className="mt-2 text-gray-600">Create your first crisis scenario to start training your team.</p>
            <Link href="/dashboard/scenarios/new">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Scenario
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
