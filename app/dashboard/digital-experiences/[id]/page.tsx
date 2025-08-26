"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Calendar, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DigitalExperiencePreview } from "@/components/digital-experiences/experience-preview"
import { supabase } from "@/lib/supabase/client"

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

export default function DigitalExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const [experience, setExperience] = useState<DigitalExperience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchExperience(params.id as string)
    }
  }, [params.id])

  const fetchExperience = async (id: string) => {
    try {
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
        .eq("id", id)
        .is("scenario_id", null) // Only show standalone experiences
        .single()

      if (error) {
        throw error
      }

      setExperience(data)
    } catch (err) {
      console.error("Error fetching experience:", err)
      setError("Failed to load digital experience")
    } finally {
      setLoading(false)
    }
  }

  const deleteExperience = async () => {
    if (!experience) return

    if (!confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("digital_experiences")
        .delete()
        .eq("id", experience.id)
        .is("scenario_id", null)

      if (error) {
        throw error
      }

      // Redirect to the main experiences page
      router.push("/dashboard/digital-experiences")
    } catch (err) {
      console.error("Error deleting experience:", err)
      alert("Failed to delete experience")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experience...</p>
        </div>
      </div>
    )
  }

  if (error || !experience) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/digital-experiences">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Experiences
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Experience Not Found</h2>
              <p className="text-gray-600 mb-4">
                {error || "The digital experience you're looking for doesn't exist or has been removed."}
              </p>
              <Link href="/dashboard/digital-experiences">
                <Button>Back to Experiences</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create preview data for the preview component
  const previewData = {
    type: experience.type.name,
    platform: experience.metadata?.platform,
    title: experience.title,
    content: experience.content,
    author_name: experience.metadata?.author_name,
    urgency_level: experience.metadata?.urgency_level,
    timestamp_offset: 0,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/digital-experiences">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Experiences
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {experience.title || "Untitled Experience"}
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage this digital experience
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/digital-experiences/${experience.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={deleteExperience}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Experience Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Experience Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Type</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {typeLabels[experience.type.name as keyof typeof typeLabels] || experience.type.name}
                  </Badge>
                </div>
              </div>

              {experience.metadata?.platform && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Platform</label>
                  <p className="text-sm">{experience.metadata.platform}</p>
                </div>
              )}

              {experience.metadata?.urgency_level && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Urgency Level</label>
                  <Badge className={urgencyColors[experience.metadata.urgency_level as keyof typeof urgencyColors]}>
                    {experience.metadata.urgency_level.toUpperCase()}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Created</label>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(experience.created_at)}
                </div>
              </div>

              {experience.metadata?.author_name && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Author</label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {experience.metadata.author_name}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Experience ID</label>
                <p className="text-sm font-mono text-gray-600">{experience.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Experience Preview</CardTitle>
              <CardDescription>
                See how this experience appears to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DigitalExperiencePreview experience={previewData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
