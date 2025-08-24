"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Zap } from "lucide-react"
import { createStandaloneDigitalExperience } from "@/lib/actions"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700">
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

export function CreateDigitalExperienceForm() {
  const [state, formAction] = useActionState(createStandaloneDigitalExperience, null)
  const [experienceType, setExperienceType] = useState("")
  const [platform, setPlatform] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [urgencyLevel, setUrgencyLevel] = useState("medium")

  const availablePlatforms = experienceType ? platformOptions[experienceType as keyof typeof platformOptions] || [] : []

  const generateSampleContent = () => {
    const samples = {
      social_media: "Just heard about the incident at our main facility. Is everyone safe? #concerned #safety",
      news:
        "A significant incident has occurred at the company's main facility, prompting an immediate response from emergency services and company officials.",
      email:
        "Subject: Urgent - Incident Response Required\n\nTeam,\n\nWe have a developing situation that requires immediate attention. Please review the attached protocols and prepare for emergency response procedures.\n\nRegards,\nIncident Commander",
      video:
        "BREAKING: Major incident reported at corporate headquarters. Emergency services on scene. More details to follow.",
      phone_call:
        "This is Sarah from Channel 7 News. We're hearing reports about an incident at your facility. Can you provide a statement?",
      document:
        "INCIDENT REPORT #2024-001\n\nTime: [CURRENT TIME]\nLocation: Main Facility\nSeverity: High\nStatus: Active Response\n\nInitial assessment indicates immediate action required.",
      sms:
        "ALERT: Incident at main facility. All staff please evacuate immediately. Emergency services responding.",
      press_release:
        "FOR IMMEDIATE RELEASE\n\nCompany Name Responds to Facility Incident\n\n[City, Date] - Our company is currently responding to an incident at our main facility. The safety of our employees and the community is our top priority. We are working closely with emergency services and will provide updates as information becomes available.",
    }

    const sample = samples[experienceType as keyof typeof samples]
    if (sample) {
      setContent(sample)
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
          {state.success}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Type *
          </label>
          <Select
            name="typeId"
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
          <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700 mb-1">
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

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            Author/Source Name
          </label>
          <Input
            id="authorName"
            name="authorName"
            type="text"
            placeholder="e.g., @AngryCustomer, John Reporter"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full"
          />
        </div>

        {(experienceType === "news" ||
          experienceType === "video" ||
          experienceType === "document" ||
          experienceType === "press_release") && (
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            {experienceType && (
              <Button type="button" variant="outline" size="sm" onClick={generateSampleContent}>
                <Zap className="mr-1 h-3 w-3" />
                Sample
              </Button>
            )}
          </div>
          <Textarea
            id="content"
            name="content"
            rows={4}
            placeholder="Enter the content that will appear during training..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Hidden fields for additional metadata */}
        <input type="hidden" name="platform" value={platform} />
        <input type="hidden" name="authorName" value={authorName} />
        <input type="hidden" name="urgencyLevel" value={urgencyLevel} />
      </div>

      <SubmitButton />
    </form>
  )
}
