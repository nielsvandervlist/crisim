"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Play, Pause, SkipForward, AlertTriangle } from "lucide-react"
import { DigitalExperiencePreview } from "./experience-preview"

interface ExperienceTimelineProps {
  experiences: any[]
  isTrainer?: boolean
  sessionDuration: number
  onTriggerExperience?: (experienceId: string) => void
}

export function ExperienceTimeline({
  experiences,
  isTrainer = false,
  sessionDuration,
  onTriggerExperience,
}: ExperienceTimelineProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [triggeredExperiences, setTriggeredExperiences] = useState<Set<string>>(new Set())

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= sessionDuration * 60) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, sessionDuration])

  // Auto-trigger experiences based on time
  useEffect(() => {
    experiences.forEach((exp) => {
      const triggerTime = exp.timestamp_offset * 60 // Convert minutes to seconds
      if (currentTime >= triggerTime && !triggeredExperiences.has(exp.id)) {
        setTriggeredExperiences((prev) => new Set([...prev, exp.id]))
        if (onTriggerExperience) {
          onTriggerExperience(exp.id)
        }
      }
    })
  }, [currentTime, experiences, triggeredExperiences, onTriggerExperience])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimelinePosition = (timestampOffset: number) => {
    const totalSeconds = sessionDuration * 60
    const experienceSeconds = timestampOffset * 60
    return (experienceSeconds / totalSeconds) * 100
  }

  const getCurrentPosition = () => {
    const totalSeconds = sessionDuration * 60
    return (currentTime / totalSeconds) * 100
  }

  const sortedExperiences = [...experiences].sort((a, b) => a.timestamp_offset - b.timestamp_offset)
  const activeExperiences = sortedExperiences.filter((exp) => triggeredExperiences.has(exp.id))

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      {isTrainer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Training Timeline
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentTime((prev) => Math.min(prev + 60, sessionDuration * 60))}
                >
                  <SkipForward className="h-4 w-4" />
                  +1 min
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Time Display */}
              <div className="flex items-center justify-between text-sm">
                <span>Current Time: {formatTime(currentTime)}</span>
                <span>Duration: {formatTime(sessionDuration * 60)}</span>
              </div>

              {/* Timeline Bar */}
              <div className="relative">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${getCurrentPosition()}%` }}
                  />
                </div>

                {/* Experience Markers */}
                {sortedExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="absolute top-0 transform -translate-x-1/2"
                    style={{ left: `${getTimelinePosition(exp.timestamp_offset)}%` }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        triggeredExperiences.has(exp.id) ? "bg-green-500 border-green-600" : "bg-white border-gray-400"
                      }`}
                      title={`${exp.type} at ${exp.timestamp_offset}min`}
                    />
                  </div>
                ))}
              </div>

              {/* Experience List */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Scheduled Experiences:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sortedExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className={`flex items-center justify-between p-2 border rounded text-sm ${
                        triggeredExperiences.has(exp.id) ? "bg-green-50 border-green-200" : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <span className="font-medium">{exp.type.replace("_", " ")}</span>
                        <span className="text-gray-500 ml-2">@ {exp.timestamp_offset}min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {exp.urgency_level === "critical" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        {isTrainer && !triggeredExperiences.has(exp.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-transparent"
                            onClick={() => {
                              setTriggeredExperiences((prev) => new Set([...prev, exp.id]))
                              if (onTriggerExperience) {
                                onTriggerExperience(exp.id)
                              }
                            }}
                          >
                            Trigger Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Experiences Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            Live Crisis Feed
            {activeExperiences.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">{activeExperiences.length} active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {activeExperiences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p>Monitoring for crisis updates...</p>
                  <p className="text-sm mt-1">Session time: {formatTime(currentTime)}</p>
                </div>
              ) : (
                activeExperiences
                  .sort((a, b) => b.timestamp_offset - a.timestamp_offset) // Most recent first
                  .map((experience) => (
                    <div key={experience.id} className="animate-in slide-in-from-top duration-500">
                      <DigitalExperiencePreview experience={experience} />
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
