"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Shield, Users, Target, BarChart3, Settings, Menu, Home, Play, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "trainer", "participant"],
  },
  {
    title: "Scenarios",
    href: "/dashboard/scenarios",
    icon: Target,
    roles: ["admin", "trainer"],
  },
  {
    title: "Digital Experiences",
    href: "/dashboard/digital-experiences",
    icon: Zap,
    roles: ["admin", "trainer"],
  },
  {
    title: "Training Sessions",
    href: "/dashboard/sessions",
    icon: Play,
    roles: ["admin", "trainer", "participant"],
  },
  {
    title: "Team Members",
    href: "/dashboard/members",
    icon: Users,
    roles: ["admin", "trainer"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin", "trainer"],
  },
  {
    title: "Organization",
    href: "/dashboard/organization",
    icon: Settings,
    roles: ["admin"],
  },
]

interface DashboardNavProps {
  userRole: string
  organizationName?: string
}

export function DashboardNav({ userRole, organizationName }: DashboardNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-6 py-4 border-b">
        <Shield className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="font-semibold text-lg">Crisis Training</h2>
          {organizationName && <p className="text-sm text-gray-600">{organizationName}</p>}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                isActive 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mr-3 transition-colors",
                isActive ? "text-blue-600" : "text-gray-500"
              )} />
              {item.title}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <NavContent />
      </div>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
