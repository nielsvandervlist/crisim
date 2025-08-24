"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Eye, Clock, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DigitalExperience {
  id: string
  title: string | null
  content: string
  type: {
    name: string
  }
  metadata: {
    platform?: string
    author_name?: string
    urgency_level?: string
  }
  created_at: string
  created_by: string
}

const urgencyColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
}

const typeLabels = {
  social_media: "Social Media",
  news: "News Article",
  email: "Email",
  video: "Video",
  phone_call: "Phone Call",
  document: "Document",
  sms: "SMS",
  press_release: "Press Release",
}

export function DigitalExperiencesList() {
  const [experiences, setExperiences] = useState<DigitalExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("digital_experiences")
        .select(`
          id,
          title,
          content,
          type:digital_experience_types(name),
          metadata,
          created_at,
          created_by
        `)
        .is("scenario_id", null) // Only show standalone experiences
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setExperiences(data || [])
    } catch (err) {
      console.error("Error fetching experiences:", err)
      setError("Failed to load digital experiences")
    } finally {
      setLoading(false)
    }
  }

  const deleteExperience = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("digital_experiences")
        .delete()
        .eq("id", id)
        .is("scenario_id", null) // Only allow deletion of standalone experiences

      if (error) {
        throw error
      }

      // Refresh the list
      fetchExperiences()
    } catch (err) {
      console.error("Error deleting experience:", err)
      alert("Failed to delete experience")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading experiences...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchExperiences} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">No digital experiences created yet</div>
        <p className="text-sm text-gray-400">
          Create your first digital experience using the form on the left
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <Card key={experience.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[experience.type.name as keyof typeof typeLabels] || experience.type.name}
                  </Badge>
                  {experience.metadata.urgency_level && (
                    <Badge 
                      className={`text-xs ${urgencyColors[experience.metadata.urgency_level as keyof typeof urgencyColors] || urgencyColors.medium}`}
                    >
                      {experience.metadata.urgency_level}
                    </Badge>
                  )}
                  {experience.metadata.platform && (
                    <Badge variant="outline" className="text-xs">
                      {experience.metadata.platform}
                    </Badge>
                  )}
                </div>
                {experience.title && (
                  <CardTitle className="text-lg">{experience.title}</CardTitle>
                )}
                {experience.metadata.author_name && (
                  <CardDescription className="text-sm">
                    By {experience.metadata.author_name}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteExperience(experience.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 line-clamp-3">
              {experience.content}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(experience.created_at).toLocaleDateString()}
              </div>
              {experience.metadata.urgency_level === "critical" && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  High Priority
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
