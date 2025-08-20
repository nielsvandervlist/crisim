-- Crisis Management Training Platform Database Schema

-- Organizations table (multi-tenant structure)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'participant', -- 'admin', 'trainer', 'participant'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scenario_type VARCHAR(100) NOT NULL, -- 'cybersecurity', 'natural_disaster', 'pr_crisis', etc.
    duration_minutes INTEGER DEFAULT 60,
    max_participants INTEGER DEFAULT 10,
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'active', 'paused', 'completed'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants table
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_role VARCHAR(100), -- 'communications_lead', 'incident_commander', etc.
    status VARCHAR(50) DEFAULT 'invited', -- 'invited', 'joined', 'completed'
    joined_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, participant_id)
);

-- Digital experiences table (mock social media, news, etc.)
CREATE TABLE IF NOT EXISTS digital_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    experience_type VARCHAR(100) NOT NULL, -- 'social_media', 'news_feed', 'email', 'internal_chat'
    platform_name VARCHAR(100), -- 'Twitter', 'Facebook', 'CNN', etc.
    content JSONB NOT NULL, -- Flexible content structure
    trigger_time_minutes INTEGER DEFAULT 0, -- When to show during training
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training rounds table (for structured training phases)
CREATE TABLE IF NOT EXISTS training_rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 15,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'completed'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time inserts table (dynamic content during training)
CREATE TABLE IF NOT EXISTS real_time_inserts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    round_id UUID REFERENCES training_rounds(id) ON DELETE CASCADE,
    insert_type VARCHAR(100) NOT NULL, -- 'breaking_news', 'social_post', 'email', 'phone_call'
    content JSONB NOT NULL,
    triggered_by UUID REFERENCES profiles(id), -- Trainer who triggered it
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_visible BOOLEAN DEFAULT true
);

-- Participant responses table
CREATE TABLE IF NOT EXISTS participant_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    round_id UUID REFERENCES training_rounds(id),
    response_type VARCHAR(100) NOT NULL, -- 'decision', 'communication', 'action'
    content JSONB NOT NULL,
    response_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session analytics table
CREATE TABLE IF NOT EXISTS session_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES profiles(id),
    metric_type VARCHAR(100) NOT NULL, -- 'response_time', 'decision_quality', 'communication_effectiveness'
    metric_value DECIMAL(10,2),
    metric_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_organization_id ON scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_organization_id ON training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_digital_experiences_scenario_id ON digital_experiences(scenario_id);
CREATE INDEX IF NOT EXISTS idx_training_rounds_session_id ON training_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_real_time_inserts_session_id ON real_time_inserts(session_id);
CREATE INDEX IF NOT EXISTS idx_participant_responses_session_id ON participant_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id);

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_inserts ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access data from their organization)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view scenarios in their organization" ON scenarios
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Trainers can manage scenarios in their organization" ON scenarios
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('trainer', 'admin')
        )
    );
