# Email Development Setup with Mailhog

This guide explains how to set up and use Mailhog for local email development in the Crisis Training Platform.

## What is Mailhog?

Mailhog is a development tool that captures emails sent by your application and displays them in a web interface. This allows you to test email functionality without actually sending emails to real addresses.

## Quick Start

### 1. Install Dependencies

First, install the new email dependencies:

```bash
pnpm install
```

### 2. Start Mailhog

Start Mailhog using Docker:

```bash
npm run email:start
```

Or start both Mailhog and your development server:

```bash
npm run dev:email
```

### 3. Access Mailhog Web Interface

Open your browser and go to: http://localhost:8026

You'll see the Mailhog web interface where all captured emails will be displayed.

## Configuration

### Environment Variables

Copy the example environment file and configure your email settings:

```bash
cp env.example .env.local
```

For local development with Mailhog, use these settings:

```env
# Email Configuration (for Mailhog local development)
SMTP_HOST=localhost
SMTP_PORT=1026
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@crisim.local
```

### Production Configuration

For production, you would use a real SMTP service:

```env
# Example with Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com
```

## Available Scripts

- `npm run email:start` - Start Mailhog container
- `npm run email:stop` - Stop Mailhog container
- `npm run email:logs` - View Mailhog logs
- `npm run dev:email` - Start both Mailhog and development server

## Testing Email Functionality

### 1. Access the Email Test Page

Navigate to `/dashboard/debug/email-test` in your application (admin access required).

### 2. Send Test Emails

Use the test page to send:
- Welcome emails
- Custom test emails
- Session invitations
- Session reminders

### 3. View Captured Emails

All sent emails will appear in the Mailhog web interface at http://localhost:8026.

## Email Templates

The application includes several pre-built email templates:

### Welcome Email
Sent to new users when they join the platform.

### Session Invitation
Sent to participants when they're invited to a training session.

### Session Reminder
Sent to participants before a training session starts.

### Custom Email
For sending custom messages during development.

## Integration with Application

The email service is now fully integrated with your existing application:

### ✅ Automatic Email Sending

**Welcome Emails**
- Automatically sent when new users sign up via the `signUp` action
- No additional code needed - integrated into the registration flow

**Session Invitation Emails**
- Automatically sent when trainers invite participants via the `inviteParticipant` action
- Triggered when adding participants to training sessions
- No additional code needed - integrated into the invitation flow

### Manual Email Service Usage

You can also manually send emails using the email service:

```typescript
import { emailService } from '@/lib/email-service'

// Send welcome email
await emailService.sendWelcomeEmail(userId)

// Send session invitations
await emailService.sendSessionInvitations(sessionId)

// Send session reminders
await emailService.sendSessionReminders(sessionId)

// Send custom email
await emailService.sendCustomEmail(
  'user@example.com',
  'Subject',
  '<h1>HTML Content</h1>',
  'Plain text content'
)
```

### Adding Email to Existing Actions

You can add email functionality to your existing server actions:

```typescript
// In your server action
import { emailService } from '@/lib/email-service'

export async function createUser(formData: FormData) {
  // ... existing user creation logic ...
  
  // Send welcome email
  await emailService.sendWelcomeEmail(newUserId)
  
  return { success: true }
}
```

## Troubleshooting

### Mailhog Not Starting

1. Check if Docker is running
2. Check if port 8026 is available
3. View logs: `npm run email:logs`

### Emails Not Appearing

1. Verify Mailhog is running on port 1026
2. Check your SMTP configuration
3. Look for errors in the browser console
4. Check the application logs

### Port Conflicts

If ports 1026 or 8026 are in use, you can modify the `docker-compose.yml` file:

```yaml
ports:
  - "1027:1025"  # Change 1026 to 1027
  - "8027:8025"  # Change 8026 to 8027
```

Then update your environment variables accordingly.

## Production Deployment

When deploying to production:

1. Replace Mailhog with a real SMTP service
2. Update environment variables with production SMTP settings
3. Remove or disable the email test page
4. Consider using email services like:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Gmail SMTP

## Security Notes

- Never commit real SMTP credentials to version control
- Use environment variables for all sensitive configuration
- The email test page is only accessible to admin users
- Consider rate limiting email sending in production
