-- Complete Database Schema for Crisis Management Training Platform
-- This migration creates all tables with proper relationships and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'trainer', 'participant')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create scenarios table
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    crisis_type VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    estimated_duration INTEGER NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create digital experience types table
CREATE TABLE digital_experience_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table (training materials)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create digital experiences table
CREATE TABLE digital_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES digital_experience_types(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    trigger_time INTEGER DEFAULT 0, -- seconds from session start
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training sessions table
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session participants table
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id),
    role_assignment VARCHAR(50) NOT NULL DEFAULT 'participant',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'completed')),
    UNIQUE(session_id, participant_id)
);

-- Create participant responses table (analytics)
CREATE TABLE participant_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id),
    digital_experience_id UUID REFERENCES digital_experiences(id) ON DELETE CASCADE,
    response_type VARCHAR(50) NOT NULL DEFAULT 'reaction',
    response_content TEXT,
    reaction_time INTEGER, -- milliseconds
    response_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_scenarios_organization_id ON scenarios(organization_id);
CREATE INDEX idx_documents_scenario_id ON documents(scenario_id);
CREATE INDEX idx_digital_experiences_scenario_id ON digital_experiences(scenario_id);
CREATE INDEX idx_training_sessions_organization_id ON training_sessions(organization_id);
CREATE INDEX idx_training_sessions_scenario_id ON training_sessions(scenario_id);
CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_participant_id ON session_participants(participant_id);
CREATE INDEX idx_participant_responses_session_id ON participant_responses(session_id);
CREATE INDEX idx_participant_responses_participant_id ON participant_responses(participant_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_experience_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Organizations RLS Policies
CREATE POLICY "Organization admins can manage their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Organization members can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organization members can view other profiles in their org" ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

CREATE POLICY "Admins can view all profiles in their org" ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Scenarios RLS Policies
CREATE POLICY "Admins and trainers can manage scenarios in their org" ON scenarios
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );

CREATE POLICY "Participants can view scenarios they're invited to" ON scenarios
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT ts.scenario_id 
            FROM training_sessions ts
            JOIN session_participants sp ON ts.id = sp.session_id
            WHERE sp.participant_id = auth.uid()
        )
    );

-- Digital Experience Types RLS Policies (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view digital experience types" ON digital_experience_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Documents RLS Policies
CREATE POLICY "Admins and trainers can manage documents in their org" ON documents
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

CREATE POLICY "Participants can view documents for scenarios they're invited to" ON documents
    FOR SELECT USING (
        scenario_id IN (
            SELECT DISTINCT ts.scenario_id 
            FROM training_sessions ts
            JOIN session_participants sp ON ts.id = sp.session_id
            WHERE sp.participant_id = auth.uid()
        )
    );

-- Digital Experiences RLS Policies
CREATE POLICY "Admins and trainers can manage experiences in their org" ON digital_experiences
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

CREATE POLICY "Participants can view experiences for scenarios they're invited to" ON digital_experiences
    FOR SELECT USING (
        scenario_id IN (
            SELECT DISTINCT ts.scenario_id 
            FROM training_sessions ts
            JOIN session_participants sp ON ts.id = sp.session_id
            WHERE sp.participant_id = auth.uid()
        )
    );

-- Training Sessions RLS Policies
CREATE POLICY "Admins and trainers can manage sessions in their org" ON training_sessions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );

CREATE POLICY "Participants can view sessions they're invited to" ON training_sessions
    FOR SELECT USING (
        id IN (
            SELECT session_id FROM session_participants 
            WHERE participant_id = auth.uid()
        )
    );

-- Session Participants RLS Policies
CREATE POLICY "Admins and trainers can manage participants for sessions in their org" ON session_participants
    FOR ALL USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

CREATE POLICY "Participants can view their own invitations" ON session_participants
    FOR SELECT USING (participant_id = auth.uid());

-- Participant Responses RLS Policies
CREATE POLICY "Admins and trainers can view all responses in their org" ON participant_responses
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

CREATE POLICY "Participants can view their own responses" ON participant_responses
    FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Participants can insert their own responses" ON participant_responses
    FOR INSERT WITH CHECK (participant_id = auth.uid());

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default digital experience types
INSERT INTO digital_experience_types (name, description) VALUES
    ('social_media', 'Social media posts (Facebook, Twitter, etc.)'),
    ('news', 'News articles and media coverage'),
    ('email', 'Email communications'),
    ('video', 'Video content and broadcasts'),
    ('phone_call', 'Phone call transcripts'),
    ('document', 'Official documents and reports'),
    ('sms', 'Text messages and SMS'),
    ('press_release', 'Press releases and official statements');

-- Create a default organization
INSERT INTO organizations (name, slug, description) 
VALUES ('Default Organization', 'default-org', 'Default organization for the crisis management training platform');
