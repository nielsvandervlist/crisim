"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { DigitalExperiencePreview } from "@/components/digital-experiences/experience-preview"
import { createStandaloneDigitalExperience } from "@/lib/actions"

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

export default function CreateDigitalExperiencePage() {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "",
    platform: "",
    author_name: "",
    urgency_level: "medium",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateSampleContent = () => {
    const samples = {
      social_media: "Just heard about the incident at our main facility. Is everyone safe? #concerned #safety",
      news: "A significant incident has occurred at the company's main facility, prompting an immediate response from emergency services and company officials.",
      email: "Subject: Urgent - Incident Response Required\n\nTeam,\n\nWe have a developing situation that requires immediate attention. Please review the attached protocols and prepare for emergency response procedures.\n\nRegards,\nIncident Commander",
      video: "BREAKING: Major incident reported at corporate headquarters. Emergency services on scene. More details to follow.",
      phone_call: "This is Sarah from Channel 7 News. We're hearing reports about an incident at your facility. Can you provide a statement?",
      document: "INCIDENT REPORT #2024-001\n\nTime: [CURRENT TIME]\nLocation: Main Facility\nSeverity: High\nStatus: Active Response\n\nInitial assessment indicates immediate action required.",
      sms: "ALERT: Incident at main facility. All staff please evacuate immediately. Emergency services responding.",
      press_release: "FOR IMMEDIATE RELEASE\n\nCompany Name Responds to Facility Incident\n\n[City, Date] - Our company is currently responding to an incident at our main facility. The safety of our employees and the community is our top priority. We are working closely with emergency services and will provide updates as information becomes available.",
    }

    const sample = samples[formData.type as keyof typeof samples]
    if (sample) {
      handleInputChange("content", sample)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.type || !formData.content) {
      alert("Please fill in the required fields: Experience Type and Content")
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("typeId", formData.type)
      formDataToSend.append("platform", formData.platform)
      formDataToSend.append("authorName", formData.author_name)
      formDataToSend.append("urgencyLevel", formData.urgency_level)

      const result = await createStandaloneDigitalExperience(null, formDataToSend)
      
      if (result?.error) {
        alert(`Error: ${result.error}`)
        return
      }

      // Redirect to the main experiences page
      router.push("/dashboard/digital-experiences")
    } catch (error) {
      console.error("Error creating experience:", error)
      alert("Failed to create experience")
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/digital-experiences">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiences
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Digital Experience</h1>
          <p className="text-gray-600 mt-1">
            Create a new digital experience with live preview
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
                Fill in the details for your new digital experience. Fields marked with <span className="text-red-500">*</span> are required.
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
                      <SelectValue placeholder="Select experience type" />
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSampleContent}
                    className="mt-2"
                  >
                    Generate Sample Content
                  </Button>
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

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  Create Experience
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
