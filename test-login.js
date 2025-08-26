// Test script to verify admin user login
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration for local development
const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminLogin() {
  console.log('🧪 Testing admin user login...')
  
  try {
    // Test 1: Check if user exists in auth.users
    console.log('\n1️⃣ Checking if user exists in database...')
    
    // Test 2: Try to sign in with the admin credentials
    console.log('\n2️⃣ Attempting to sign in with admin credentials...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'niels.vder.vlist@gmail.com',
      password: 'dropjes'
    })
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message)
      console.error('Error details:', signInError)
      return
    }
    
    if (signInData.user) {
      console.log('✅ Sign in successful!')
      console.log('User ID:', signInData.user.id)
      console.log('Email:', signInData.user.email)
      console.log('Email confirmed:', signInData.user.email_confirmed_at)
      
      // Test 3: Check user profile
      console.log('\n3️⃣ Checking user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', signInData.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message)
      } else {
        console.log('✅ Profile found:')
        console.log('  - Full Name:', profile.full_name)
        console.log('  - Role:', profile.role)
        console.log('  - Organization ID:', profile.organization_id)
      }
      
      // Test 4: Sign out
      console.log('\n4️⃣ Signing out...')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('❌ Sign out failed:', signOutError.message)
      } else {
        console.log('✅ Sign out successful')
      }
      
    } else {
      console.log('❌ No user data returned from sign in')
    }
    
  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error)
  }
}

async function checkDatabaseState() {
  console.log('\n🔍 Checking database state...')
  
  try {
    // Check if we can access the profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Cannot access profiles table:', profilesError.message)
    } else {
      console.log('✅ Profiles table accessible')
      console.log('Found profiles:', profiles.length)
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.email}) - ${profile.role}`)
      })
    }
    
    // Check if we can access the organizations table
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)
    
    if (orgsError) {
      console.error('❌ Cannot access organizations table:', orgsError.message)
    } else {
      console.log('✅ Organizations table accessible')
      console.log('Found organizations:', orgs.length)
      orgs.forEach(org => {
        console.log(`  - ${org.name} (${org.slug})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting login tests...\n')
  
  await checkDatabaseState()
  await testAdminLogin()
  
  console.log('\n🏁 Tests completed!')
}

runTests().catch(console.error)
