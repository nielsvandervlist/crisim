-- Crisis Management Training SaaS Database Schema

-- Organizations table for multi-tenancy
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with role-based access
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'trainer', 'participant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  crisis_type VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in minutes
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training sessions/rounds
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participant assignments to training sessions
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_assignment VARCHAR(100), -- e.g., "Communications Lead", "Crisis Manager"
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);

-- Digital experience templates (mock social media, news, etc.)
CREATE TABLE IF NOT EXISTS digital_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('social_media', 'news_article', 'email', 'website', 'document')),
  platform VARCHAR(50), -- e.g., "Twitter", "Facebook", "CNN", "Internal Email"
  title VARCHAR(255),
  content TEXT NOT NULL,
  author_name VARCHAR(255),
  timestamp_offset INTEGER DEFAULT 0, -- minutes from session start
  is_template BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time inserts during training
CREATE TABLE IF NOT EXISTS session_inserts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  digital_experience_id UUID REFERENCES digital_experiences(id),
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  platform VARCHAR(50),
  author_name VARCHAR(255),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inserted_by UUID REFERENCES profiles(id)
);

-- Participant responses and actions
CREATE TABLE IF NOT EXISTS participant_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  response_type VARCHAR(50) NOT NULL CHECK (response_type IN ('message', 'decision', 'action', 'document')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false -- whether visible to other participants
);

-- Training analytics and scoring
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  response_time_avg INTEGER, -- average response time in seconds
  total_responses INTEGER DEFAULT 0,
  engagement_score DECIMAL(3,2), -- 0.00 to 1.00
  performance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_inserts ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for multi-tenant access
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Similar policies for other tables...
CREATE POLICY "Organization members can view scenarios" ON scenarios
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage scenarios" ON scenarios
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );
