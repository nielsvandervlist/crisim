"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Eye, Zap } from "lucide-react"
import { createDigitalExperience } from "@/lib/actions"
import { useState } from "react"
import { DigitalExperiencePreview } from "./experience-preview"

interface ExperienceFormProps {
  scenarioId: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Create Experience
        </>
      )}
    </Button>
  )
}

const experienceTypes = [
  { value: "social_media", label: "Social Media Post" },
  { value: "breaking_news", label: "Breaking News Alert" },
  { value: "news_article", label: "News Article" },
  { value: "email", label: "Email" },
  { value: "phone_call", label: "Phone Call" },
  { value: "website", label: "Website Update" },
  { value: "document", label: "Internal Document" },
]

const platformOptions = {
  social_media: ["Twitter", "Facebook", "LinkedIn", "Instagram", "Reddit"],
  breaking_news: ["CNN Breaking", "BBC Alert", "Reuters Flash", "Emergency Alert"],
  news_article: ["CNN", "BBC", "Reuters", "TechCrunch", "Local News", "Industry Publication"],
  email: ["Internal Email", "Customer Email", "Press Inquiry", "Vendor Communication"],
  phone_call: ["Customer Call", "Media Inquiry", "Executive Call", "Emergency Contact"],
  website: ["Company Website", "Government Site", "Industry Portal", "News Site"],
  document: ["Internal Memo", "Press Release", "Legal Document", "Technical Report"],
}

const urgencyLevels = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "critical", label: "Critical/Urgent" },
]

export function ExperienceForm({ scenarioId }: ExperienceFormProps) {
  const [state, formAction] = useActionState(createDigitalExperience, null)
  const [experienceType, setExperienceType] = useState("")
  const [platform, setPlatform] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [timestampOffset, setTimestampOffset] = useState("0")
  const [urgencyLevel, setUrgencyLevel] = useState("medium")
  const [showPreview, setShowPreview] = useState(false)

  const availablePlatforms = experienceType ? platformOptions[experienceType as keyof typeof platformOptions] || [] : []

  const previewData = {
    type: experienceType,
    platform,
    title,
    content,
    author_name: authorName,
    timestamp_offset: Number.parseInt(timestampOffset) || 0,
    urgency_level: urgencyLevel,
    engagement_metrics: {
      likes: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5,
      comments: Math.floor(Math.random() * 30) + 2,
      views: Math.floor(Math.random() * 1000) + 100,
    },
  }

  const generateSampleContent = () => {
    const samples = {
      social_media: "Just heard about the incident at our main facility. Is everyone safe? #concerned #safety",
      breaking_news:
        "BREAKING: Major incident reported at corporate headquarters. Emergency services on scene. More details to follow.",
      news_article:
        "A significant incident has occurred at the company's main facility, prompting an immediate response from emergency services and company officials.",
      email:
        "Subject: Urgent - Incident Response Required\n\nTeam,\n\nWe have a developing situation that requires immediate attention. Please review the attached protocols and prepare for emergency response procedures.\n\nRegards,\nIncident Commander",
      phone_call:
        "This is Sarah from Channel 7 News. We're hearing reports about an incident at your facility. Can you provide a statement?",
      website:
        "Due to an ongoing incident, our main facility is temporarily closed. We are working with authorities to resolve the situation. Updates will be provided as they become available.",
      document:
        "INCIDENT REPORT #2024-001\n\nTime: [CURRENT TIME]\nLocation: Main Facility\nSeverity: High\nStatus: Active Response\n\nInitial assessment indicates immediate action required.",
    }

    const sample = samples[experienceType as keyof typeof samples]
    if (sample) {
      setContent(sample)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Digital Experience</CardTitle>
          <CardDescription>Add realistic digital content that will appear during the training session</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="scenarioId" value={scenarioId} />

            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {state.success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Type *
                </label>
                <Select
                  name="type"
                  value={experienceType}
                  onValueChange={(value) => {
                    setExperienceType(value)
                    setPlatform("")
                    setContent("")
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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

              <div>
                <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <Select name="urgencyLevel" value={urgencyLevel} onValueChange={setUrgencyLevel} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <Select name="platform" value={platform} onValueChange={setPlatform} disabled={!experienceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((platformOption) => (
                      <SelectItem key={platformOption} value={platformOption}>
                        {platformOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="timestampOffset" className="block text-sm font-medium text-gray-700 mb-2">
                  Appears After (minutes) *
                </label>
                <Input
                  id="timestampOffset"
                  name="timestampOffset"
                  type="number"
                  min="0"
                  max="480"
                  placeholder="0"
                  value={timestampOffset}
                  onChange={(e) => setTimestampOffset(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                Author/Source Name
              </label>
              <Input
                id="authorName"
                name="authorName"
                type="text"
                placeholder="e.g., @AngryCustomer, John Reporter, Sarah Johnson"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full"
              />
            </div>

            {(experienceType === "news_article" ||
              experienceType === "breaking_news" ||
              experienceType === "website" ||
              experienceType === "document") && (
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title/Headline
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter headline or title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                {experienceType && (
                  <Button type="button" variant="outline" size="sm" onClick={generateSampleContent}>
                    <Zap className="mr-1 h-3 w-3" />
                    Generate Sample
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                name="content"
                rows={6}
                placeholder="Enter the content that will appear during the training..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>How this will appear to participants during training</CardDescription>
          </CardHeader>
          <CardContent>
            <DigitalExperiencePreview experience={previewData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
