-- Create complete database schema for crisis management training platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table first (no dependencies)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (depends on organizations)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'trainer', 'participant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scenarios table (depends on organizations)
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(50) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  objectives TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_sessions table (depends on scenarios and organizations)
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_participants table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'participant' CHECK (role IN ('trainer', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Create digital_experiences table (depends on scenarios)
CREATE TABLE IF NOT EXISTS digital_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL CHECK (type IN ('social_media', 'news', 'email', 'phone_call', 'document')),
  content JSONB NOT NULL,
  trigger_time INTEGER NOT NULL DEFAULT 0,
  urgency_level VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participant_responses table (depends on sessions and experiences)
CREATE TABLE IF NOT EXISTS participant_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  experience_id UUID REFERENCES digital_experiences(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  response_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER CHECK (score >= 0 AND score <= 100)
);

-- Create session_analytics table (depends on sessions)
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for organizations
CREATE POLICY "Organization members can view organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Organization admins can update organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin' AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Admins can insert organizations" ON organizations
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for scenarios
CREATE POLICY "Organization members can view scenarios" ON scenarios
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Trainers and admins can manage scenarios" ON scenarios
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('trainer', 'admin') 
      AND organization_id IS NOT NULL
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_organization_id ON scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_organization_id ON training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON session_participants(user_id);
