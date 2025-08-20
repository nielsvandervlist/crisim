"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Users } from "lucide-react"

interface Message {
  id: string
  user: string
  role: "trainer" | "participant"
  message: string
  timestamp: Date
  isSystem?: boolean
}

interface LiveChatProps {
  sessionId: string
  currentUser: {
    name: string
    role: "trainer" | "participant"
  }
}

export function LiveChat({ sessionId, currentUser }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "System",
      role: "trainer",
      message: "Training session has started. Good luck everyone!",
      timestamp: new Date(),
      isSystem: true,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState(12)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      user: currentUser.name,
      role: currentUser.role,
      message: newMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Chat</CardTitle>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">{onlineUsers} online</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{message.user}</span>
                  <Badge variant={message.role === "trainer" ? "default" : "secondary"} className="text-xs">
                    {message.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className={`text-sm ${message.isSystem ? "text-muted-foreground italic" : ""}`}>{message.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
