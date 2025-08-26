"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Twitter,
  Facebook,
  Newspaper,
  Mail,
  Globe,
  FileText,
  MessageCircle,
  Heart,
  Repeat2,
  Share,
  Phone,
  AlertTriangle,
  TrendingUp,
  Eye,
  ThumbsUp,
} from "lucide-react"
import { useState } from "react"

interface ExperiencePreviewProps {
  experience: {
    type: string
    platform?: string
    title?: string
    content: string
    author_name?: string
    timestamp_offset: number
    urgency_level?: string
    engagement_metrics?: {
      likes?: number
      shares?: number
      comments?: number
      views?: number
    }
  }
}

export function DigitalExperiencePreview({ experience }: ExperiencePreviewProps) {
  const [userInteracted, setUserInteracted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)

  const getIcon = (type: string, platform?: string) => {
    if (platform === "Twitter") return <Twitter className="h-4 w-4 text-blue-400" />
    if (platform === "Facebook") return <Facebook className="h-4 w-4 text-blue-600" />

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
        return <Phone className="h-4 w-4 text-orange-600" />
      case "sms":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "press_release":
        return <FileText className="h-4 w-4 text-red-600" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getUrgencyBadge = (urgency?: string) => {
    if (!urgency) return null

    const urgencyColors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={urgencyColors[urgency as keyof typeof urgencyColors] || "bg-gray-100 text-gray-800"}>
        {urgency.toUpperCase()}
      </Badge>
    )
  }

  const formatEngagementNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const renderSocialMediaPost = () => {
    const metrics = experience.engagement_metrics || { likes: 24, shares: 8, comments: 12 }

    return (
      <div className="bg-white border rounded-lg p-4 max-w-md shadow-sm">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
              {experience.author_name ? experience.author_name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{experience.author_name || "User"}</span>
                <span className="text-gray-500 text-sm">
                  @{experience.author_name?.toLowerCase().replace(/\s+/g, "") || "user"}
                </span>
                <span className="text-gray-500 text-sm">·</span>
                <span className="text-gray-500 text-sm">now</span>
              </div>
              {getUrgencyBadge(experience.urgency_level)}
            </div>
            <p className="text-sm mt-2 text-gray-900 leading-relaxed">{experience.content}</p>

            {/* Engagement Actions */}
            <div className="flex items-center justify-between mt-4 max-w-md">
              <button
                className={`flex items-center space-x-1 ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"} cursor-pointer transition-colors`}
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                <span className="text-sm">{formatEngagementNumber(metrics.likes + (liked ? 1 : 0))}</span>
              </button>
              <button
                className={`flex items-center space-x-1 ${shared ? "text-green-500" : "text-gray-500 hover:text-green-500"} cursor-pointer transition-colors`}
                onClick={() => setShared(!shared)}
              >
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">{formatEngagementNumber(metrics.shares + (shared ? 1 : 0))}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{formatEngagementNumber(metrics.comments)}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer">
                <Share className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }



  const renderNewsArticle = () => {
    const metrics = experience.engagement_metrics || { views: 1247, shares: 89 }

    return (
      <div className="bg-white border rounded-lg overflow-hidden max-w-lg shadow-sm">
        <div className="bg-red-600 text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4" />
              <span className="font-semibold text-sm">{experience.platform || "Breaking News"}</span>
            </div>
            {getUrgencyBadge(experience.urgency_level)}
          </div>
        </div>
        <div className="p-4">
          {experience.title && (
            <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">{experience.title}</h3>
          )}
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{experience.content}</p>

          {/* Article Metrics */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{formatEngagementNumber(metrics.views)} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share className="h-3 w-3" />
                <span>{formatEngagementNumber(metrics.shares)} shares</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3" />
              <span>Trending</span>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By {experience.author_name || "Staff Reporter"}</span>
              <span>Just now</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderEmail = () => (
    <div className="bg-white border rounded-lg overflow-hidden max-w-lg shadow-sm">
      <div className="bg-gray-100 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-600" />
            <span className="font-semibold text-sm text-gray-900">{experience.platform || "Email"}</span>
          </div>
          {getUrgencyBadge(experience.urgency_level)}
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 font-medium">From:</span>
            <span className="text-gray-900">{experience.author_name || "sender@company.com"}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 font-medium">To:</span>
            <span className="text-gray-900">crisis-team@company.com</span>
          </div>
          {experience.title && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 font-medium">Subject:</span>
              <span className="text-gray-900 font-semibold">{experience.title}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 font-medium">Priority:</span>
            <Badge
              className={
                experience.urgency_level === "critical" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
              }
            >
              {experience.urgency_level || "Normal"}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{experience.content}</div>

        {/* Email Actions */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
          <Button size="sm" variant="outline" className="text-xs bg-transparent">
            Reply
          </Button>
          <Button size="sm" variant="outline" className="text-xs bg-transparent">
            Forward
          </Button>
          <Button size="sm" variant="outline" className="text-xs bg-transparent">
            Archive
          </Button>
        </div>
      </div>
    </div>
  )

  const renderPhoneCall = () => (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 max-w-md shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-green-600 p-3 rounded-full animate-pulse">
          <Phone className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-green-900">Incoming Call</span>
            {getUrgencyBadge(experience.urgency_level)}
          </div>
          <p className="text-green-800 font-medium">{experience.author_name || "Unknown Caller"}</p>
          <p className="text-sm text-green-700 mt-1">{experience.content}</p>

          <div className="flex items-center space-x-2 mt-3">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Answer
            </Button>
            <Button size="sm" variant="outline" className="text-xs bg-transparent">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderVideo = () => (
    <div className="bg-white border rounded-lg overflow-hidden max-w-lg shadow-sm">
      <div className="bg-red-600 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="font-semibold text-sm">{experience.platform || "Video Content"}</span>
          </div>
          {getUrgencyBadge(experience.urgency_level)}
        </div>
      </div>
      <div className="p-4">
        {experience.title && <h3 className="font-bold text-xl text-gray-900 mb-3">{experience.title}</h3>}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{experience.content}</div>
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Published by {experience.author_name || "Admin"} • Just now</div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </Button>
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocument = () => (
    <div className="bg-white border rounded-lg overflow-hidden max-w-lg shadow-sm">
      <div className="bg-purple-600 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="font-semibold text-sm">{experience.platform || "Internal Document"}</span>
          </div>
          {getUrgencyBadge(experience.urgency_level)}
        </div>
      </div>
      <div className="p-4">
        {experience.title && <h3 className="font-bold text-lg text-gray-900 mb-3 text-center">{experience.title}</h3>}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border">
          {experience.content}
        </div>
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Author: {experience.author_name || "System"}</span>
            <div className="flex items-center space-x-2">
              <span>Classification: Internal</span>
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDefault = () => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="text-gray-400 mb-2">{getIcon(experience.type, experience.platform)}</div>
      <p className="text-sm text-gray-600">{experience.content || "Enter content to see preview"}</p>
    </div>
  )

  if (!experience.content) {
    return renderDefault()
  }

  switch (experience.type) {
    case "social_media":
      return renderSocialMediaPost()
    case "news":
      return renderNewsArticle()
    case "email":
      return renderEmail()
    case "video":
      return renderVideo()
    case "phone_call":
      return renderPhoneCall()
    case "document":
      return renderDocument()
    case "sms":
      return renderSocialMediaPost()
    case "press_release":
      return renderDocument()
    default:
      return renderDefault()
  }
}
