-- Create profiles table with nullable organization_id for individual users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Can be NULL for individual users
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'participant', -- 'admin', 'trainer', 'participant'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (
        organization_id IS NOT NULL AND organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
