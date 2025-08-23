-- Create scenarios table
-- This contains crisis scenarios for training

CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    crisis_type VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER NOT NULL, -- in minutes
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_scenarios_organization_id ON scenarios(organization_id);
CREATE INDEX idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX idx_scenarios_crisis_type ON scenarios(crisis_type);
CREATE INDEX idx_scenarios_difficulty_level ON scenarios(difficulty_level);

-- Enable RLS (Row Level Security)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for scenarios table
-- Organization members can view scenarios in their organization
CREATE POLICY "Organization members can view scenarios" ON scenarios
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

-- Organization admins and trainers can create scenarios
CREATE POLICY "Admins and trainers can create scenarios" ON scenarios
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );

-- Organization admins and trainers can update scenarios
CREATE POLICY "Admins and trainers can update scenarios" ON scenarios
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );

-- Organization admins and trainers can delete scenarios
CREATE POLICY "Admins and trainers can delete scenarios" ON scenarios
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );
