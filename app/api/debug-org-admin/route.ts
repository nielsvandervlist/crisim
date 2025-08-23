import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 })
    }

    const email = "niels.vder.vlist@gmail.com"
    
    console.log('🔍 Admin debugging organization data for:', email)
    
    // Check if we're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    console.log('✅ Authenticated as:', user.email)
    
    // Try to get the profile directly by email (this should work regardless of RLS)
    console.log('1. Checking profiles table directly...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
    
    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError.message)
      return NextResponse.json({ 
        error: "Profiles query error", 
        details: profilesError.message,
        code: profilesError.code 
      }, { status: 500 })
    }
    
    console.log(`✅ Found ${profiles?.length || 0} profiles for email:`, email)
    
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`, {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          organization_id: profile.organization_id,
          created_at: profile.created_at
        })
      })
    }
    
    // Check all profiles in the system
    console.log('\n2. Checking all profiles in system...')
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (allProfilesError) {
      console.error('❌ Error querying all profiles:', allProfilesError.message)
    } else {
      console.log(`✅ Found ${allProfiles?.length || 0} total profiles (showing first 10):`)
      if (allProfiles && allProfiles.length > 0) {
        allProfiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email} - ${profile.role} - Org: ${profile.organization_id || 'None'}`)
        })
      }
    }
    
    // Check organizations
    console.log('\n3. Checking organizations...')
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
    
    if (orgsError) {
      console.error('❌ Error querying organizations:', orgsError.message)
    } else {
      console.log(`✅ Found ${organizations?.length || 0} organizations:`)
      if (organizations && organizations.length > 0) {
        organizations.forEach((org, index) => {
          console.log(`   ${index + 1}. ${org.name} (${org.slug}) - ID: ${org.id}`)
        })
      }
    }
    
    // If we found a profile with an organization_id, check members
    if (profiles && profiles.length > 0) {
      const profileWithOrg = profiles.find(p => p.organization_id)
      
      if (profileWithOrg && profileWithOrg.organization_id) {
        console.log(`\n4. Checking members for organization: ${profileWithOrg.organization_id}`)
        
        const { data: orgMembers, error: membersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', profileWithOrg.organization_id)
          .order('created_at', { ascending: false })
        
        if (membersError) {
          console.error('❌ Error querying org members:', membersError.message)
        } else {
          console.log(`✅ Found ${orgMembers?.length || 0} members in organization:`)
          if (orgMembers && orgMembers.length > 0) {
            orgMembers.forEach((member, index) => {
              console.log(`   ${index + 1}. ${member.full_name || 'Unknown'} (${member.email}) - ${member.role}`)
            })
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      authenticatedUser: {
        id: user.id,
        email: user.email
      },
      targetEmail: email,
      profilesFound: profiles || [],
      allProfiles: allProfiles || [],
      organizations: organizations || [],
      summary: {
        totalProfiles: allProfiles?.length || 0,
        totalOrganizations: organizations?.length || 0,
        profilesForTargetEmail: profiles?.length || 0
      }
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      error: "Unexpected error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
