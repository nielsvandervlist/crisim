"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Twitter,
  Newspaper,
  Mail,
  Globe,
  FileText,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import { DigitalExperiencePreview } from "./experience-preview"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ExperienceListProps {
  experiences: Array<{
    id: string
    type: string
    platform?: string
    title?: string
    content: string
    author_name?: string
    timestamp_offset: number
    created_at: string
  }>
  canEdit?: boolean
}

export function ExperienceList({ experiences, canEdit = false }: ExperienceListProps) {
  const [previewExperience, setPreviewExperience] = useState<any>(null)
  const router = useRouter()

  const getIcon = (type: string, platform?: string) => {
    if (platform === "Twitter") return <Twitter className="h-4 w-4 text-blue-400" />
    if (platform === "Facebook") return <Twitter className="h-4 w-4 text-blue-600" />

    switch (type) {
      case "social_media":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "news":
        return <Newspaper className="h-4 w-4 text-red-600" />
      case "email":
        return <Mail className="h-4 w-4 text-gray-600" />
      case "video":
        return <Globe className="h-4 w-4 text-green-600" />
      case "document":
        return <FileText className="h-4 w-4 text-purple-600" />
      case "phone_call":
        return <MessageCircle className="h-4 w-4 text-orange-500" />
      case "sms":
        return <MessageCircle className="h-4 w-4 text-green-500" />
      case "press_release":
        return <FileText className="h-4 w-4 text-blue-600" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "social_media":
        return "bg-blue-100 text-blue-800"
      case "news":
        return "bg-red-100 text-red-800"
      case "email":
        return "bg-gray-100 text-gray-800"
      case "video":
        return "bg-green-100 text-green-800"
      case "document":
        return "bg-purple-100 text-purple-800"
      case "phone_call":
        return "bg-orange-100 text-orange-800"
      case "sms":
        return "bg-green-100 text-green-800"
      case "press_release":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No digital experiences</h3>
        <p className="mt-1 text-sm text-gray-500">Add some digital content to make your scenario more realistic.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {experiences
          .sort((a, b) => a.timestamp_offset - b.timestamp_offset)
          .map((experience) => (
            <Card key={experience.id} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getIcon(experience.type, experience.platform)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(experience.type)}>{experience.type.replace("_", " ")}</Badge>
                        {experience.platform && <Badge variant="outline">{experience.platform}</Badge>}
                      </div>
                      {experience.title && <CardTitle className="text-base mt-1">{experience.title}</CardTitle>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      +{experience.timestamp_offset} min
                    </Badge>
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewExperience(experience)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/digital-experiences/${experience.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 line-clamp-3 mb-2">{experience.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {experience.author_name && <span>By: {experience.author_name}</span>}
                  <span>{new Date(experience.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Preview Modal */}
      {previewExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Experience Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewExperience(null)}>
                ×
              </Button>
            </div>
            <div className="flex justify-center">
              <DigitalExperiencePreview experience={previewExperience} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
