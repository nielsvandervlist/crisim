// Test script to test user signup functionality
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration for local development
const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  console.log('🧪 Testing user signup...')
  
  try {
    // Test signup with admin user
    console.log('\n1️⃣ Attempting to sign up admin user...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'niels.vder.vlist@gmail.com',
      password: 'dropjes',
      options: {
        data: {
          full_name: 'Niels van der Vlist',
          role: 'admin'
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message)
      console.error('Error details:', signUpError)
      return
    }
    
    if (signUpData.user) {
      console.log('✅ Sign up successful!')
      console.log('User ID:', signUpData.user.id)
      console.log('Email:', signUpData.user.email)
      console.log('Email confirmed:', signUpData.user.email_confirmed_at)
      
      // Check if profile was created
      console.log('\n2️⃣ Checking if profile was created...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', signUpData.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message)
        console.log('This might be expected if the profile creation is handled by a trigger or function')
      } else {
        console.log('✅ Profile found:')
        console.log('  - Full Name:', profile.full_name)
        console.log('  - Role:', profile.role)
        console.log('  - Organization ID:', profile.organization_id)
      }
      
      // Test login with the new user
      console.log('\n3️⃣ Testing login with new user...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'niels.vder.vlist@gmail.com',
        password: 'dropjes'
      })
      
      if (signInError) {
        console.error('❌ Login failed:', signInError.message)
      } else {
        console.log('✅ Login successful!')
        console.log('User ID:', signInData.user.id)
        console.log('Email:', signInData.user.email)
      }
      
      // Sign out
      console.log('\n4️⃣ Signing out...')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('❌ Sign out failed:', signOutError.message)
      } else {
        console.log('✅ Sign out successful')
      }
      
    } else {
      console.log('❌ No user data returned from sign up')
    }
    
  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error)
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting signup test...\n')
  
  await testSignup()
  
  console.log('\n🏁 Test completed!')
}

runTest().catch(console.error)
