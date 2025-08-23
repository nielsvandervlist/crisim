import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 })
    }

    const email = "niels.vder.vlist@gmail.com"
    
    console.log('🔍 Debugging organization data for:', email)
    
    // First, let's check if the user exists in auth.users
    console.log('1. Checking auth.users table...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Error accessing auth:', authError.message)
      return NextResponse.json({ error: "Auth error", details: authError.message }, { status: 500 })
    }
    
    if (!user) {
      return NextResponse.json({ error: "No authenticated user" }, { status: 401 })
    }
    
    console.log('✅ Authenticated user:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    })
    
    // Now let's check the profiles table for the specific email
    console.log('2. Checking profiles table for:', email)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    if (profileError) {
      console.error('❌ Error accessing profiles:', profileError.message)
      return NextResponse.json({ 
        error: "Profile error", 
        details: profileError.message,
        code: profileError.code 
      }, { status: 500 })
    }
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    
    console.log('✅ Profile found:', {
      id: profile.id,
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      organization_id: profile.organization_id,
      created_at: profile.created_at
    })
    
    // Check if organization_id exists
    if (!profile.organization_id) {
      return NextResponse.json({ 
        error: "No organization_id found in profile",
        profile: profile
      }, { status: 400 })
    }
    
    // Now let's check the organizations table
    console.log('3. Checking organizations table...')
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single()
    
    if (orgError) {
      console.error('❌ Error accessing organizations:', orgError.message)
      return NextResponse.json({ 
        error: "Organization error", 
        details: orgError.message,
        code: orgError.code 
      }, { status: 500 })
    }
    
    if (!organization) {
      return NextResponse.json({ 
        error: "Organization not found",
        profile: profile,
        organization_id: profile.organization_id
      }, { status: 404 })
    }
    
    console.log('✅ Organization found:', {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      created_at: organization.created_at
    })
    
    // Finally, let's check all profiles in this organization
    console.log('4. Checking all profiles in this organization...')
    const { data: orgMembers, error: membersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
    
    if (membersError) {
      console.error('❌ Error accessing organization members:', membersError.message)
      return NextResponse.json({ 
        error: "Members error", 
        details: membersError.message,
        code: membersError.code 
      }, { status: 500 })
    }
    
    console.log(`✅ Found ${orgMembers?.length || 0} members in organization`)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile,
      organization: organization,
      members: orgMembers || [],
      memberCount: orgMembers?.length || 0
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      error: "Unexpected error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
