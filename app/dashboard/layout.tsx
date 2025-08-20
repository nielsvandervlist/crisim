import type React from "react"
import { getUserProfile } from "@/lib/auth"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={profile} organizationName={profile.organization?.name} />
      <main className="md:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
