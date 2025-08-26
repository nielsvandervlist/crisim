import { Suspense } from "react"
import { DigitalExperiencesList } from "@/components/digital-experiences/digital-experiences-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DigitalExperiencesPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Digital Experiences</h1>
            <p className="text-gray-600 mt-1">
              Create and manage digital experiences for your crisis training scenarios
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Create reusable templates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Manage across scenarios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Real-time preview</span>
          </div>
        </div>
      </div>

      {/* Create Button Section */}
      <div className="flex justify-center">
        <Link href="/dashboard/digital-experiences/create">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
            <Plus className="mr-3 h-6 w-6" />
            Create New Experience
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Experiences List */}
      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-blue-600" />
                All Digital Experiences
              </CardTitle>
              <CardDescription>
                Manage and organize your digital experiences
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              Experiences
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Suspense fallback={<div>Loading experiences...</div>}>
            <DigitalExperiencesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
