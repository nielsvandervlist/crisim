"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Eye, Clock, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

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

const getTypeName = (typeId: string) => {
  // This is a simple mapping - in a real app you might want to fetch this from the database
  const typeMap: { [key: string]: string } = {
    'social_media': 'social_media',
    'news': 'news',
    'email': 'email',
    'video': 'video',
    'phone_call': 'phone_call',
    'document': 'document',
    'sms': 'sms',
    'press_release': 'press_release'
  }
  return typeMap[typeId] || 'social_media'
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
      const { data, error } = await supabase
        .from("digital_experiences")
        .select(`
          id,
          title,
          content,
          type_id,
          metadata,
          created_at,
          created_by
        `)
        .is("scenario_id", null) // Only show standalone experiences
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(exp => ({
        ...exp,
        type: { name: getTypeName(exp.type_id) }
      }))

      setExperiences(transformedData)
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
          Click the "Create New Experience" button above to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <Card key={experience.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                    {typeLabels[experience.type.name as keyof typeof typeLabels] || experience.type.name}
                  </Badge>
                  {experience.metadata.urgency_level && (
                    <Badge 
                      className={`text-xs font-medium px-2 py-1 ${urgencyColors[experience.metadata.urgency_level as keyof typeof urgencyColors] || urgencyColors.medium}`}
                    >
                      {experience.metadata.urgency_level}
                    </Badge>
                  )}
                  {experience.metadata.platform && (
                    <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-gray-50">
                      {experience.metadata.platform}
                    </Badge>
                  )}
                </div>
                {experience.title && (
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {experience.title}
                  </CardTitle>
                )}
                {experience.metadata.author_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">
                        {experience.metadata.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{experience.metadata.author_name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 relative">
                <Link href={`/dashboard/digital-experiences/${experience.id}`}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/digital-experiences/${experience.id}/edit`}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteExperience(experience.id)
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <Link href={`/dashboard/digital-experiences/${experience.id}`} className="block">
            <CardContent className="cursor-pointer">
              <div className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                {experience.content}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(experience.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  {experience.metadata.urgency_level === "critical" && (
                    <div className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Critical Priority
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  ID: {experience.id.slice(0, 8)}...
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
