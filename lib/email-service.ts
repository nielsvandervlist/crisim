import { createClient } from "@/lib/supabase/server"
import { sendEmail, emailTemplates } from "@/lib/email"

export class EmailService {
  private supabase: any

  constructor() {
    this.initializeSupabase()
  }

  private async initializeSupabase() {
    this.supabase = await createClient()
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userId: string) {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      // Get user profile and organization details
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select(`
          *,
          organization:organizations(name)
        `)
        .eq('user_id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError)
        return { success: false, error: 'User profile not found' }
      }

      const template = emailTemplates.welcome(
        profile.full_name,
        profile.organization?.name || 'Your Organization'
      )

      return await sendEmail({
        to: profile.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send session invitation emails
  async sendSessionInvitations(sessionId: string) {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      // Get session details with participants
      const { data: session, error: sessionError } = await this.supabase
        .from('training_sessions')
        .select(`
          *,
          scenario:scenarios(title),
          session_participants(
            participant:profiles(full_name, email)
          )
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError || !session) {
        console.error('Failed to get session details:', sessionError)
        return { success: false, error: 'Session not found' }
      }

      const results = []

      // Send invitation to each participant
      for (const participant of session.session_participants) {
        const template = emailTemplates.sessionInvitation(
          participant.participant.full_name,
          session.title,
          new Date(session.scheduled_at).toLocaleDateString(),
          participant.role_assignment
        )

        const result = await sendEmail({
          to: participant.participant.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })

        results.push({
          participant: participant.participant.email,
          success: result.success,
          error: result.error,
        })
      }

      return {
        success: results.every(r => r.success),
        results,
      }
    } catch (error) {
      console.error('Failed to send session invitations:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send session reminder emails
  async sendSessionReminders(sessionId: string) {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      // Get session details with participants
      const { data: session, error: sessionError } = await this.supabase
        .from('training_sessions')
        .select(`
          *,
          scenario:scenarios(title),
          session_participants(
            participant:profiles(full_name, email)
          )
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError || !session) {
        console.error('Failed to get session details:', sessionError)
        return { success: false, error: 'Session not found' }
      }

      const sessionDate = new Date(session.scheduled_at)
      const now = new Date()
      const timeUntil = this.calculateTimeUntil(sessionDate, now)

      const results = []

      // Send reminder to each participant
      for (const participant of session.session_participants) {
        const template = emailTemplates.sessionReminder(
          participant.participant.full_name,
          session.title,
          sessionDate.toLocaleDateString(),
          timeUntil
        )

        const result = await sendEmail({
          to: participant.participant.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })

        results.push({
          participant: participant.participant.email,
          success: result.success,
          error: result.error,
        })
      }

      return {
        success: results.every(r => r.success),
        results,
      }
    } catch (error) {
      console.error('Failed to send session reminders:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send member invitation email
  async sendMemberInvitation(inviterName: string, organizationName: string, role: string, inviteeEmail: string, invitationToken: string) {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const invitationUrl = `${baseUrl}/auth/accept-invitation?token=${invitationToken}`

      const template = emailTemplates.memberInvitation(
        inviterName,
        organizationName,
        role,
        invitationUrl
      )

      return await sendEmail({
        to: inviteeEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
    } catch (error) {
      console.error('Failed to send member invitation email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send custom email
  async sendCustomEmail(to: string | string[], subject: string, html: string, text?: string) {
    return await sendEmail({
      to,
      subject,
      html,
      text,
    })
  }

  // Helper function to calculate time until session
  private calculateTimeUntil(sessionDate: Date, now: Date): string {
    const diffMs = sessionDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24)
      return `${days} day${days > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    } else {
      return 'less than a minute'
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
