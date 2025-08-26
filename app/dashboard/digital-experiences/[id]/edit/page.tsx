"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react"
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

const experienceTypes = [
  { value: "social_media", label: "Social Media Post" },
  { value: "news", label: "News Article" },
  { value: "email", label: "Email" },
  { value: "video", label: "Video Content" },
  { value: "phone_call", label: "Phone Call" },
  { value: "document", label: "Document" },
  { value: "sms", label: "Text Message" },
  { value: "press_release", label: "Press Release" },
]

const platformOptions = {
  social_media: ["Twitter", "Facebook", "LinkedIn", "Instagram", "Reddit"],
  news: ["CNN", "BBC", "Reuters", "TechCrunch", "Local News", "Industry Publication"],
  email: ["Internal Email", "Customer Email", "Press Inquiry", "Vendor Communication"],
  video: ["YouTube", "CNN Live", "BBC News", "Local TV", "Company Channel"],
  phone_call: ["Customer Call", "Media Inquiry", "Executive Call", "Emergency Contact"],
  document: ["Internal Memo", "Press Release", "Legal Document", "Technical Report"],
  sms: ["Company Alert", "Emergency SMS", "Customer Service", "Internal Communication"],
  press_release: ["Company PR", "Government PR", "Industry PR", "Emergency PR"],
}

const urgencyLevels = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "critical", label: "Critical/Urgent" },
]

export default function EditDigitalExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "",
    platform: "",
    author_name: "",
    urgency_level: "medium",
  })

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
        .is("scenario_id", null)
        .single()

      if (error) {
        throw error
      }

      // Set form data
      setFormData({
        title: data.title || "",
        content: data.content,
        type: data.type.name,
        platform: data.metadata?.platform || "",
        author_name: data.metadata?.author_name || "",
        urgency_level: data.metadata?.urgency_level || "medium",
      })

      setLoading(false)
    } catch (err) {
      console.error("Error fetching experience:", err)
      setError("Failed to load digital experience")
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.type || !formData.content) {
      alert("Please fill in the required fields: Experience Type and Content")
      return
    }
    
    setSaving(true)

    try {
      // Update the experience
      const { error } = await supabase
        .from("digital_experiences")
        .update({
          title: formData.title || null,
          content: formData.content,
          metadata: {
            platform: formData.platform || null,
            author_name: formData.author_name || null,
            urgency_level: formData.urgency_level,
          },
        })
        .eq("id", params.id)
        .is("scenario_id", null)

      if (error) {
        throw error
      }

      // Redirect to the experience view page
      router.push(`/dashboard/digital-experiences/${params.id}`)
    } catch (err) {
      console.error("Error updating experience:", err)
      alert("Failed to update experience")
    } finally {
      setSaving(false)
    }
  }

  const availablePlatforms = formData.type ? platformOptions[formData.type as keyof typeof platformOptions] || [] : []

  // Create preview data for the preview component
  const previewData = {
    type: formData.type,
    platform: formData.platform,
    title: formData.title,
    content: formData.content,
    author_name: formData.author_name,
    urgency_level: formData.urgency_level,
    timestamp_offset: 0,
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

  if (error) {
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
              <div className="text-red-500 mb-4">Error: {error}</div>
              <Link href="/dashboard/digital-experiences">
                <Button>Back to Experiences</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/digital-experiences/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experience
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Digital Experience</h1>
          <p className="text-gray-600 mt-1">
            Update the details of your digital experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Experience Details</CardTitle>
              <CardDescription>
                Update the details for your digital experience. Fields marked with <span className="text-red-500">*</span> are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Experience Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.type && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlatforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter title (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Enter the content for your experience"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Author Name</label>
                  <Input
                    value={formData.author_name}
                    onChange={(e) => handleInputChange("author_name", e.target.value)}
                    placeholder="Enter author name (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgency Level</label>
                  <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange("urgency_level", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>

          {showPreview && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>
                  See how your experience will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.content ? (
                  <DigitalExperiencePreview experience={previewData} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Start typing to see a preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
