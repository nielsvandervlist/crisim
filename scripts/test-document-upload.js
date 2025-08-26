// Test script to debug document upload and RLS policies
const { createClient } = require('@supabase/supabase-js')

async function testDocumentUpload() {
  // You'll need to set these environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

  if (!supabaseUrl || !supabaseKey) {
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔍 Testing authentication...')
    
    // Check current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    if (!user) {
      console.log('⚠️  No authenticated user found')
      console.log('💡 You need to sign in first to test document uploads')
      return
    }
    
    console.log('✅ User authenticated:', user.id, user.email)
    
    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Profile error:', profileError)
      return
    }
    
    if (!profile) {
      console.error('❌ No profile found for user')
      return
    }
    
    console.log('✅ User profile:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      organization_id: profile.organization_id
    })
    
    // Check if user has access to any scenarios
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select('id, title, organization_id')
      .eq('organization_id', profile.organization_id)
      .limit(1)
    
    if (scenariosError) {
      console.error('❌ Scenarios error:', scenariosError)
      return
    }
    
    if (!scenarios || scenarios.length === 0) {
      console.log('⚠️  No scenarios found for user\'s organization')
      return
    }
    
    console.log('✅ Found scenario:', scenarios[0].title)
    
    // Test document insertion (without file upload)
    console.log('🧪 Testing document insertion...')
    const testDocument = {
      scenario_id: scenarios[0].id,
      title: 'Test Document',
      file_name: 'test.txt',
      file_path: 'test/path.txt',
      file_type: 'text/plain',
      file_size: 100,
      uploaded_by: user.id
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert(testDocument)
      .select()
    
    if (insertError) {
      console.error('❌ Document insertion failed:', insertError)
      console.log('🔍 This suggests an RLS policy issue')
      return
    }
    
    console.log('✅ Document insertion successful:', insertData)
    
    // Clean up test document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', insertData[0].id)
    
    if (deleteError) {
      console.error('⚠️  Failed to clean up test document:', deleteError)
    } else {
      console.log('🧹 Test document cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testDocumentUpload()
