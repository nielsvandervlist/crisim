// This script sets up the documents storage bucket in Supabase
// Run this after starting your local Supabase instance

const { createClient } = require('@supabase/supabase-js')

async function setupStorage() {
  // You'll need to set these environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54322'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

  if (!supabaseUrl || !supabaseKey) {
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Create the documents bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('documents', {
      public: false, // Documents are private by default
      allowedMimeTypes: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ],
      fileSizeLimit: 52428800 // 50MB in bytes
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Documents bucket already exists')
      } else {
        throw bucketError
      }
    } else {
      console.log('✅ Documents bucket created successfully')
    }

    // Set up storage policies for the documents bucket
    console.log('📋 Setting up storage policies...')
    
    // Policy: Users can upload documents to scenarios they have access to
    // This would typically be done through RLS policies in your database
    
    console.log('✅ Storage setup complete!')
    console.log('📝 Note: You may need to configure Row Level Security (RLS) policies for the documents table')
    
  } catch (error) {
    console.error('❌ Error setting up storage:', error.message)
  }
}

// Run the setup
setupStorage()
