// Test script to check Supabase Storage connection and bucket status
const { createClient } = require('@supabase/supabase-js')

async function testStorageConnection() {
  // Use the service role key for higher permissions
  const supabaseUrl = 'http://127.0.0.1:54321'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🔍 Testing Supabase Storage connection...')
    
    // 1. List all buckets
    console.log('\n📦 Listing all storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
    } else {
      console.log('✅ Available buckets:')
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (public: ${bucket.public})`)
      })
    }

    // 2. Check if documents bucket exists
    console.log('\n📁 Checking documents bucket...')
    const { data: documentsBucket, error: documentsError } = await supabase.storage.getBucket('documents')
    
    if (documentsError) {
      if (documentsError.message.includes('not found')) {
        console.log('⚠️  Documents bucket does not exist yet')
        console.log('💡 It will be created automatically on first upload')
      } else {
        console.error('❌ Error checking documents bucket:', documentsError)
      }
    } else {
      console.log('✅ Documents bucket exists:', documentsBucket)
    }

    // 3. Try to create the documents bucket
    console.log('\n🔧 Attempting to create documents bucket...')
    const { data: createData, error: createError } = await supabase.storage.createBucket('documents', {
      public: false,
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
      fileSizeLimit: 52428800 // 50MB
    })

    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('✅ Documents bucket already exists')
      } else {
        console.error('❌ Error creating bucket:', createError)
      }
    } else {
      console.log('✅ Documents bucket created successfully')
    }

    // 4. Test listing files in the bucket
    console.log('\n📋 Testing file listing...')
    const { data: files, error: listError } = await supabase.storage
      .from('documents')
      .list('private/scenarios', { limit: 10 })

    if (listError) {
      console.error('❌ Error listing files:', listError)
    } else {
      console.log('✅ Files in scenarios folder:', files?.length || 0)
      if (files && files.length > 0) {
        files.forEach(file => console.log(`   - ${file.name}`))
      }
    }

    // 5. Test bucket policies
    console.log('\n🔒 Testing bucket access...')
    try {
      const { data: testUpload, error: testError } = await supabase.storage
        .from('documents')
        .upload('private/test/connection-test.txt', 'Hello World', {
          contentType: 'text/plain',
          upsert: true
        })

      if (testError) {
        console.error('❌ Test upload failed:', testError)
      } else {
        console.log('✅ Test upload successful:', testUpload)
        
        // Clean up test file
        const { error: cleanupError } = await supabase.storage
          .from('documents')
          .remove(['private/test/connection-test.txt'])
        
        if (cleanupError) {
          console.log('⚠️  Failed to cleanup test file:', cleanupError)
        } else {
          console.log('🧹 Test file cleaned up')
        }
      }
    } catch (error) {
      console.error('❌ Test upload error:', error)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testStorageConnection()
