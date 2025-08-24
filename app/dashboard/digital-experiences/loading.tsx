import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DigitalExperiencesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form Skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Experiences List Skeleton */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
