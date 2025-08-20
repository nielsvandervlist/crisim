"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Target, Download } from "lucide-react"
import { useState } from "react"

interface AnalyticsDashboardProps {
  organizationData: {
    totalSessions: number
    totalParticipants: number
    averageScore: number
    completionRate: number
    sessionsByType: any[]
    performanceTrends: any[]
    topPerformers: any[]
  }
}

export function AnalyticsDashboard({ organizationData }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("overall")

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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your organization's crisis training performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationData.totalSessions}</div>
            <p className="text-xs text-gray-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationData.totalParticipants}</div>
            <p className="text-xs text-gray-600">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(organizationData.averageScore)}`}>
              {organizationData.averageScore}%
            </div>
            <p className="text-xs text-gray-600">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationData.completionRate}%</div>
            <p className="text-xs text-gray-600">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training by Crisis Type */}
        <Card>
          <CardHeader>
            <CardTitle>Training Sessions by Crisis Type</CardTitle>
            <CardDescription>Distribution of training scenarios across different crisis categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizationData.sessionsByType.map((type, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="capitalize">{type.name.replace("_", " ")}</span>
                    <span>
                      {type.count} sessions ({type.percentage}%)
                    </span>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Average scores over time across all training sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizationData.performanceTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{trend.period}</p>
                    <p className="text-sm text-gray-600">{trend.sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(trend.averageScore)}`}>
                      {trend.averageScore}%
                    </div>
                    <div className={`text-xs ${trend.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {trend.change >= 0 ? "+" : ""}
                      {trend.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Participants with the highest average scores across all training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {organizationData.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-gray-600">
                      {performer.role} • {performer.sessionsCompleted} sessions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(performer.averageScore)}`}>
                    {performer.averageScore}%
                  </div>
                  <Badge className={getScoreBadge(performer.averageScore)} variant="secondary">
                    {performer.averageScore >= 90
                      ? "Excellent"
                      : performer.averageScore >= 80
                        ? "Good"
                        : "Satisfactory"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
