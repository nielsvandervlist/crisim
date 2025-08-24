import { Suspense } from "react"
import { DigitalExperiencesList } from "@/components/digital-experiences/digital-experiences-list"
import { CreateDigitalExperienceForm } from "@/components/digital-experiences/create-experience-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Zap } from "lucide-react"

export default function DigitalExperiencesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Experiences</h1>
          <p className="text-muted-foreground">
            Create and manage digital experiences for your crisis training scenarios
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Experience
              </CardTitle>
              <CardDescription>
                Add a new digital experience that can be used across multiple scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateDigitalExperienceForm />
            </CardContent>
          </Card>
        </div>

        {/* Experiences List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                All Digital Experiences
              </CardTitle>
              <CardDescription>
                Manage and organize your digital experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading experiences...</div>}>
                <DigitalExperiencesList />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
