"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, MessageSquare, Clock, TrendingUp, AlertTriangle, CheckCircle, Activity, BarChart3 } from "lucide-react"

interface RealTimeDashboardProps {
  sessionId: string
  isTrainer: boolean
  participants: any[]
  sessionData: any
}

export function RealTimeDashboard({ sessionId, isTrainer, participants, sessionData }: RealTimeDashboardProps) {
  const [liveMetrics, setLiveMetrics] = useState({
    activeParticipants: 0,
    totalMessages: 0,
    averageResponseTime: 0,
    completionRate: 0,
    engagementScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [participantStatus, setParticipantStatus] = useState<Record<string, any>>({})

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live metrics updates
      setLiveMetrics((prev) => ({
        activeParticipants: Math.min(participants.length, prev.activeParticipants + Math.floor(Math.random() * 2)),
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 3),
        averageResponseTime: Math.max(30, prev.averageResponseTime + (Math.random() - 0.5) * 10),
        completionRate: Math.min(100, prev.completionRate + Math.random() * 2),
        engagementScore: Math.min(100, Math.max(0, prev.engagementScore + (Math.random() - 0.5) * 5)),
      }))

      // Simulate recent activity
      const activities = [
        "Participant joined the session",
        "New crisis update posted",
        "Team decision recorded",
        "Communication sent to stakeholders",
        "Action item completed",
      ]

      if (Math.random() > 0.7) {
        setRecentActivity((prev) => [
          {
            id: Date.now(),
            action: activities[Math.floor(Math.random() * activities.length)],
            participant:
              participants[Math.floor(Math.random() * participants.length)]?.participant?.full_name || "System",
            timestamp: new Date(),
            type: Math.random() > 0.5 ? "action" : "communication",
          },
          ...prev.slice(0, 9),
        ])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [participants])

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "idle":
        return "bg-yellow-100 text-yellow-800"
      case "disconnected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold">{liveMetrics.activeParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{liveMetrics.totalMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{Math.round(liveMetrics.averageResponseTime)}s</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold">{Math.round(liveMetrics.completionRate)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className={`text-2xl font-bold ${getEngagementColor(liveMetrics.engagementScore)}`}>
                  {Math.round(liveMetrics.engagementScore)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Participant Status
              </CardTitle>
              <CardDescription>Real-time participant engagement and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium">{participant.participant?.full_name}</p>
                        <p className="text-sm text-gray-600">Role: {participant.assigned_role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor("active")}>Active</Badge>
                      <div className="text-right text-sm">
                        <p className="font-medium">{Math.floor(Math.random() * 15) + 5} actions</p>
                        <p className="text-gray-500">Last seen: now</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Live Activity Feed
              </CardTitle>
              <CardDescription>Real-time actions and communications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p>Waiting for activity...</p>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === "action" ? "bg-blue-500" : "bg-green-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-600">{activity.participant}</span>
                            <span className="text-xs text-gray-400">{activity.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Team Coordination</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Response Speed</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Decision Quality</span>
                    <span>91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Communication</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{Math.round(liveMetrics.completionRate)}%</div>
                    <p className="text-sm text-gray-600">Session Complete</p>
                  </div>
                  <Progress value={liveMetrics.completionRate} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">Time Elapsed</div>
                      <div className="text-gray-600">45 minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Remaining</div>
                      <div className="text-gray-600">15 minutes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Trainer Controls */}
      {isTrainer && (
        <Card>
          <CardHeader>
            <CardTitle>Trainer Controls</CardTitle>
            <CardDescription>Manage the training session in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Send Alert
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Broadcast Message
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Extend Time
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
