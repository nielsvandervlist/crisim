/**
 * Seed script for the crisis management training platform
 * This script creates test users with passwords and sample data
 */
import { createSeedClient } from "@snaplet/seed";
import { createClient } from '@supabase/supabase-js'

const main = async () => {
  const seed = await createSeedClient();

  // Don't reset the database - just insert our seed data
  // The database has already been reset by supabase db reset

  // Create users with passwords using service role
  console.log('🔐 Creating test users with passwords...')
  
  const supabaseUrl = 'http://localhost:54321'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // First, get or create the organization
    console.log('🏢 Setting up organization...')
    let organizationId: string
    
    const { data: existingOrg, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'crisis-management-solutions')
      .single()
    
    if (existingOrg) {
      organizationId = existingOrg.id
      console.log('✅ Using existing organization:', organizationId)
    } else {
      // Create organization if it doesn't exist
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Crisis Management Solutions',
          slug: 'crisis-management-solutions',
          description: 'Professional crisis management and training organization'
        })
        .select('id')
        .single()
      
      if (createOrgError) {
        console.error('Failed to create organization:', createOrgError)
        return
      }
      
      organizationId = newOrg.id
      console.log('✅ Created new organization:', organizationId)
    }

    // Create admin user
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'niels.vder.vlist@gmail.com',
      password: 'dropjes',
      email_confirm: true,
      user_metadata: { full_name: 'Niels van der Vlist' }
    })

    if (adminError) {
      console.error('Failed to create admin user:', adminError)
    } else {
      console.log('✅ Admin user created:', adminUser.user?.id)
    }

    // Create trainer user
    const { data: trainerUser, error: trainerError } = await supabase.auth.admin.createUser({
      email: 'sarah.johnson@crisismanagement.com',
      password: 'dropjes',
      email_confirm: true,
      user_metadata: { full_name: 'Sarah Johnson' }
    })

    if (trainerError) {
      console.error('Failed to create trainer user:', trainerError)
    } else {
      console.log('✅ Trainer user created:', trainerUser.user?.id)
    }

    // Create participant users
    const { data: participant1User, error: participant1Error } = await supabase.auth.admin.createUser({
      email: 'michael.chen@crisismanagement.com',
      password: 'dropjes',
      email_confirm: true,
      user_metadata: { full_name: 'Michael Chen' }
    })

    if (participant1Error) {
      console.error('Failed to create participant 1:', participant1Error)
    } else {
      console.log('✅ Participant 1 created:', participant1User.user?.id)
    }

    const { data: participant2User, error: participant2Error } = await supabase.auth.admin.createUser({
      email: 'emma.rodriguez@crisismanagement.com',
      password: 'dropjes',
      email_confirm: true,
      user_metadata: { full_name: 'Emma Rodriguez' }
    })

    if (participant2Error) {
      console.error('Failed to create participant 2:', participant2Error)
    } else {
      console.log('✅ Participant 2 created:', participant2User.user?.id)
    }

    // Now create profiles using Snaplet with organization_id
    console.log('👥 Creating user profiles...')
    await seed.profiles([
      {
        user_id: adminUser.user?.id,
        email: 'niels.vder.vlist@gmail.com',
        full_name: 'Niels van der Vlist',
        role: 'admin',
        email_verified: true,
        organization_id: organizationId,
      },
      {
        user_id: trainerUser.user?.id,
        email: 'sarah.johnson@crisismanagement.com',
        full_name: 'Sarah Johnson',
        role: 'trainer',
        email_verified: true,
        organization_id: organizationId,
      },
      {
        user_id: participant1User.user?.id,
        email: 'michael.chen@crisismanagement.com',
        full_name: 'Michael Chen',
        role: 'participant',
        email_verified: true,
        organization_id: organizationId,
      },
      {
        user_id: participant2User.user?.id,
        email: 'emma.rodriguez@crisismanagement.com',
        full_name: 'Emma Rodriguez',
        role: 'participant',
        email_verified: true,
        organization_id: organizationId,
      }
    ])

    // Create a test scenario with organization_id
    console.log('📋 Creating test scenario...')
    await seed.scenarios([
      {
        title: 'Facility Incident Response',
        description: 'A chemical spill has occurred at the main production facility. Emergency services are on scene and the situation requires immediate crisis management response.',
        crisis_type: 'industrial_accident',
        difficulty_level: 'intermediate',
        estimated_duration: 120,
        organization_id: organizationId,
        created_by: adminUser.user?.id,
      }
    ])

    // Create sample digital experiences
    console.log('💻 Creating sample digital experiences...')
    await seed.digital_experiences([
      {
        title: null,
        content: 'BREAKING: Major incident reported at the facility. Emergency services responding. Everyone please stay clear of the area. #CrisisResponse #SafetyFirst',
        metadata: {
          platform: 'Twitter',
          author_name: '@EmergencyAlert',
          urgency_level: 'critical'
        },
        trigger_time: 0,
      },
      {
        title: 'Chemical Spill Triggers Emergency Response at Industrial Facility',
        content: 'Local authorities have confirmed a significant chemical spill at the main production facility. Emergency services including hazmat teams are on scene. The incident occurred around 2:30 PM and has prompted an immediate evacuation of the surrounding area. Officials are urging residents to stay indoors and avoid the affected zone.',
        metadata: {
          platform: 'Local News',
          author_name: 'Jennifer Martinez',
          urgency_level: 'high'
        },
        trigger_time: 0,
      },
      {
        title: 'URGENT: Facility Incident - Immediate Action Required',
        content: 'Subject: URGENT - Facility Incident - Immediate Action Required\n\nTeam,\n\nWe have a developing situation at our main production facility. A chemical spill has been reported and emergency services are responding. This requires immediate crisis management activation.\n\nPlease:\n1. Activate your emergency response protocols\n2. Review the attached safety procedures\n3. Stand by for further instructions\n\nRegards,\nCrisis Management Team',
        metadata: {
          platform: 'Internal Email',
          author_name: 'Crisis Management Team',
          urgency_level: 'critical'
        },
        trigger_time: 0,
      }
    ])

    console.log("✅ Database seeded successfully with test users and sample data!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
  
  process.exit();
};

main().catch((error) => {
  console.error("❌ Error in main:", error);
  process.exit(1);
});