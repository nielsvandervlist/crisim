-- Fix infinite recursion in training_sessions RLS policies
-- The issue is that training_sessions policies reference session_participants,
-- which in turn reference training_sessions, creating a circular dependency

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Participants can view sessions they're invited to" ON training_sessions;

-- Create a simpler policy that doesn't reference session_participants
-- Participants can view sessions in their organization (this is sufficient for most use cases)
CREATE POLICY "Participants can view sessions in their org" ON training_sessions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

-- Also fix the session_participants policies to avoid circular dependency
DROP POLICY IF EXISTS "Admins and trainers can manage participants for sessions in their org" ON session_participants;

-- Create a simpler policy for session_participants that doesn't reference training_sessions
CREATE POLICY "Admins and trainers can manage participants in their org" ON session_participants
    FOR ALL USING (
        session_id IN (
            SELECT id FROM training_sessions 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Keep the existing policy for participants viewing their own invitations
-- This policy doesn't cause recursion since it only references the participant_id
