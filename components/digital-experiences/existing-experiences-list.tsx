"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Eye, Clock, AlertTriangle, Edit } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { DigitalExperiencePreview } from "./experience-preview"

interface DigitalExperience {
  id: string
  title: string | null
  content: string
  type_id: string
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

interface ExistingExperiencesListProps {
  scenarioId: string
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

export function ExistingExperiencesList({ scenarioId }: ExistingExperiencesListProps) {
  const router = useRouter()
  const [experiences, setExperiences] = useState<DigitalExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedExperience, setSelectedExperience] = useState<DigitalExperience | null>(null)

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

      // Transform the data to match our interface
      const transformedData = (data || []).map((exp: any) => ({
        ...exp,
        type: { 
          name: exp.type?.[0]?.name || exp.type?.name || getTypeName(exp.type_id) 
        }
      }))

      setExperiences(transformedData)
    } catch (err) {
      console.error("Error fetching experiences:", err)
      setError("Failed to load digital experiences")
    } finally {
      setLoading(false)
    }
  }

  const getTypeName = (typeId: string) => {
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

  const addExperienceToScenario = async (experienceId: string) => {
    try {
      // Get the experience details
      const experience = experiences.find(exp => exp.id === experienceId)
      if (!experience) return

      // Add the experience to the scenario
      const { error } = await supabase
        .from("digital_experiences")
        .insert({
          scenario_id: scenarioId,
          type_id: experience.type_id,
          title: experience.title,
          content: experience.content,
          trigger_time: 0, // Default trigger time
          metadata: experience.metadata,
          created_by: experience.created_by,
        })

      if (error) {
        throw error
      }

      // Redirect back to the scenario
      router.push(`/dashboard/scenarios/${scenarioId}`)
    } catch (err) {
      console.error("Error adding experience to scenario:", err)
      alert("Failed to add experience to scenario")
    }
  }

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = searchTerm === "" || 
      exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.metadata?.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "" || exp.type.name === selectedType
    
    return matchesSearch && matchesType
  })

  const availableTypes = Array.from(new Set(experiences.map(exp => exp.type.name)))

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
        <div className="text-gray-500 mb-4">No standalone experiences available</div>
        <p className="text-sm text-gray-400">
          Create some experiences first, then come back to add them to scenarios
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {typeLabels[type as keyof typeof typeLabels] || type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Experiences List */}
      <div className="space-y-4">
        {filteredExperiences.map((experience) => (
          <Card key={experience.id} className="group hover:shadow-lg transition-all duration-200">
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExperience(selectedExperience?.id === experience.id ? null : experience)}
                    className={`h-8 w-8 p-0 ${
                      selectedExperience?.id === experience.id 
                        ? "bg-blue-50 text-blue-600" 
                        : "hover:bg-blue-50 hover:text-blue-600"
                    }`}
                    title={selectedExperience?.id === experience.id ? "Hide Preview" : "Show Preview"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Link href={`/dashboard/digital-experiences/${experience.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 z-20 relative"
                      title="Edit Experience"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    onClick={() => addExperienceToScenario(experience.id)}
                    className="bg-blue-600 hover:bg-blue-700 h-8 px-3"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                {experience.content}
              </div>
              
              {/* Preview Section */}
              {selectedExperience?.id === experience.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Preview:</h4>
                  <DigitalExperiencePreview 
                    experience={{
                      type: experience.type.name,
                      platform: experience.metadata?.platform || undefined,
                      title: experience.title || undefined,
                      content: experience.content,
                      author_name: experience.metadata?.author_name || undefined,
                      urgency_level: experience.metadata?.urgency_level || undefined,
                      timestamp_offset: 0,
                    }} 
                  />
                </div>
              )}
              
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
          </Card>
        ))}
      </div>

      {filteredExperiences.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No experiences match your search criteria</div>
          <Button onClick={() => { setSearchTerm(""); setSelectedType(""); }} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
