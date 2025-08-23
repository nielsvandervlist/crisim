const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testQuery() {
  try {
    console.log('🔍 Finding user: niels.vder.vlist@gmail.com')
    
    // First, find the user's profile and organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, full_name, role, organization_id')
      .eq('email', 'niels.vder.vlist@gmail.com')
      .single()
    
    if (profileError) {
      console.error('❌ Error finding user profile:', profileError)
      return
    }
    
    if (!profile) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:')
    console.log('  - ID:', profile.id)
    console.log('  - User ID:', profile.user_id)
    console.log('  - Full Name:', profile.full_name)
    console.log('  - Role:', profile.role)
    console.log('  - Organization ID:', profile.organization_id)
    
    if (!profile.organization_id) {
      console.log('❌ User has no organization_id')
      return
    }
    
    console.log('\n🔍 Testing sessions query with organization_id:', profile.organization_id)
    
    // Test the exact query from the sessions page
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select(`
        *,
        scenario:scenarios(title, crisis_type, difficulty_level, estimated_duration),
        creator:profiles!training_sessions_created_by_fkey(full_name),
        session_participants!session_participants_session_id_fkey(id, participant_id, role_assignment)
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
    
    if (sessionsError) {
      console.error('❌ Error executing sessions query:', sessionsError)
      return
    }
    
    console.log(`✅ Query successful! Found ${sessions?.length || 0} sessions`)
    
    if (sessions && sessions.length > 0) {
      console.log('\n📋 Sessions found:')
      sessions.forEach((session, index) => {
        console.log(`\n  ${index + 1}. ${session.title}`)
        console.log(`     Status: ${session.status}`)
        console.log(`     Scenario: ${session.scenario?.title || 'N/A'}`)
        console.log(`     Creator: ${session.creator?.full_name || 'Unknown'}`)
        console.log(`     Participants: ${session.session_participants?.length || 0}`)
        console.log(`     Created: ${new Date(session.created_at).toLocaleString()}`)
      })
    } else {
      console.log('📭 No sessions found for this organization')
    }
    
    // Test if user is a participant and show their assigned sessions
    if (profile.role === 'participant') {
      console.log('\n🔍 Checking participant sessions...')
      
      const { data: participantSessions, error: participantError } = await supabase
        .from('session_participants')
        .select('session_id')
        .eq('participant_id', profile.user_id)
      
      if (participantError) {
        console.error('❌ Error checking participant sessions:', participantError)
        return
      }
      
      const sessionIds = participantSessions?.map(p => p.session_id) || []
      console.log(`✅ User is assigned to ${sessionIds.length} sessions`)
      
      if (sessionIds.length > 0) {
        console.log('Session IDs:', sessionIds)
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testQuery()
