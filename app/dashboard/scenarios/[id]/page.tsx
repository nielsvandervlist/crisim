import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Clock, User, Calendar, Edit, Play, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExperienceList } from "@/components/digital-experiences/experience-list"
import { DocumentsSection } from "@/components/documents/documents-section"

interface ScenarioPageProps {
  params: {
    id: string
  }
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const awaitedParams = await params
  const profile = await requireRole(["admin", "trainer"])
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  // Get scenario details with related digital experiences
  const { data: scenario, error } = await supabase
    .from("scenarios")
    .select(`
      *,
      digital_experiences (
        id,
        type_id,
        title,
        content,
        metadata,
        trigger_time,
        created_at,
        digital_experience_types (
          name
        )
      ),
      training_sessions (
        id,
        title,
        status,
        created_at
      )
    `)
    .eq("id", awaitedParams.id)
    .single()

  if (error) {
    console.error("Database error:", error)
    notFound()
  }

  if (!scenario) {
    console.log("No scenario found")
    notFound()
  }

  // Transform digital experiences to match the expected interface
  const transformedExperiences = scenario.digital_experiences?.map((exp: any) => ({
    id: exp.id,
    type: exp.digital_experience_types?.name || 'unknown',
    platform: exp.metadata?.platform,
    title: exp.title,
    content: exp.content,
    author_name: exp.metadata?.author_name,
    timestamp_offset: exp.trigger_time || 0,
    created_at: exp.created_at
  })) || []

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{scenario.title}</h1>
          <p className="text-gray-600 mt-2">Crisis Training Scenario</p>
        </div>
        <div className="flex space-x-3">
          <Link href={`/dashboard/scenarios/${scenario.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/sessions/new?scenario=${scenario.id}`}>
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" />
              Start Training
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scenario Details */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCrisisTypeColor(scenario.crisis_type)}>
                    {scenario.crisis_type.replace("_", " ")}
                  </Badge>
                  <Badge className={getDifficultyColor(scenario.difficulty_level)}>{scenario.difficulty_level}</Badge>
                </div>

                <p className="text-gray-700 leading-relaxed">{scenario.description}</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Duration: {scenario.estimated_duration} minutes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    Created by: {scenario.creator?.full_name || "Unknown"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created: {new Date(scenario.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-2" />
                    Experiences: {transformedExperiences.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Digital Experiences */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Digital Experiences</CardTitle>
                  <CardDescription>Mock social media posts, news articles, and other digital content</CardDescription>
                </div>
                <Link href={`/dashboard/scenarios/${scenario.id}/experiences/new`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ExperienceList experiences={transformedExperiences} canEdit={true} />
            </CardContent>
          </Card>

          {/* Documents */}
          <DocumentsSection scenarioId={scenario.id} canEdit={true} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Training Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Sessions</CardTitle>
              <CardDescription>Sessions using this scenario</CardDescription>
            </CardHeader>
            <CardContent>
              {scenario.training_sessions && scenario.training_sessions.length > 0 ? (
                <div className="space-y-3">
                  {scenario.training_sessions.slice(0, 5).map((session: any) => (
                    <div key={session.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{session.title}</p>
                        <p className="text-xs text-gray-500">{new Date(session.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={session.status === "active" ? "default" : "secondary"}>{session.status}</Badge>
                    </div>
                  ))}
                  {scenario.training_sessions.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{scenario.training_sessions.length - 5} more sessions
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">No training sessions yet</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/scenarios/${scenario.id}/experiences/new`}>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Digital Experience
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <Link href={`/dashboard/sessions/new?scenario=${scenario.id}`}>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Play className="mr-2 h-4 w-4" />
                  Start New Session
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Target className="mr-2 h-4 w-4" />
                Duplicate Scenario
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
