"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Clock, TrendingUp, Download, Share, Award, AlertTriangle } from "lucide-react"

interface SessionReportProps {
  sessionData: {
    id: string
    title: string
    scenario: any
    participants: any[]
    duration: number
    completedAt: string
    metrics: {
      overallScore: number
      teamCoordination: number
      responseSpeed: number
      decisionQuality: number
      communication: number
      participantScores: any[]
    }
  }
}

export function SessionReport({ sessionData }: SessionReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Satisfactory"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{sessionData.title}</CardTitle>
              <CardDescription className="mt-2">
                Scenario: {sessionData.scenario?.title} • Completed on{" "}
                {new Date(sessionData.completedAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share className="mr-2 h-4 w-4" />
                Share Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(sessionData.metrics.overallScore)}`}>
                {sessionData.metrics.overallScore}%
              </div>
              <p className="text-sm text-gray-600">Overall Score</p>
              <Badge className={getScoreBadge(sessionData.metrics.overallScore)} variant="secondary">
                {getPerformanceLevel(sessionData.metrics.overallScore)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessionData.participants.length}</div>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sessionData.duration}min</div>
              <p className="text-sm text-gray-600">Duration</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessionData.scenario?.crisis_type?.replace("_", " ")}
              </div>
              <p className="text-sm text-gray-600">Crisis Type</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Team Coordination</span>
                    <span className={getScoreColor(sessionData.metrics.teamCoordination)}>
                      {sessionData.metrics.teamCoordination}%
                    </span>
                  </div>
                  <Progress value={sessionData.metrics.teamCoordination} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Response Speed</span>
                    <span className={getScoreColor(sessionData.metrics.responseSpeed)}>
                      {sessionData.metrics.responseSpeed}%
                    </span>
                  </div>
                  <Progress value={sessionData.metrics.responseSpeed} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Decision Quality</span>
                    <span className={getScoreColor(sessionData.metrics.decisionQuality)}>
                      {sessionData.metrics.decisionQuality}%
                    </span>
                  </div>
                  <Progress value={sessionData.metrics.decisionQuality} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Communication</span>
                    <span className={getScoreColor(sessionData.metrics.communication)}>
                      {sessionData.metrics.communication}%
                    </span>
                  </div>
                  <Progress value={sessionData.metrics.communication} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Key Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Excellent Crisis Response</p>
                      <p className="text-sm text-green-700">Team responded to initial crisis within 2 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Strong Team Coordination</p>
                      <p className="text-sm text-blue-700">All participants actively engaged throughout</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Effective Communication</p>
                      <p className="text-sm text-purple-700">Clear stakeholder messaging maintained</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>Detailed breakdown of each participant's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessionData.metrics.participantScores.map((participant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{participant.name}</h4>
                        <p className="text-sm text-gray-600">Role: {participant.role}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(participant.score)}`}>
                          {participant.score}%
                        </div>
                        <Badge className={getScoreBadge(participant.score)} variant="secondary">
                          {getPerformanceLevel(participant.score)}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Actions:</span>
                        <span className="ml-1 font-medium">{participant.actions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Messages:</span>
                        <span className="ml-1 font-medium">{participant.messages}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Response Time:</span>
                        <span className="ml-1 font-medium">{participant.avgResponseTime}s</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Engagement:</span>
                        <span className="ml-1 font-medium">{participant.engagement}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Session Timeline
              </CardTitle>
              <CardDescription>Key events and milestones during the training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Session Started</p>
                    <p className="text-sm text-gray-600">00:00 - All participants joined successfully</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">First Crisis Update</p>
                    <p className="text-sm text-gray-600">02:15 - Breaking news alert triggered</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Team Response Initiated</p>
                    <p className="text-sm text-gray-600">03:45 - Crisis team assembled and roles assigned</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Stakeholder Communication</p>
                    <p className="text-sm text-gray-600">12:30 - First public statement released</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Crisis Escalation</p>
                    <p className="text-sm text-gray-600">25:00 - Additional complications introduced</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Resolution Achieved</p>
                    <p className="text-sm text-gray-600">42:15 - Crisis successfully managed and resolved</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Quick Initial Response</p>
                    <p className="text-sm text-green-700">Team mobilized within the first 3 minutes of the crisis</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Clear Role Definition</p>
                    <p className="text-sm text-green-700">Each team member understood their responsibilities</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Consistent Messaging</p>
                    <p className="text-sm text-green-700">All communications maintained consistent tone and facts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-900">Decision Speed</p>
                    <p className="text-sm text-yellow-700">Some critical decisions took longer than optimal</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-900">External Communication</p>
                    <p className="text-sm text-yellow-700">Could improve frequency of stakeholder updates</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-900">Resource Allocation</p>
                    <p className="text-sm text-yellow-700">Better coordination needed for resource deployment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
