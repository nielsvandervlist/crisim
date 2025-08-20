"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, AlertTriangle, Users, Clock, Send } from "lucide-react"
import { DigitalExperiencePreview } from "@/components/digital-experiences/experience-preview"

interface TrainingInterfaceProps {
  session: any
  userProfile: any
  isTrainer: boolean
  participantRole?: string
}

export function TrainingInterface({ session, userProfile, isTrainer, participantRole }: TrainingInterfaceProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [activeExperiences, setActiveExperiences] = useState<any[]>([])
  const [sessionTime, setSessionTime] = useState(0)

  // Simulate session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Simulate digital experiences appearing over time
  useEffect(() => {
    if (session.scenario?.digital_experiences) {
      const experiences = session.scenario.digital_experiences || []

      experiences.forEach((exp: any) => {
        const timeoutMs = exp.timestamp_offset * 60 * 1000 // Convert minutes to milliseconds

        setTimeout(() => {
          setActiveExperiences((prev) => [...prev, exp])
        }, timeoutMs)
      })
    }
  }, [session])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendResponse = () => {
    if (!newResponse.trim()) return

    const response = {
      id: Date.now(),
      content: newResponse,
      author: userProfile.full_name || userProfile.email,
      role: participantRole || userProfile.role,
      timestamp: new Date(),
      type: "message",
    }

    setResponses((prev) => [...prev, response])
    setNewResponse("")
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Left Panel - Digital Experiences */}
      <div className="w-1/2 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            Crisis Updates
          </h2>
          <p className="text-sm text-gray-600 mt-1">Monitor incoming information and updates</p>
        </div>

        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {activeExperiences.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Waiting for crisis updates...</p>
                <p className="text-xs text-gray-500 mt-1">Session time: {formatTime(sessionTime)}</p>
              </div>
            ) : (
              activeExperiences
                .sort((a, b) => a.timestamp_offset - b.timestamp_offset)
                .map((experience) => (
                  <div key={experience.id} className="flex justify-center">
                    <DigitalExperiencePreview experience={experience} />
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Team Communication */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-500" />
            Team Communication
          </h2>
          <p className="text-sm text-gray-600 mt-1">Coordinate your crisis response with the team</p>
        </div>

        <Tabs defaultValue="responses" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="responses">Team Chat</TabsTrigger>
            <TabsTrigger value="actions">Actions Log</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="flex-1 flex flex-col m-4 mt-2">
            {/* Messages Area */}
            <ScrollArea className="flex-1 border rounded-lg bg-white p-4 mb-4">
              <div className="space-y-3">
                {responses.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  responses.map((response) => (
                    <div key={response.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-900">{response.author}</span>
                          <Badge variant="secondary" className="text-xs">
                            {response.role}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">{response.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.content}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="space-y-2">
              <Textarea
                placeholder={`Share your thoughts as ${participantRole || userProfile.role}...`}
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendResponse()
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</span>
                <Button onClick={handleSendResponse} disabled={!newResponse.trim()} size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 m-4 mt-2">
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Action log will appear here as the training progresses</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
