-- Create session_participants table
-- This tracks participants in training sessions

CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    role_assignment VARCHAR(50) NOT NULL DEFAULT 'participant',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, participant_id)
);

-- Create indexes for performance
CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_participant_id ON session_participants(participant_id);
CREATE INDEX idx_session_participants_status ON session_participants(status);
CREATE INDEX idx_session_participants_role_assignment ON session_participants(role_assignment);

-- Enable RLS (Row Level Security)
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for session_participants table
-- Participants can view their own session invitations
CREATE POLICY "Participants can view own invitations" ON session_participants
    FOR SELECT USING (participant_id = auth.uid());

-- Organization admins and trainers can view all participants in their sessions
CREATE POLICY "Admins and trainers can view participants" ON session_participants
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can create participant invitations
CREATE POLICY "Admins and trainers can create invitations" ON session_participants
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can update participant records
CREATE POLICY "Admins and trainers can update participants" ON session_participants
    FOR UPDATE USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can delete participant records
CREATE POLICY "Admins and trainers can delete participants" ON session_participants
    FOR DELETE USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );
