import { sendEmail, verifyEmailConfig } from './email'

async function testEmail() {
  console.log('Testing email configuration...')
  
  // Verify email config
  const configValid = await verifyEmailConfig()
  if (!configValid) {
    console.error('Email configuration is invalid')
    return
  }
  
  console.log('Email configuration is valid')
  
  // Send test email
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email from Crisis Training Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Email</h2>
        <p>This is a test email to verify Mailhog is working correctly.</p>
        <p>If you can see this email in the Mailhog web interface, everything is working!</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> Development</p>
        </div>
      </div>
    `,
    text: `Test Email\n\nThis is a test email to verify Mailhog is working correctly.\n\nIf you can see this email in the Mailhog web interface, everything is working!\n\nTimestamp: ${new Date().toISOString()}\nEnvironment: Development`
  })
  
  if (result.success) {
    console.log('✅ Test email sent successfully!')
    console.log('Check Mailhog at http://localhost:8026 to view the email')
  } else {
    console.error('❌ Failed to send test email:', result.error)
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEmail().catch(console.error)
}

export { testEmail }
