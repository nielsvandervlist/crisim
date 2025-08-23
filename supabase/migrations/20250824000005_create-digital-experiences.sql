-- Create digital_experiences table
-- This contains individual digital experiences within scenarios

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

-- Create indexes for performance
CREATE INDEX idx_digital_experiences_scenario_id ON digital_experiences(scenario_id);
CREATE INDEX idx_digital_experiences_type_id ON digital_experiences(type_id);
CREATE INDEX idx_digital_experiences_created_by ON digital_experiences(created_by);
CREATE INDEX idx_digital_experiences_trigger_time ON digital_experiences(trigger_time);

-- Enable RLS (Row Level Security)
ALTER TABLE digital_experiences ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for digital_experiences table
-- Organization members can view experiences for scenarios in their organization
CREATE POLICY "Organization members can view experiences" ON digital_experiences
    FOR SELECT USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND organization_id IS NOT NULL
            )
        )
    );

-- Organization admins and trainers can create experiences
CREATE POLICY "Admins and trainers can create experiences" ON digital_experiences
    FOR INSERT WITH CHECK (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can update experiences
CREATE POLICY "Admins and trainers can update experiences" ON digital_experiences
    FOR UPDATE USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can delete experiences
CREATE POLICY "Admins and trainers can delete experiences" ON digital_experiences
    FOR DELETE USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );
