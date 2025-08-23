import * as nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1026'),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : false,
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Email interface
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

// Send email function
export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: options.from || process.env.FROM_EMAIL || 'noreply@crisim.local',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    })
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Email templates
export const emailTemplates = {
  // Welcome email template
  welcome: (userName: string, organizationName: string) => ({
    subject: `Welcome to ${organizationName} - Crisis Training Platform`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to ${organizationName}!</h2>
        <p>Hello ${userName},</p>
        <p>Welcome to the Crisis Training Platform. Your account has been successfully created.</p>
        <p>You can now access the platform and participate in crisis management training sessions.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Getting Started</h3>
          <ul>
            <li>Log in to your account</li>
            <li>Review available training scenarios</li>
            <li>Join scheduled training sessions</li>
            <li>Complete your assigned roles</li>
          </ul>
        </div>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>The Crisis Training Team</p>
      </div>
    `,
    text: `
      Welcome to ${organizationName}!
      
      Hello ${userName},
      
      Welcome to the Crisis Training Platform. Your account has been successfully created.
      You can now access the platform and participate in crisis management training sessions.
      
      Getting Started:
      - Log in to your account
      - Review available training scenarios
      - Join scheduled training sessions
      - Complete your assigned roles
      
      If you have any questions, please contact your administrator.
      
      Best regards,
      The Crisis Training Team
    `
  }),

  // Session invitation template
  sessionInvitation: (userName: string, sessionTitle: string, sessionDate: string, role: string) => ({
    subject: `Training Session Invitation: ${sessionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Training Session Invitation</h2>
        <p>Hello ${userName},</p>
        <p>You have been invited to participate in a crisis training session.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details</h3>
          <p><strong>Title:</strong> ${sessionTitle}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Your Role:</strong> ${role}</p>
        </div>
        <p>Please log in to the platform to access the training session and review your assigned role.</p>
        <p>If you have any questions or need to reschedule, please contact your trainer.</p>
        <p>Best regards,<br>The Crisis Training Team</p>
      </div>
    `,
    text: `
      Training Session Invitation
      
      Hello ${userName},
      
      You have been invited to participate in a crisis training session.
      
      Session Details:
      - Title: ${sessionTitle}
      - Date: ${sessionDate}
      - Your Role: ${role}
      
      Please log in to the platform to access the training session and review your assigned role.
      
      If you have any questions or need to reschedule, please contact your trainer.
      
      Best regards,
      The Crisis Training Team
    `
  }),

  // Session reminder template
  sessionReminder: (userName: string, sessionTitle: string, sessionDate: string, timeUntil: string) => ({
    subject: `Reminder: ${sessionTitle} starts in ${timeUntil}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Training Session Reminder</h2>
        <p>Hello ${userName},</p>
        <p>This is a reminder that your crisis training session is starting soon.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Session Details</h3>
          <p><strong>Title:</strong> ${sessionTitle}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time until start:</strong> ${timeUntil}</p>
        </div>
        <p>Please ensure you're logged in and ready to participate in the training session.</p>
        <p>Best regards,<br>The Crisis Training Team</p>
      </div>
    `,
    text: `
      Training Session Reminder
      
      Hello ${userName},
      
      This is a reminder that your crisis training session is starting soon.
      
      Session Details:
      - Title: ${sessionTitle}
      - Date: ${sessionDate}
      - Time until start: ${timeUntil}
      
      Please ensure you're logged in and ready to participate in the training session.
      
      Best regards,
      The Crisis Training Team
    `
  }),

  // Member invitation template
  memberInvitation: (inviterName: string, organizationName: string, role: string, invitationUrl: string) => ({
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Organization Invitation</h2>
        <p>Hello,</p>
        <p>You have been invited by <strong>${inviterName}</strong> to join <strong>${organizationName}</strong> on the Crisis Training Platform.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Invitation Details</h3>
          <p><strong>Organization:</strong> ${organizationName}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Invited by:</strong> ${inviterName}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Accept Invitation
          </a>
        </div>
        <p>Click the button above to accept the invitation and create your account. If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${invitationUrl}</p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>The Crisis Training Team</p>
      </div>
    `,
    text: `
      Organization Invitation
      
      Hello,
      
      You have been invited by ${inviterName} to join ${organizationName} on the Crisis Training Platform.
      
      Invitation Details:
      - Organization: ${organizationName}
      - Role: ${role}
      - Invited by: ${inviterName}
      
      To accept this invitation, please visit:
      ${invitationUrl}
      
      This invitation will expire in 7 days.
      
      If you have any questions, please contact your administrator.
      
      Best regards,
      The Crisis Training Team
    `
  })
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('Email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}
