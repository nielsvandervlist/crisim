import { getServerUserProfile } from "@/lib/server-auth"
import { emailService } from "@/lib/email-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function EmailTestPage() {
  const profile = await getServerUserProfile()

  // Only allow admins to access this page
  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              Only administrators can access the email testing page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Testing Dashboard</h1>
          <p className="text-gray-600">
            Test email functionality with Mailhog for local development
          </p>
        </div>

        {/* Mailhog Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Mailhog Status
            </CardTitle>
            <CardDescription>
              Check if Mailhog is running and view captured emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Mailhog should be running on port 8025 for the web interface
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>SMTP: localhost:1026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Web UI: localhost:8026</span>
                  </div>
                </div>
              </div>
              <Link 
                href="http://localhost:8026" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Mailhog
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Email Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Welcome Email</CardTitle>
              <CardDescription>
                Send a welcome email to your own account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async () => {
                'use server'
                const result = await emailService.sendWelcomeEmail(profile.id)
                console.log('Welcome email result:', result)
              }}>
                <Button type="submit" className="w-full">
                  Send Welcome Email
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                ✅ Automatically sent when users sign up
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Custom Email</CardTitle>
              <CardDescription>
                Send a custom test email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async (formData: FormData) => {
                'use server'
                const subject = formData.get('subject') as string
                const message = formData.get('message') as string
                
                const result = await emailService.sendCustomEmail(
                  profile.email,
                  subject || 'Test Email from Crisis Training Platform',
                  `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #2563eb;">Test Email</h2>
                      <p>This is a test email from the Crisis Training Platform.</p>
                      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Message:</strong></p>
                        <p>${message || 'No message provided'}</p>
                      </div>
                      <p>If you're seeing this, Mailhog is working correctly!</p>
                    </div>
                  `,
                  `Test Email\n\nThis is a test email from the Crisis Training Platform.\n\nMessage: ${message || 'No message provided'}\n\nIf you're seeing this, Mailhog is working correctly!`
                )
                console.log('Custom email result:', result)
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      defaultValue="Test Email from Crisis Training Platform"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      defaultValue="This is a test message to verify Mailhog is working correctly."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Test Email
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Invitations</CardTitle>
              <CardDescription>
                Automatically sent when participants are invited
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  ✅ Integrated with invite participant action
                </p>
                <p className="text-xs text-gray-500">
                  Emails are automatically sent when trainers invite participants to training sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use Mailhog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. Start Mailhog</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Run one of these commands to start Mailhog:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-sm">
                    npm run email:start
                  </code>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. View Emails</h4>
                                 <p className="text-sm text-gray-600 mb-2">
                   Open <Link href="http://localhost:8026" target="_blank" className="text-blue-600 hover:underline">http://localhost:8026</Link> in your browser to view captured emails.
                 </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. Test Email Sending</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Use the buttons above to send test emails, or trigger automatic emails by:
                </p>
                <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                  <li>Creating new user accounts (welcome emails)</li>
                  <li>Inviting participants to training sessions (invitation emails)</li>
                  <li>Using the session reminder functionality</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  All emails will be captured by Mailhog and displayed in the web interface.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">4. Stop Mailhog</h4>
                <p className="text-sm text-gray-600 mb-2">
                  When you're done testing, stop Mailhog:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-sm">
                    npm run email:stop
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
