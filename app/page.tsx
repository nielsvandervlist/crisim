import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Users, Target, BarChart3 } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Crisis Training Platform</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Master Crisis Management
            <span className="text-blue-600"> Through Simulation</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Train your team with realistic crisis scenarios. Practice coordinated responses, test communication
            protocols, and build confidence through immersive digital experiences.
          </p>
          <div className="mt-10">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Start Training Today
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Multi-Role Training</h3>
            <p className="mt-2 text-gray-600">
              Assign different roles to team members and practice coordinated crisis response across departments.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <Target className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Realistic Scenarios</h3>
            <p className="mt-2 text-gray-600">
              Experience authentic crisis situations with mock social media, news feeds, and real-time updates.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <BarChart3 className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Performance Analytics</h3>
            <p className="mt-2 text-gray-600">
              Track response times, decision quality, and team coordination with detailed analytics and reporting.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
