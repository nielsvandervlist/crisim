"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "alert" | "info" | "success" | "warning"
  title: string
  message: string
  timestamp: Date
  urgent?: boolean
}

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "New Crisis Update",
      message: "Breaking: Social media reports indicate situation escalating",
      timestamp: new Date(),
      urgent: true,
    },
    {
      id: "2",
      type: "info",
      title: "Team Assignment",
      message: "You have been assigned to handle media communications",
      timestamp: new Date(),
    },
  ])

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "alert":
        return "destructive"
      case "success":
        return "default"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5" />
        <h3 className="font-semibold">Live Updates</h3>
        <Badge variant="secondary">{notifications.length}</Badge>
      </div>

      {notifications.map((notification) => (
        <Card key={notification.id} className={`${notification.urgent ? "border-red-500 bg-red-50" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`mt-0.5 ${notification.type === "alert" ? "text-red-500" : "text-blue-500"}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <Badge variant={getVariant(notification.type) as any} className="text-xs">
                      {notification.type}
                    </Badge>
                    {notification.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        URGENT
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <span className="text-xs text-muted-foreground">{notification.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
