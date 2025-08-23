-- Create participant_responses table
-- This tracks user responses during training sessions

CREATE TABLE participant_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    digital_experience_id UUID NOT NULL REFERENCES digital_experiences(id) ON DELETE CASCADE,
    response_content TEXT,
    response_metadata JSONB DEFAULT '{}',
    response_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, participant_id, digital_experience_id)
);

-- Create indexes for performance
CREATE INDEX idx_participant_responses_session_id ON participant_responses(session_id);
CREATE INDEX idx_participant_responses_participant_id ON participant_responses(participant_id);
CREATE INDEX idx_participant_responses_digital_experience_id ON participant_responses(digital_experience_id);
CREATE INDEX idx_participant_responses_response_time ON participant_responses(response_time);

-- Enable RLS (Row Level Security)
ALTER TABLE participant_responses ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for participant_responses table
-- Participants can view their own responses
CREATE POLICY "Participants can view own responses" ON participant_responses
    FOR SELECT USING (participant_id = auth.uid());

-- Participants can insert their own responses
CREATE POLICY "Participants can insert own responses" ON participant_responses
    FOR INSERT WITH CHECK (participant_id = auth.uid());

-- Organization admins and trainers can view all responses in their organization
CREATE POLICY "Admins and trainers can view responses" ON participant_responses
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can update responses (for corrections, etc.)
CREATE POLICY "Admins and trainers can update responses" ON participant_responses
    FOR UPDATE USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can delete responses
CREATE POLICY "Admins and trainers can delete responses" ON participant_responses
    FOR DELETE USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );
