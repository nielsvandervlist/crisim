-- Create training_sessions table
-- This contains individual training session instances

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

-- Create indexes for performance
CREATE INDEX idx_training_sessions_organization_id ON training_sessions(organization_id);
CREATE INDEX idx_training_sessions_scenario_id ON training_sessions(scenario_id);
CREATE INDEX idx_training_sessions_created_by ON training_sessions(created_by);
CREATE INDEX idx_training_sessions_status ON training_sessions(status);
CREATE INDEX idx_training_sessions_start_time ON training_sessions(start_time);

-- Enable RLS (Row Level Security)
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Fixed RLS policies for training_sessions table
-- Users can always view sessions they created
CREATE POLICY "Users can view own sessions" ON training_sessions
    FOR SELECT USING (created_by = auth.uid());

-- Organization members can view sessions in their organization
CREATE POLICY "Organization members can view org sessions" ON training_sessions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

-- Organization admins and trainers can create sessions
CREATE POLICY "Admins and trainers can create sessions" ON training_sessions
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );

-- Organization admins and trainers can update sessions
CREATE POLICY "Admins and trainers can update sessions" ON training_sessions
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );

-- Organization admins and trainers can delete sessions
CREATE POLICY "Admins and trainers can delete sessions" ON training_sessions
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
        )
    );
