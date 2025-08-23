-- Create profiles table
-- This extends auth.users with business logic and organization membership

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255), -- Made nullable for flexibility during signup
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'trainer', 'participant')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(email)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for profiles table
-- Users can always view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

-- Users can always update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Users can always insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Organization admins can view profiles in their organization
-- This will be refined when we add more sophisticated RLS policies
CREATE POLICY "Organization admins can view org profiles" ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT id FROM organizations
        )
    );
