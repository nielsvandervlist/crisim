import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsDashboard } from "@/components/reporting/analytics-dashboard"
import { SessionReport } from "@/components/reporting/session-report"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into training performance and outcomes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Session Reports</TabsTrigger>
          <TabsTrigger value="participants">Participant Analytics</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<div>Loading analytics...</div>}>
            <AnalyticsDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Suspense fallback={<div>Loading session reports...</div>}>
            <SessionReport />
          </Suspense>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participant Performance</CardTitle>
              <CardDescription>Individual and team performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Participant analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Effectiveness</CardTitle>
              <CardDescription>Analysis of scenario performance and learning outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Scenario analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
