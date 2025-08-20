"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react"

interface TrainingProgressProps {
  participantData: {
    totalSessions: number
    completedSessions: number
    averageScore?: number
    skillsImproved?: string[]
    recentSessions: any[]
  }
}

export function TrainingProgress({ participantData }: TrainingProgressProps) {
  const completionRate =
    participantData.totalSessions > 0 ? (participantData.completedSessions / participantData.totalSessions) * 100 : 0

  const getSkillColor = (skill: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
    ]
    return colors[skill.length % colors.length]
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Training Progress
          </CardTitle>
          <CardDescription>Your crisis management training journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-gray-600">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="w-full" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{participantData.totalSessions}</div>
                <div className="text-xs text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{participantData.completedSessions}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{participantData.averageScore || 0}%</div>
                <div className="text-xs text-gray-600">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{participantData.skillsImproved?.length || 0}</div>
                <div className="text-xs text-gray-600">Skills Improved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Development */}
      {participantData.skillsImproved && participantData.skillsImproved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Skills Development
            </CardTitle>
            <CardDescription>Areas where you've shown improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {participantData.skillsImproved.map((skill, index) => (
                <Badge key={index} className={getSkillColor(skill)} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent Training Sessions
          </CardTitle>
          <CardDescription>Your latest crisis training activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participantData.recentSessions.length > 0 ? (
              participantData.recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{session.title}</p>
                      <p className="text-sm text-gray-600">{session.scenario}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{session.score}%</div>
                    <div className="text-xs text-gray-500">{session.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No completed sessions yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
